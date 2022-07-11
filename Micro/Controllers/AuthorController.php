<?php
/**
 * Created by PhpStorm.
 * User: Mike
 * Date: 15/02/2019
 * Time: 23:38
 */

namespace API\Controllers;

use DateTime;

use Imagick;
use API\Interfaces\RenderInterface;
use API\Interfaces\ResourceInterface;
use API\Interfaces\RouterInterface;
use API\Core\App\Controller;
use API\Core\Utils\Mailer;
use API\Core\Session\Session;
use API\Core\Utils\AppCrypt;
use API\Core\Utils\CaptchaGen;
use API\Core\Utils\FormBuilder;
use API\Core\Utils\Logger;
use API\Core\Utils\Validator;
use API\Models\AppUser;
use API\Repository\AuthModelRepository;

use GuzzleHttp\Psr7\Response;
use ImagickDrawException;
use ImagickException as ImagickExceptionAlias;
use JetBrains\PhpStorm\NoReturn;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use RuntimeException;

class AuthorController extends Controller implements ResourceInterface
{

    /**
     * @var AuthModelRepository
     */
    private AuthModelRepository $conn;
    /**
     * @var FormBuilder
     */
    private FormBuilder $builder;

    /**
     * @var AppUser
     */
    private AppUser $user;

    public function __construct(
        RouterInterface $router,
        RenderInterface $render,
        Validator $validator,
        FormBuilder $builder,
        AuthModelRepository $conn
    )
    {
        parent::__construct($router, $render);
        $this->router = $router;
        $this->render = $render;
        $this->validator = $validator;
        $this->builder = $builder;
        $this->conn = $conn;
        $this->user = new AppUser();

        $this->router->resource('/api/auth', $this, 'authUserService', INTEGER, true);
        $this->router->get('/api/auth/resetPass', [$this, 'showPassCallBack'], 'authUserService.showPassCallBack');
        $this->router->get('/api/auth/validatePassCallBack', [$this, 'validatePassCallBack'], 'authUserService.validatePassCallBack');
        $this->router->get('/api/auth/resetPassNoMail', [$this, 'resetPassNoMail'], 'authUserService.resetPassNoMail');
        $this->router->post('/api/auth/resetCaptcha', [$this, 'resetCaptcha'], 'authUserService.resetCaptcha');
        $this->router->post('/api/auth/authorize', [$this, 'authorize'], 'authUserService.authorizeUser');
        $this->router->post('/api/auth/resetPassword', [$this, 'resetPassword'], 'authUserService.resetPassword');
        $this->router->post('/api/auth/confirmNewPass', [$this, 'confirmNewPass'], 'authUserService.confirmNewPass');
        $this->router->get('/api/auth/avatarCrop/:id', [$this, 'userAvatarCrop'], 'authUserService.userAvatarCrop')
            ->with('id', INTEGER)
            ->middleware(['AuthorMiddleware']);
        $this->router->post("/api/auth/avatarCrop", [$this, 'avatarCrop'], 'authUserService.avatarCrop');
        $this->router->post("/api/auth/confirmAvatarCrop", [$this, 'confirmAvatarCrop'], 'authUserService.confirmAvatarCrop');
        $this->router->get('/api/auth/reset', [$this, 'endSession'], 'authUserService.clearSession');
        $this->router->get('/dumper', [$this, 'dumper'], 'authUserService.dumper');
        $this->router->post('/api/auth/unique-email', [$this, 'validateUniqueEmail'], 'authUserService.validateUniqueEmail');
        $this->router->post('/api/auth/unique-user', [$this, 'validateUniqueUserName'], 'authUserService.validateUniqueUserName');
        $this->router->post('/api/auth/validate-captcha', [$this, 'validateCaptcha'], 'authUserService.validateCaptcha');
        $this->router->post('/api/auth/validate-registered-email', [$this, 'validateEmailRegistered'], 'authUserService.validateEmailRegistered');
        $this->router->get('/user-date-dif', [$this, 'userDateDif'], 'authUserService.userDateDif');
    }


    public function index(ServerRequestInterface $request, ResponseInterface $response): Response
    {
        $template = (string)$this->builder->buildLogIn();
        $data = $this->resolveRedirectData([
            'oldData',
            'errors',
        ]);

        if (empty(json_decode($data['oldData']))) {
            $remember = AuthorController::getRememberCookie($request);
            if ($remember) {
                $data['oldData'] = $remember['oldData'];
            }
        }
        $data['pageScript'] = 'js/authLog.min.js';
        $data['pageCSS'] = 'css/authLog.min.css';
        $data['formTemplate'] = $template;
        $data['isLogIn'] = true;
        $view = (string)$this->render->render("Auth/authForm", $data);
        $response->getBody()->write($view);
        return $response->withHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    }

    /**
     */
    public function create(ServerRequestInterface $request, ResponseInterface $response): Response
    {
        $captcha = CaptchaGen::generate();
        $data['captcha'] = $captcha->image;
        $view = (string)$this->render->render('Auth/register', $data);
        $response->getBody()->write((string)$view);
        return $response;
    }

    public function authorize(ServerRequestInterface $request) : Response
    {
        $this->validator->init($request);

        if ($this->validator->fetch('recover')) {

            if ($this->validator->fetch('email')) {
                $this->validator->field('email')->rule('checkEmail');
                $this->validator->field('email')->rule('checkIfRegisteredUser');
                $validated = $this->validator->validate();

                if ($validated) {
                    AuthorController::sendResetPassMail();
                    Session::unsetKey('REDIRECT_DATA');
                    $payload = [];
                } else {
                    $payload = [
                        'oldData' => $this->validator->fetchAll(),
                        'errors' => $this->validator->fetchErrors(),
                    ];
                }
                return $this->handleResponse(
                    $request,
                    $validated,
                    $payload,
                    $this->router->generateURI('Micro.index')
                );
            } else {
                Session::unsetKey('REDIRECT_DATA');
                $payload = [];
                return $this->handleResponse(
                    $request,
                    false,
                    $payload,
                    $this->router->generateURI('authUserService.resetPassNoMail', [])
                );
            }
        }

        $this->validator->field('email')->rule('checkIfRegisteredUser');
        $this->validator->field('email')->rule('checkEmail');
        $this->validator->field('pass')->rule('notEmpty');
        $this->validator->field('pass')->rule('securePass');

        $validated = $this->validator->validate();
        $this->user = AuthorController::buildUserAuthCheck();
        $user_id = $this->conn->validate($this->user);

        if ($validated && $user_id > 0) {
            $user = $this->conn->getUserByID($user_id);
            AuthorController::setRememberCookie();
            AuthorController::setKeepMeLoggedCookie();
            AuthorController::updateLastLogged($user);
            Session::unsetKey('REDIRECT_DATA');
            $payload = [];
            $this->setFlashCookie([
                'type' => 'success',
                'title' => 'LogIn Result',
                'message' => 'Last LogIn was , ' . $user->getId() . ' - ' .$user->getEmail(),
            ]);
            Session::updateLogged($user);
            Logger::log('USER AUTHORIZED');
        } else {
            $payload = [
                'oldData' => $this->validator->fetchAll(),
                'errors' => $this->validator->fetchErrors(),
            ];
            $this->setFlashCookie([
                'type' => 'error',
                'title' => 'Credentials Mismatch',
                'message' => 'You credentials dont match the database. ',
            ]);
        }
        return $this->handleResponse(
            $request,
            $user_id > 0,
            $payload,
            $user_id > 0 ? Session::get('LAST_INTENT') : $this->router->generateURI('authUserService.index', [])
        );
    }

    public function setFlashCookie($cookie)
    {
        $appCookie = json_encode([
            'type' => $cookie['type'],
            'title' => rawurlencode($cookie['title']),
            'message' => rawurlencode($cookie['message']),
        ]);
        setcookie(
            'microFlash',
            "{$appCookie}",
            time() + 3,
            '/'
        );

    }

    public function store(ServerRequestInterface $request) : Response
    {
        $payload = [];
        $human = unserialize(Session::get('captcha'));
        $result = false;

        $this->validator->init($request);
        # Set validation rules
        $this->validator->field('name')->rule('minLength')->val(4);
        $this->validator->field('email')->rule('checkEmail');
        $this->validator->field('email')->rule('checkIfUniqueEmail');
        $this->validator->field('pass')->rule('securePass');
        $this->validator->field('cPass')->rule('equalTo')->val(
            ($this->validator->fetch('pass')) ? $this->validator->fetch('pass') : '#'
        );
        $this->validator->field('captcha')->rule('notEmpty');
        $this->validator->field('captcha')->rule('minLength')->val(8);
        $this->validator->field('captcha')->rule('equalTo')->val($human->text);
        if (!$this->validator->fetch('agree')) {
            $this->validator->set('agree', '');
        }
        $this->validator->field('agree')->rule('checked')->val("on");
        $validated = $this->validator->validate();

        if ($validated) {
            $this->user = AuthorController::buildUserObject();
            $result = $this->conn->registerNewUser($this->user);
            if ($result) {
                AuthorController::setDefaultPubAvatar($result);
                AuthorController::setRememberCookie();
                $this->conn->validate($this->user);
                $result = true;
                Session::unsetKey('REDIRECT_DATA');
                $payload = [];
                $this->setFlashCookie([
                    'type' => 'success',
                    'title' => 'Site Registration',
                    'message' => 'You Registration was successful. Welcome ' . $this->user->getEmail(),
                ]);
            }
        } else {
            $payload = [
                'oldData' => $this->validator->fetchAll(),
                'errors' => $this->validator->fetchErrors(),
                'captcha' => $human->image
            ];
            $this->setFlashCookie([
                'type' => 'error',
                'title' => 'Site Registration',
                'message' => 'Your data is incorrect, review to complete registration ',
            ]);
        }
        # Return Results
        return $this->handleResponse(
            $request,
            $result,
            $payload,
            $result ? Session::get('LAST_INTENT') : $this->router->generateURI('authUserService.create', [])
        );
    }

    public function show(ServerRequestInterface $request, ResponseInterface $response): Response
    {
        $params = $request->getAttribute('PARAMS');
        extract($params);
        /**@var string $id */

        /**@var $user AppUser */
        $user = $this->conn->getUserByID($id);

        $view = (string)$this->render->render("Auth/dashboard", [
            'id' => $id,
            'user' => $user,
            'app_path' => APP_ASSET_BASE
        ]);
        $response->getBody()->write((string)$view);
        /**@var $response Response */
        return $response;
    }
    public function update(ServerRequestInterface $request) : void
    {
        $params = $request->getAttribute('PARAMS');
        extract($params);
        /**@var string $id */
        dump($request->getParsedBody());
        die("UPDATE " . $id);
//        $view = (string)$this->render->render("Auth/dashboard", ['id'=>$id]);
//        $response->getBody()->write((string)$view);
//        /**@var $response Response */
//        return $response;
    }
    public function destroy(ServerRequestInterface $request) : void
    {
        $params = $request->getAttribute('PARAMS');
        extract($params);
        /**@var string $id */

        dump($request->getParsedBody());
        die("DESTROY " . $id);
//        $view = (string)$this->render->render("Auth/dashboard", ['id' => $id]);
//        $response->getBody()->write((string)$view);
//        /**@var $response Response */
//        return $response;
    }
    public function sendResetPassMail(): bool
    {
        $this->user = new AppUser();
        $this->user->setEmail($this->validator->fetch('email'));
        $crafted = AppCrypt::GetInstance()->crypt($this->validator->fetch('email') . '::' . (time() + 60 * 60 * 24));
        $this->user->setRpToken($crafted);
        $this->user->setSecret(AppCrypt::randomString(8));
        $this->user = $this->conn->setUserRecoveryToken($this->user);
        $mail = (object)[
            'to' => $this->user->getEmail(),
            'subject' => 'microPHP Password Reset',
            'userName' => $this->user->getName(),
            'urlToken' => APP_ASSET_BASE . trim($this->router->generateURI('authUserService.validatePassCallBack', []), '/') . "?tk=" . $this->user->getRpToken(),
            'userSecret' => $this->user->getSecret()
        ];
        Mailer::sendMultipartMail($mail);
        $this->setFlashCookie([
            'type' => 'success',
            'title' => 'Password Recovery',
            'message' => 'An email was sent, click the link to  change your password ',
        ]);
        return true;
    }
    public function resetPassNoMail(ServerRequestInterface $request, ResponseInterface $response): Response
    {
        $data = $this->resolveRedirectData([
            'oldData',
            'errors',
        ]);
        $template = (string)$this->builder->buildRecoverNoPass();
        $data['pageScript'] = 'js/resetPassNoMail.min.js';
        $data['pageCSS'] = 'css/resetPassNoMail.min.css';
        $data['formTemplate'] = $template;
        $view = (string)$this->render->render("Auth/authForm", $data);
        $response->getBody()->write($view);
        /**@var $response Response */
        return $response;
    }
    public function validatePassCallBack(ServerRequestInterface $request, ResponseInterface $response): Response
    {
        $rToken = null;
        $mailToRecover = null;
        $this->validator->init($request);
        if (!$this->validator->fetch('tk')) {
            return (new Response())
                ->withStatus(401)
                ->withHeader('Location', $this->router->generateURI('Micro.index', []));
        }
        $tk = AppCrypt::getInstance()->decrypt($this->validator->fetch('tk'));
        list($token, $expire) = explode('::', $tk);
        if (time() > $expire) {
            $this->user->setRpToken($this->validator->fetch('tk'));
            $this->conn->resetReplyToken($this->user);

            $response = new Response();
            return $response
                ->withStatus(401)
                ->withHeader('Location', $this->router->generateURI('IndexController.index', []));
        }

        $this->user->setRpToken($this->validator->fetch('tk'));
        $this->user = $this->conn->checkRecoveryToken($this->user);

        if ($this->user) {
            // Set validation items on Session
            Session::set('PASS_RESET', $this->user->getRpToken());
            Session::set('RESET_SECRET', $this->user->getSecret());

            $response = new Response();
            // Show Validation Form
            return $response
                ->withStatus(200)
                ->withHeader('Location', $this->router->generateURI('authUserService.showPassCallBack', []));
        }
        # TODO Message: Token not Authorized.
        return (new Response())
            ->withStatus(401)
            ->withHeader('Location', $this->router->generateURI('IndexController.index', []));

    }
    public function resetPassword(ServerRequestInterface $request) : Response
    {
        $this->validator->init($request);
        $this->validator->field('email')->rule('ValidEMail');
        $this->validator->field('email')->rule('CheckIfRegisteredUser');

        $validated = $this->validator->validate();
        if ($validated) {
            AuthorController::sendResetPassMail();
            Session::unsetKey('REDIRECT_DATA');
            $payload = [];
        } else {
            $payload = [
                'oldData' => $this->validator->fetchAll(),
                'errors' => $this->validator->fetchErrors()
            ];
        }
        return $this->handleResponse(
            $request,
            $validated,
            $payload,
            $validated ? Session::get('LAST_INTENT') : $this->router->generateURI('authUserService.resetPassNoMail', [])
        );
    }
    public function showPassCallBack(ServerRequestInterface $request, ResponseInterface $response): Response
    {
        $data = $this->resolveRedirectData([
            'oldData',
            'errors',
        ]);
        $template = $this->builder->buildConfirmResetPass();
        $data['pageScript'] = 'js/userResetPass.min.js';
        $data['pageCSS'] = 'css/userResetPass.min.css';
        $data['formTemplate'] = $template;
        $view = (string)$this->render->render("Auth/authForm", $data);
        /**@var $response Response */
        $response->getBody()->write($view);
        return $response;
    }
    public function confirmNewPass(ServerRequestInterface $request) : Response
    {
        $this->validator->init($request);

        $this->validator->field('r_code')->rule('notEmpty');
        $this->validator->field('r_code')->rule('equalTo')->val(Session::get('RESET_SECRET'));

        $this->validator->field('pass')->rule('notEmpty');
        $this->validator->field('pass')->rule('securePass');

        $this->validator->field('cPass')->rule('notEmpty');
        $this->validator->field('cPass')->rule('equalTo')->val($this->validator->fetch('pass'));

        $validated = $this->validator->validate();

        if ($validated) {
            $this->user->setRpToken(Session::get('PASS_RESET'));
            $this->user->setPass(AppCrypt::hashFactory($this->validator->fetch('pass')));
            $this->user->setEdited(strtotime(date("Y-m-d H:i:s")));
            $this->conn->updateUserPass($this->user);
            Session::unsetKey('REDIRECT_DATA');
            $payload = [];

            $this->setFlashCookie([
                'type' => 'success',
                'title' => 'Password Reset',
                'message' => 'Your password was changed successfully ',
            ]);
        } else {
            $payload = [
                'oldData' => $this->validator->fetchAll(),
                'errors' => $this->validator->fetchErrors(),
            ];
            $this->setFlashCookie([
                'type' => 'error',
                'title' => 'Password Reset',
                'message' => 'Your password was not changed, correct to continue ',
            ]);
        }
        return $this->handleResponse(
            $request,
            $validated,
            $payload,
            $validated ? Session::get('LAST_INTENT') : $this->router->generateURI('authUserService.showPassCallBack', [])
        );
    }
    public function checkUserCookie()
    {
        if ($this->validator->fetch('rme')) {
            $userMailCrypt = AppCrypt::getInstance()->crypt($this->validator->fetch('email'));
            $userPassCrypt = AppCrypt::getInstance()->crypt($this->validator->fetch('pass'));
            $cookie = "{$userMailCrypt}::{$userPassCrypt}";
            Logger::log("SETTING COOKIE " . $cookie);
            setcookie('rme', $cookie, time() + (86400 * 7)); // 86400 = 1 day
        } else {
            setcookie('rme', '', time() - 3600); // Expired
        };
    }
    private function buildUserAuthCheck(): AppUser
    {
        return $this->user
            ->setEmail($this->validator->fetch('email'))
            ->setPass(AppCrypt::hashFactory($this->validator->fetch('pass')));
    }
    private function buildUserObject(): AppUser
    {
        return $this->user
            ->setName($this->validator->fetch('name'))
            ->setEmail($this->validator->fetch('email'))
            ->setCreated(strtotime(date("Y-m-d H:i:s")))
            ->setEdited(strtotime(date("Y-m-d H:i:s")))
            ->setLastLogged(strtotime(date("Y-m-d H:i:s")))
            ->setPass(AppCrypt::hashFactory($this->validator->fetch('pass')))
            ->setAvatar('default_avatar.png')
            ->setLanguageActive($this->validator->fetch('language'))
            ->setIdentifier(AppCrypt::generateIdentifier($this->validator->fetch('name')))
            ->setIdPass(AppCrypt::getInstance()->crypt($this->validator->fetch('pass')));
    }
    private function getRememberCookie(ServerRequestInterface $request): ?array
    {
        if (!isset($request->getCookieParams()['rme'])) {
            return null;
        }
        $cookie = $request->getCookieParams()['rme'];
        $user = urldecode($cookie);
        Logger::log("RME => " . $user);
        $user_data = explode("::", $user);
        $data['oldData'] = json_encode([
            'email' => AppCrypt::getInstance()->decrypt($user_data[0]),
            'pass' => AppCrypt::getInstance()->decrypt($user_data[1]),
            'rme' => 'on',
        ]);
        $data['errors'] = json_encode([]);
        return $data;
    }
    private function setRememberCookie()
    {
        if ($this->validator->fetch('rme')) {
            $userMailCrypt = AppCrypt::getInstance()->crypt($this->validator->fetch('email'));
            $userPassCrypt = AppCrypt::getInstance()->crypt($this->validator->fetch('pass'));
            $cookie = "{$userMailCrypt}::{$userPassCrypt}";
            Logger::log("SETTING COOKIE " . $cookie);
            setcookie('rme', json_encode($cookie), time() + (86400 * 7), '/'); // 86400 = 1 day
        } else {
            setcookie('rme', '', time() - 3600, '/'); // Expired
        };
    }
    private function setKeepMeLoggedCookie(): void
    {
        if ($this->validator->fetch('authLog')) {
            $this->user->setId(Session::loggedUserID());
            $this->user->setToken(AppCrypt::generateToken());
            $this->user->setTimeout(time() + 60 * 60 * 24 * 7);
            $this->user = $this->conn->updateUserToken($this->user);
            setcookie(
                'micro',
                "{$this->user->getIdentifier()}:{$this->user->getToken()}",
                time() + 60 * 60 * 24 * 7,
                '/'
            );
            return;
        }
    }
    public function updateLastLogged(AppUser $user): void
    {
        $this->conn->updateLastLogged($user->getId());
    }
    public static function setDefaultPubAvatar($id)
    {
        if (!file_exists(APP_STORAGE_USER)) {
            mkdir(APP_STORAGE_USER, 0777, true);
        }

        $target_folder = APP_STORAGE_USER . "user_" . $id;

        if (!file_exists($target_folder)) {
            mkdir($target_folder, 0777);
        }
        chmod($target_folder, 0777);
        copy(DEF_AVATAR_PATH . "default_avatar.png", $target_folder . "/default_avatar.png");
    }
    public function userAvatarCrop(ServerRequestInterface $request, ResponseInterface $response): Response
    {
        $params = $request->getAttribute('PARAMS');
        extract($params);
        /**@var string $id */

        $view = (string)$this->render->render("Auth/userAvatar", ['id' => $id]);
        $response->getBody()->write((string)$view);
        /**@var $response Response */
        return $response;
    }
    /**
     */
    public function avatarCrop(ServerRequestInterface $request, ResponseInterface $response): Response
    {
        if (!isset($_FILES['image']['error']) || is_array($_FILES['image']['error'])) {
            throw new RuntimeException('No Files On Request.');
        }
        $output = imagecreatefromjpeg($_FILES['image']['tmp_name']);
        $left = $request->getParsedBody()["left"];
        $top = $request->getParsedBody()["top"];
        $width = $request->getParsedBody()["width"];
        $height = $request->getParsedBody()["height"];
        $newAvatar = imagecreatetruecolor($width, $height);
        try {
            $source_copy_result = imagecopy($newAvatar, $output, 0, 0, $left, $top, $width, $height);
            if (!$source_copy_result) {
                $error = "Can´t crop the selected image....";
                throw new \Exception($error);
            }
        } catch (\Exception $e) {
            echo json_encode([
                "result" => "error",
                "dataUri" => ""
            ]);
            exit();
        }

        ob_start();
        imagejpeg($newAvatar);
        $buffer = ob_get_clean();
        ob_end_clean();

//        $src1 = null;
//        try {
//            $src1 = new \Imagick();
//        } catch (ImagickExceptionAlias $e) {
//        }
//        try {
//            $src1->readImageBlob($buffer);
//        } catch (ImagickExceptionAlias $e) {
//        }
//        $src2 = null;
//        try {
//            $src2 = new Imagick(AVATAR_FILTER_PATH);
//        } catch (ImagickExceptionAlias $e) {
//            die("Cant read MASK_IMAGE");
//        }
//        $src1->compositeImage($src2, Imagick::COMPOSITE_COPYOPACITY, 0, 0);
//        $src1->setImageFormat('png');
//
//        $imgBuff = $src1->getimageblob();
        $dataUri = "data:image/png;base64," . base64_encode($buffer);
//
//        unset($output);
//        unset($newAvatar);
//        unset($contents);
//        $src1->clear();
//        $src2->clear();

        $response = new Response();
        $response->getBody()->write(json_encode([
            "result" => "ok",
            "dataUri" => $dataUri
        ]));
        return $response
            ->withStatus(200)
            ->withHeader('Content-Type', 'application/json');
    }
    public function confirmAvatarCrop(ServerRequestInterface $request): Response
    {
        $userAvatar = uniqid() . '.png';
        $base_path = APP_STORAGE_USER;
          $path = "user_{$request->getParsedBody()["user"]}/";
        $oldAvatar = $request->getParsedBody()["old_avatar"];

        unlink($base_path . $path . $oldAvatar);

        $file_name = $base_path . $path . $userAvatar;
        $handle = fopen($file_name, "wb");
        $data = explode(',', $request->getParsedBody()["dataUri"]);
        fwrite($handle, base64_decode($data[1]));
        fclose($handle);

        $updated = $this->conn->updateAvatarDBFile($request->getParsedBody()["user"], $userAvatar);
        $user_data = $this->conn->getUserByID($request->getParsedBody()["user"]);
        Session::updateLogged($user_data);
        $this->setFlashCookie([
            'type' => 'success',
            'title' => 'Avatar Update',
            'message' => 'You avatar was successfully updated. ' . $user_data->getEmail(),
        ]);
        $response = new Response();
        $response->getBody()->write(json_encode([
            'target' => "{$base_path}{$path}{$userAvatar}",
            'updated' => $updated
        ]));
        return $response
            ->withStatus(200)
            ->withHeader('Content-Type', 'application/json');
    }
    public function resetCaptcha(): Response
    {
        $captcha = CaptchaGen::generate();
        $response = new Response();
        $response->getBody()->write(json_encode(['image' => $captcha->image]));
        return $response;
    }
    public function endSession() : Response
    {
        Logger::log('Start Closing Session....');
        Session::destroy();
        Logger::log('Session Closed');
        setcookie('micro', 'DELETED!', time() - 3600, '/');
        return (new Response())
            ->withStatus(200)
            ->withHeader('Location', APP_ASSET_BASE);
    }
    public function validateEmailRegistered(ServerRequestInterface $request, ResponseInterface $response): Response
    {
//            $params = $request->getAttribute('PARAMS');
//            extract($params);
//            /**@var string $email */

        $user = new AppUser();
        $user->setEmail($request->getParsedBody()['email']);
        $valid = $this->conn->checkIfUniqueEmail($user);
        $response->getBody()->write(json_encode([
            'valid' => $valid === 'EMAIL_IN_USE',
            'message' => 'The email is not registered'
        ]));
        /**@var $response Response */
        return $response;
    }
    public function validateUniqueEmail(ServerRequestInterface $request, ResponseInterface $response): Response
    {
//            $params = $request->getAttribute('PARAMS');
//            extract($params);
//            /**@var string $email */

        $user = new AppUser();
        $user->setEmail($request->getParsedBody()['email']);
        $valid = $this->conn->checkIfUniqueEmail($user);
        $response->getBody()->write(json_encode([
            'valid' => $valid === 'EMAIL_IN_USE' ? false : true,
            'message' => 'The email is already taken'
        ]));

        /**@var $response Response */
        return $response;
    }
    public function validateUniqueUserName(ServerRequestInterface $request, ResponseInterface $response): Response
    {
        $user = new AppUser();
        $user->setName($request->getParsedBody()['userName']);
        $valid = $this->conn->checkIfUniqueUserName($user);

        $response->getBody()->write(json_encode([
            'valid' => $valid === 'USER_NAME_REGISTERED' ? false : true,
            'message' => 'The UserName is already taken'
        ]));

        /**@var $response Response */
        return $response;
    }
    public function validateCaptcha(ServerRequestInterface $request, ResponseInterface $response): Response
    {
        $human = unserialize(Session::get('captcha'));
        $response->getBody()->write(json_encode([
            'valid' => $request->getParsedBody()['captcha'] === $human->text,
            'message' => "The typed text does not match the image"
        ]));
        /**@var $response Response */
        return $response;
    }
    public function userDateDif (ServerRequestInterface $request, ResponseInterface $response) : Response
        {
//            $params = $request->getAttribute('PARAMS');
//            extract($params);
//            /**@var string $x */

        $users = $this->conn->getAll();
            $view = (string)$this->render->render("rawHtml", ['users' => $users]);
    		$response->getBody()->write((string)$view);
            /**@var $response Response */
            return $response;
        }	
    public function edit(ServerRequestInterface $request, ResponseInterface $response): Response
    {
        // TODO: Implement edit() method.
        /** @var $response Response */
        return $response;
    }
}

<?php


namespace API\Middleware;


ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

use API\Core\Utils\Logger;
use API\Interfaces\RouterInterface;
use API\Core\Session\Session;
use GuzzleHttp\Psr7\Response;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class AuthorMiddleware implements MiddlewareInterface
{

    private RouterInterface $router;
    private string $authorService;
    private array $ignoredMethods;

    public function __construct(RouterInterface $router, string $authorService, array $ignoredMethods)
    {
        $this->router = $router;
        $this->authorService = $router->generateURI($authorService.'.index', []);
        foreach ($ignoredMethods as $method) {
            $this->ignoredMethods[] = $router->generateURI($authorService.'.'.$method, []);
        }
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        if (Session::get('REDIRECTED')) {
            Session::unsetKey('REDIRECTED');
            return $handler->handle($request);
        }


        if (in_array($request->getUri()->getPath(),  ['/api/auth','/api/auth/create'])) {
            return $handler->handle($request);
        }
        if (!Session::loggedUser()) {
            $appCookie = json_encode([
                'type' => 'warning',
                'title' => rawurlencode('Not allowed'),
                'message' => rawurlencode('You have to log in To Access this page'),
            ]);
            setcookie(
                'microFlash',
                "{$appCookie}",
                time() + 3,
                '/'
            );
            Session::set('REDIRECTED', true);
            /**@var $response ResponseInterface */
            $response = new Response();
            return $response->withHeader('Location', $this->router->generateURI('authUserService.index'))
                ->withStatus(301);
        } else {
            if ($this->checkLoggedUserPermissions($request)) {
                return $handler->handle($request);
            } else {
                $appCookie = json_encode([
                    'type' => 'error',
                    'title' => rawurlencode('Not allowed'),
                    'message' => rawurlencode('You don´t have permission to access this page'),
                ]);
                setcookie(
                    'microFlash',
                    "{$appCookie}",
                    time() + 3,
                    '/'
                );
                Session::set('REDIRECTED', true);
                /**@var $response ResponseInterface */
                $response = new Response();
                return $response->withHeader('Location', APP_ASSET_BASE)
                    ->withStatus(301);
            }
        }
    }
    private function checkLoggedUserPermissions(ServerRequestInterface $request) : bool
    {
        $regex ="#^".$this->authorService."#";
        if (preg_match_all($regex, $request->getUri()->getPath(), $match)) {
            if (preg_match_all('([0-9]+)', $request->getUri()->getPath(), $matches)) {
                if ((int)$matches[0][0] === (int)Session::loggedUserID()) {
                    return true;
                } else {
                    return false;
                }
            }
        }
        return true;
    }

}
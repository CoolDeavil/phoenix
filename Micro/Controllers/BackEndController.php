<?php


namespace API\Controllers;

use API\Core\Utils\Logger;
use API\Core\Utils\Validator;
use API\Interfaces\RenderInterface;
use API\Interfaces\RouterInterface;
use API\Repository\ImageRepository;
use GuzzleHttp\Psr7\Response;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class BackEndController extends \API\Core\App\Controller
{
    private ImageRepository $repo;

    /**
     * BackEndController constructor.
     * @param RouterInterface $router
     * @param RenderInterface $render
     * @param ImageRepository $repo
     */
    public function __construct(RouterInterface $router, RenderInterface $render, ImageRepository $repo)
    {
        parent::__construct($router, $render);
        $this->router = $router;
        $this->render = $render;
        $this->repo = $repo;

        $this->router->get('/back-end/show', [$this, 'show'], 'BackEnd.show');
        $this->router->get('/api/upload-trials', [$this, 'index'], 'BackEnd.index');
        $this->router->post('/api/back-end', [$this, 'backEnd'], 'BackEnd.uploader');
        $this->router->post('/api/back-end/store', [$this, 'store'], 'BackEnd.store');
        $this->router->post('/api/back-end/thumb', [$this,'makeUploadThumb'], 'uploader.makeUploadThumb');
        $this->router->get('/image-upload', [$this, 'showUpload'], 'BackEnd.showUpload');

        $this->router->get('/countries', [$this, 'countries'], 'DemoController.countries');

        if (!file_exists(APP_STORAGE_DOWNLOADS)) {
            mkdir(APP_STORAGE_DOWNLOADS, 0777, true);
            mkdir(STORAGE_CACHE, 0777, true);
        }
    }
    public function index(ServerRequestInterface $request, ResponseInterface $response): Response
    {
        $response->getBody()->write(json_encode(['cors' => true ]));
        return $response;
    }
    public function showUpload(ServerRequestInterface $request, ResponseInterface $response): Response
    {
        $view = (string)$this->render->render('uploadTune');
        $response->getBody()->write($view);
        return $response;
    }
    public function countries(ServerRequestInterface $request, ResponseInterface $response): Response
    {
        $params = $request->getAttribute('PARAMS');
        extract($params);
        /**@var string $needle */
        $response->getBody()->write(json_encode($this->repo->getAllCountries(), JSON_PRETTY_PRINT));
//        $response->getBody()->write(json_encode($this->repo->getCountriesByNeedle($request->getQueryParams()['name']), JSON_PRETTY_PRINT));
        return $response;
    }

    public function store(ServerRequestInterface $request, ResponseInterface $response): Response
    {

        $id = $this->repo->registerNewImage($request->getParsedBody());
        $response->getBody()->write(json_encode(['success' => $id ]));
        return $response;

    }
    public function show(ServerRequestInterface $request, ResponseInterface $response): Response
    {
        $images = $this->repo->getStorageImages();
        $view = (string)$this->render->render('bulletList',['images' => $images]);
        $response->getBody()->write($view);
        return $response;
    }
    public function backEnd(ServerRequestInterface $request, ResponseInterface $response): Response
    {

//        return $response
//            ->withStatus(500)
//            ->withHeader('Content-Type', 'application/json');

        Logger::log(json_encode($_POST));
        $target_dir = APP_STORAGE_DOWNLOADS;
        if (isset($_FILES['image']['error'][0])){

             dump($_FILES['image']['error']);
            throw new \RuntimeException('[##] Invalid parameters. Request file Error');
        }
        $allowed = array('gif', 'png', 'jpg');
        $filename = $_FILES['image']['name'];
        $ext = pathinfo($filename, PATHINFO_EXTENSION);
        if (!in_array($ext, $allowed)) {
            throw new \RuntimeException('Invalid file format.');
        }
        $fileServerName = md5_file($_FILES['image']['tmp_name']).'.'.$ext;
        $uploadFile = $target_dir . $fileServerName ;
        if (!move_uploaded_file($_FILES['image']['tmp_name'], $uploadFile)) {
            echo "Upload Failed.\n";
        }
        $response->getBody()->write(json_encode([
            'status' => true,
            'file' => $fileServerName,
        ]));
        return $response
            ->withStatus(200)
            ->withHeader('Content-Type', 'application/json');
    }
    public function makeUploadThumb(ServerRequestInterface $request, ResponseInterface $response) : Response
    {
        if (isset($_FILES['image']['error'][0])){
            echo "<h1>WTF</h1>";
            dump($_FILES['image']['error']);
            throw new \RuntimeException('[@@@@ WTF @@@@@@@] Invalid parameters. Request file Error');
        }
        $mime_type = mime_content_type($_FILES["image"]["tmp_name"]);
        $source_image = imagecreatefromjpeg($_FILES["image"]["tmp_name"]);
        $source_imageX = imagesx($source_image);
        $source_imageY = imagesy($source_image);

//        $exif = exif_read_data($_FILES["image"]["tmp_name"], 'IFD0');

        $resize = $this->imageResize($source_imageX, $source_imageY, 200);
        $dest_imageX = $resize['x'];
        $dest_imageY = $resize['y'];
        $dest_image = imagecreatetruecolor($dest_imageX, $dest_imageY);
        imagecopyresampled($dest_image, $source_image, 0, 0, 0, 0, $dest_imageX, $dest_imageY, $source_imageX, $source_imageY);

        ob_start();
        imagepng($dest_image);
        $bin = ob_get_clean();
        $data = [
            'name'=>$_FILES["image"]["name"],
//            'exif'=> json_encode($exif['COMPUTED']),
            'desc'=>'',
            'keys'=>'',
            'stars'=>0,
            'size'=>$_FILES["image"]["size"],
            'type'=>$mime_type,
            'height'=>$source_imageX,
            'width'=>$source_imageY,
            'blob'=> 'data:image/' . $mime_type . ';base64,' . base64_encode($bin),
        ];
        $response->getBody()->write(json_encode($data));
        return $response;

    }
    private function imageResize($width, $height, $target) : array
    {
        $percentage=null;
        if ($width > $height) {
            $percentage = ($target / $width);
        } else {
            $percentage = ($target / $height);
        }
        $width = round(($width) * $percentage);
        $height = round(($height) * $percentage);
        return [
            'x'=>$width,
            'y'=>$height,
        ];
    }
    private function humanFileSize($bytes, $decimals = 2): string
    {
        $size = ["B","kB","MB","GB","TB","PB","EB","ZB","YB"];
        $factor = floor((strlen($bytes) - 1) / 3);
        /** @var float $factor */
        return sprintf("%.{$decimals}f", $bytes / pow(1024, $factor)) . @$size[$factor];
    }

}
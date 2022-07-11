<?php


namespace API\Controllers;


use API\Core\App\Controller;
use API\Core\Router\MRouter;
use API\Core\Utils\Logger;
use API\Core\Utils\Validator;
use API\Interfaces\RenderInterface;
use API\Interfaces\RouterInterface;
use GuzzleHttp\Psr7\Response;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class CacheController extends Controller
{
    private string $storageFolder;
    private string $cached_folder;
    private string $targetFile;

    public function __construct(RouterInterface $router, RenderInterface $render, string $storageFolder, string $cached_folder)
    {
        parent::__construct($router, $render);
        $this->storageFolder = $storageFolder;
        $this->cached_folder = $cached_folder;

        $this->router->get('/api/cache/:file', [$this, 'get'], 'CacheController.get');
        $this->router->get('/api/download/:file', [$this, 'download'], 'CacheController.get');

    }



    public function get(ServerRequestInterface $request, ResponseInterface $response): Response
    {
        $params = $request->getAttribute('PARAMS');
        extract($params);
        /**@var string $file */
        $this->targetFile = $file;

        if (file_exists($this->cached_folder.$this->targetFile)) {
            $this->blobFlush();
            return $response->withStatus(200);
        } else {
            if($this->buildCached()){
                $this->blobFlush();
                return $response->withStatus(200);
            }
        }

        return $response->withStatus(404);
    }

    public function download(ServerRequestInterface $request, ResponseInterface $response): Response
    {
        $params = $request->getAttribute('PARAMS');
        extract($params);
        /**@var string $file */
        $this->targetFile = $file;
        $filePath = $this->storageFolder . $file;
        if (file_exists($filePath)) {
            header('Content-Description: File Transfer');
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename="'.basename($filePath).'"');
            header('Expires: 0');
            header('Cache-Control: must-revalidate');
            header('Pragma: public');
            header('Content-Length: ' . filesize($filePath));
            flush(); // Flush system output buffer
            readfile($filePath);
            return $response;
        }
        return $response->withStatus(404);
    }
    private function blobFlush()
    {
        $file = $this->cached_folder.$this->targetFile;
        ob_start();
        $etagFile = md5_file($file);
        $format = 'D, d M Y H:i:s \G\M\T';
        $now = time();
        $date = gmdate($format, $now);
        $dateExpire = gmdate($format, $now+1800);
        $fInfo = finfo_open();
        $fileInfo = finfo_file($fInfo, $file, FILEINFO_MIME_TYPE);
        finfo_close($fInfo);
        header("Pragma: cache");
        header('Date: '.$date);
        header('Last-Modified: '.$date);
        header('Expires: '.$dateExpire);
        header("Etag: $etagFile");
        header('Content-type: ' . $fileInfo);
        header('Cache-Control: public, max-age=1800');
        echo file_get_contents($file);
        ob_end_flush();

    }
    private function buildCached(): bool
    {
        $base_path = $this->cached_folder;
        $fInfo = finfo_open();
        $fileInfo = finfo_file($fInfo, $this->storageFolder.$this->targetFile, FILEINFO_MIME_TYPE);
        finfo_close($fInfo);

        $source_image = match ($fileInfo) {
            'image/gif' => imagecreatefromgif($this->storageFolder . $this->targetFile),
            'image/png' => imagecreatefrompng($this->storageFolder . $this->targetFile),
            'image/jpeg' => imagecreatefromjpeg($this->storageFolder . $this->targetFile),
            default => null,
        };

        $source_imageX = imagesx($source_image);
        $source_imageY = imagesy($source_image);
        $targetWidth = 400;
        $resize = $this->imageResize($source_imageX, $source_imageY, $targetWidth);

        $dest_imageX = $resize['x'];
        $dest_imageY = $resize['y'];

        $dest_image = imagecreatetruecolor($dest_imageX, $dest_imageY);
        imagecopyresampled($dest_image, $source_image, 0, 0, 0, 0, $dest_imageX, $dest_imageY, $source_imageX, $source_imageY);

        if(Imagejpeg($dest_image, $base_path.$this->targetFile ,80)) {
            return true;
        }else{
            return false;
        }
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



}
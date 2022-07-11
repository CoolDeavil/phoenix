<?php


namespace API\Controllers;


use API\Core\App\Controller;
use API\Interfaces\RenderInterface;
use API\Interfaces\RouterInterface;
use GuzzleHttp\Psr7\Response;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class DemoController extends Controller
{
    public function __construct(RouterInterface $router, RenderInterface $render)
    {
        parent::__construct($router, $render);
        $this->router = $router;
        $this->router->get('/api/gadgets/:demo', [$this, 'showDemoPage'], 'Demo.showDemoPage');

    }
    public function showDemoPage(ServerRequestInterface $request, ResponseInterface $response): Response
    {

        $params = $request->getAttribute('PARAMS');
        extract($params);
        $view = '';
        /**@var $demo string $ */

        $view = (string)$this->render->render('gadgets/'.$demo);
        $response->getBody()->write($view);
        return $response;
    }


}
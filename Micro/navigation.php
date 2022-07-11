<?php

/**@var $nav API\Core\Utils\NavBuilder\NavBuilder */

$user_avatar = '';
$userID  = 0;
use API\Core\Session\Session;
if( Session::loggedUserID()){
    $userID  = Session::loggedUserID();
    $user_avatar = Session::loggedUserAvatar();
}

$nav->link('MICRO1', 'Micro.index', 'fa-cannabis');

$nav->drop('UPLOADS')
    ->entry('MICRO2', 'BackEnd.showUpload','fa-upload')
    ->entry('MICRO3', 'BackEnd.show','fa-image');


$nav->drop('DROPDOWN PLUS')
    ->entry('DEMO1', 'Demo.showDemoPage','fa-desktop',['demo' => 'formRules'])
    ->entry('DEMO2', 'Micro.WTF','fa-desktop')
    ->entry('DEMO3', 'Demo.showDemoPage','fa-desktop',['demo' => 'calendar'])
    ->entry('DEMO4', 'Demo.showDemoPage','fa-desktop',['demo' => 'scrollBox'])
    ->entry('DEMO5', 'Demo.showDemoPage','fa-desktop',['demo' => 'inputSelect'])
    ->entry('DEMO6', 'Demo.showDemoPage','fa-desktop',['demo' => 'keyMaster']);

$nav->admin()
    ->entry('REGISTER', 'authUserService.create', 'fa-user-plus', [],'GUEST')
    ->entry('LOG_IN', 'authUserService.index', 'fa-sign-in-alt', [],"GUEST")
    ->avatar($user_avatar, 'authUserService.show', ['id'=>$userID],"USER")
    ->entry('LOG_OUT', 'authUserService.clearSession', 'fa-sign-out-alt', [],"USER");



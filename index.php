<?php 
header('Access-Control-Allow-Origin:*'); 
header("Access-Control-Allow-Credentials: true");
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token , Authorization, Cache-Control,X-Requested-With');
include 'Librarys/init.php';
use Librarys\Init;
$init = new Init();
$action = $init->get("action");
switch ($action) {
	case 'trees':
		$init->trees();
		break;
	case 'folder':
		$init->folder();
		break;
	case 'medias':
		$init->medias();
		break;
	case 'uploads':
		$init->uploads();
		break;
	case 'delete':
		$init->delete();
		break;
	case 'update':
		$init->update();
		break;
	default:
		$init->default();
		break;	
}
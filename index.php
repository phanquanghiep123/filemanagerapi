<?php 
error_reporting(E_ERROR | E_PARSE);
header('Access-Control-Allow-Origin:*'); 
header("Access-Control-Allow-Credentials: true");
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, DataType , X-Auth-Token , Authorization, Cache-Control,X-Requested-With');
define("PATHFC",__DIR__);
include 'librarys/init.php';
include 'librarys/db.php';
include 'librarys/file.php';
use librarys\Init;
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
	case 'delete_file':
		$init->delete_file();
		break;
	case 'update':
		$init->update();
		break;
	case 'add_folder':
		$init->add_folder();
	case 'paste_file':
		$init->paste_file();
	default:
		$init->default();
		break;	
}
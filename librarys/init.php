<?php
namespace Librarys;
include 'Librarys/db.php';
use Librarys\Db;

Class Init  {
	public $_DATA = [];
	public $_BASE = __DIR__;
	public $_DB ;
	public $_PAGINGNUMBER = 30;
	function __construct()
	{
		$this->_DB = new Db();
		$this->_DATA["total"]      = 0;
        $this->_DATA["page"]       = 0;
        $this->_DATA["limit"]      = $this->_PAGINGNUMBER;
        $this->_DATA["response"]   = null;
        $this->_DATA["message"]    = "An error occurred please try again";
        $this->_DATA["redirect"]   = 0;
        $this->_DATA["status"]     = 0;
        $this->_DATA["public_url"] = $_SERVER['HTTP_HOST'];
	}
	function post($name = null){
		if($name && @$_POST[$name]){
			if($_POST[$name])
				return  $_POST[$name];
			else
				return false;
		}
		return $_POST;
	}
	function get($name = null){
		if($name){
			return  @$_GET[$name];
		}
		return $_GET;
	}
	function output ($string){
		echo $string;
	}
	function view(){
		 
	}
	function trees ($id = 0){
		$sql = "select * from medias where pid = 0";
		$data =  $this->_DB->query($sql)->get()->rows();
		$this->_DATA["response"]= $data;
		$this->_DATA["status"]= 1;
		echo json_encode($this->_DATA);
		return true;
	}
	function medias (){

	}
	function uploads (){

	}
	function delete(){

	}
	function update(){

	}
	function default (){

	}
	function folder(){
		$id = $this->get("id") ? $this->get("id") : 0;
		$sql = "select * from medias where pid = ".$id."";
		$data =  $this->_DB->query($sql)->get()->rows();
		$this->_DATA["response"]= $data;
		$this->_DATA["status"]= 1;
		echo json_encode($this->_DATA);
		return true;
	}
} 

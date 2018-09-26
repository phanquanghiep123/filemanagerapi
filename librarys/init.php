<?php
namespace librarys;
use librarys\Db;
use librarys\Files;
use librarys\Folder;
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
		if($name){
			return @$_POST[$name];
		}
		return $_POST;
	}
	function get($name = null){
		if($name){
			return  @$_GET[$name];
		}
		return $_GET;
	}
	function file($name = null){
		if($name == null){
			return $_FILES;
		}
		return @$_FILES[$name];
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
		if($this->file("file")){
			$file = new File($_FILES["file"],[
				"path" => PATHFC . "/uploads",
				"name" => uniqid(),
				"extension" => $this->post("extensions")
			]);
			$file->move();
			if($file->status){
				$file->resize();
			}
		}
	}
	function add_folder (){
		$post = $this->post();
		if(@$folder["id"] == 0){
			$folder = new Folder();
			$pf = new Folder();
			$pf->find($post["pid"]);
			var_dump($pf);
			/////$folder->name = $post["name"];
			//$folder->pid = $post["pid"];
			//
			
			//$folder->save();
		}
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

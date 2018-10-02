<?php
namespace librarys;
use Db;
use Files;
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
	function trees (){
		$id = $this->post("id") ? $this->post("id") : 0;
		$medias = $this->_DB->from("medias")->where(["pid" => $id])->get()->rows();
		$this->_DATA["response"]= $medias;
		$this->_DATA["status"]= 1;
		die(json_encode($this->_DATA));
		
	}
	function medias (){

	}
	function uploads (){
		$folderID = $this->post("folder");
		$folder = $this->_DB->from("medias")->where(["id" => $folderID ])->get()->row();
		$path = "/uploads";
		if($folder){
			$path = $folder["path"];	
		}else{
			$folderID = 0;
		}
		if($this->file("file")){
			$file = new File($_FILES["file"],[
				"path" => PATHFC . $path,
				"name" => uniqid(),
				"extension" => $this->post("extensions")
			]);
			$file->move();
			if($file->status){
				$file->resize();
				$file->pid = $folderID;
				$file->save(); 
				$fileReturn  = $this->_DB->from("medias")->where(["id" => $file->id ])->get()->row();
				$this->_DATA["response"]= $fileReturn;
				$this->_DATA["status"]= 1;
			}
		}
		die(json_encode($this->_DATA));
		
	}
	function add_folder (){
		$post = $this->post(); 
		if(@$post["id"] == 0 && @$post['name']){
			$post['name'] = $this->gen_slug_name_file($post['name']);
			$checkParent = true;
			$path = "/uploads/";
			if($post["pid"] != 0){
				$parent = $this->_DB->from("medias")->where(
					[
						"id" => $post["pid"]
					]
				)->get()->row();
				if($parent){
					$path = $parent["path"];
				}else
					$checkParent = false;
			}
			if($checkParent){
				$checkFolder = $this->_DB->from("medias")->where(
					[
						"name" => trim($post["name"]) ,
						"pid" => $post["pid"] 
					]
				)->get()->row();
				if($checkFolder == null){
					//create folder
					if (!file_exists(PATHFC . "/" .$path . '/' . $post['name'])) { 
						mkdir(PATHFC ."/". $path . '/' . $post['name'], 0777, true); 
					} 
					$insert = [
						"name"      => $post["name"],
						"pid"       => $post["pid"],
						"extension" => "folder",
						"path"      => $path . $post['name'] . "/"
					];
					$id = $this->_DB->insert("medias",$insert);
					if($id){
						$media = $this->_DB->from("medias")->where(["id" => $id])->get()->row();
						$this->_DATA["response"]= $media;
						$this->_DATA["status"]= 1;
					}
				}else{
					$this->_DATA["status"]= 0;
					$this->_DATA["message"]= "Folder is exist!";	
				}
			}
			
		}
		die(json_encode($this->_DATA));
	}
	function delete(){

	}
	function update(){

	}
	function default (){

	}
	function folder(){
		$id = $this->post("id") ? $this->post("id") : 0;
		$medias = $this->_DB->from("medias")->where(["pid" => $id])->get()->rows();
		$this->_DATA["response"]= $medias;
		$this->_DATA["status"]= 1;
		die(json_encode($this->_DATA));
		
	}
	function delete_file(){
		$id = $this->post("id");
		$m = $this->_DB->from("medias")->where(['id' => $id])->get()->row();
		if($m){
			$path = $m["path"];
			if($m['extension'] == "folder"){
				$all = $this->_DB->from("medias")->like(["path" => $path])->get()->rows();
				if($all)
				foreach($all as $key => $value) {
					$c = $this->_DB->delete("medias",["id" => $value["id"]]);
				}
				$this->delete_folder(PATHFC . $path);
			}else{
				$c = $this->_DB->delete("medias",["id" => $id]);
				unlink(PATHFC . $path);
			}
			$this->_DATA["response"] = $m;
			$this->_DATA["status"]= 1;			 

		}
		die(json_encode($this->_DATA));
		
	}
	function paste_file(){
		$ids    = $this->post("ids");
		$id     = $this->post("id");
		$ids    = explode(",",$ids);
		$is_cut = $this->post("is_cut") ? $this->post("is_cut") : 0;
		$file  = $this->_DB->from("medias")->where(["id" => $id])->get()->row();
		$files = $this->_DB->from("medias")->where_in("id",$ids)->get()->rows();
		$in    = [];
		$path = "/uploads/";
		$idRoot = 0;
		if($file) {
			$path = $file["path"];
			$idRoot = $file["id"];
		}
		$responseFiles = [];
		if($is_cut == 0){
			foreach ($files as $key => $value) {
				$root = $value["id"];
				$oldPath = $value["path"];
				unset($value["id"]);
				$filesCf = null;
				if($value["extension"] == "folder"){
					$filesCf = $this->_DB->from("medias")->like(["path" => $value["path"]])->get()->rows();
				} 
				$this->xcopy(PATHFC.$value["path"] , PATHFC . $path . $value["name"] . "/");
				$value["pid"] = $idRoot;
				$value["path"] = $path . $value["name"] . "/";
				$id = $this->_DB->insert("medias",$value);
				$value["id"] = $id;
				if($filesCf){
					
					$this->copyFnc($filesCf,$root,$id,$oldPath,$value["path"]);
				}
				$responseFiles [] = $value;	
			}
			$this->_DATA["response"] = $responseFiles;
			$this->_DATA["status"]= 1;			
		}
		die(json_encode($this->_DATA));
		
	}
	private function copyFnc($data,$root,$newParent,$oldPath,$newPath){
		foreach($data as $key => $value){
			if($value["pid"] == $root){
				$n_root = $value["id"];
				$value["pid"] = $newParent;
				$n_oldPath = $value["path"] ;
				$value["path"] = str_replace($oldPath,$newPath,$value["path"]);
				copy(PATHFC.$n_oldPath , PATHFC . $value["path"]);
				$oldPath = $n_oldPath;
				$newPath = $value["path"];
				unset($value["id"]);
				$newParent = $this->_DB->insert("medias",$value);
				unset($data[$key]);
				if($value["extension"] == "folder"){
					$this->copyFnc($data,$n_root,$newParent,$oldPath,$newPath);
				}
			}
		}
	}
	private function gen_slug_name_file($str){
	    $a = array("à", "á", "ạ", "ả", "ã", "â", "ầ", "ấ", "ậ", "ẩ", "ẫ", "ă","ằ", "ắ", "ặ", "ẳ", "ẵ", "è", "é", "ẹ", "ẻ", "ẽ", "ê", "ề" , "ế", "ệ", "ể", "ễ", "ì", "í", "ị", "ỉ", "ĩ", "ò", "ó", "ọ", "ỏ", "õ", "ô", "ồ", "ố", "ộ", "ổ", "ỗ", "ơ" , "ờ", "ớ", "ợ", "ở", "ỡ", "ù", "ú", "ụ", "ủ", "ũ", "ư", "ừ", "ứ", "ự", "ử", "ữ", "ỳ", "ý", "ỵ", "ỷ", "ỹ", "đ", "À", "Á", "Ạ", "Ả", "Ã", "Â", "Ầ", "Ấ", "Ậ", "Ẩ", "Ẫ", "Ă" , "Ằ", "Ắ", "Ặ", "Ẳ", "Ẵ", "È", "É", "Ẹ", "Ẻ", "Ẽ", "Ê", "Ề", "Ế", "Ệ", "Ể", "Ễ", "Ì", "Í", "Ị", "Ỉ", "Ĩ", "Ò", "Ó", "Ọ", "Ỏ", "Õ", "Ô", "Ồ", "Ố", "Ộ", "Ổ", "Ỗ", "Ơ" , "Ờ", "Ớ", "Ợ", "Ở", "Ỡ", "Ù", "Ú", "Ụ", "Ủ", "Ũ", "Ư", "Ừ", "Ứ", "Ự", "Ử", "Ữ", "Ỳ", "Ý", "Ỵ", "Ỷ", "Ỹ", "Đ", " ","ö","ü"); 
	    $b = array("a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a" , "a", "a", "a", "a", "a", "a", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "i", "i", "i", "i", "i", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o " , "o", "o", "o", "o", "o", "u", "u", "u", "u", "u", "u", "u", "u", "u", "u", "u", "y", "y", "y", "y", "y", "d", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A " , "A", "A", "A", "A", "A", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "I", "I", "I", "I", "I", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O " , "O", "O", "O", "O", "O", "U", "U", "U", "U", "U", "U", "U", "U", "U", "U", "U", "Y", "Y", "Y", "Y", "Y", "D", "-","o","u");
	    return strtolower(preg_replace(array('/[^a-zA-Z0-9 -]/','/[ -]+/','/^-|-$/'),array('','-',''),str_replace($a,$b,$str)));
    }
	private function delete_folder($dir){
		if (is_dir($dir)) {
		  $objects = scandir($dir);
		  foreach ($objects as $object) {
			if ($object != "." && $object != "..") {
			  if (filetype($dir."/".$object) == "dir") 
				$this->delete_folder($dir."/".$object); 
			  else unlink ($dir."/".$object);
			}
		  }
		  reset($objects);
		  rmdir($dir);
		}
	  }
	  function xcopy($src, $dest) {
		foreach (scandir($src) as $file) {
			if (!is_readable($src . '/' . $file)) continue;
			if (is_dir($src .'/' . $file) && ($file != '.') && ($file != '..') ) {
				mkdir($dest . '/' . $file);
				$this->xcopy($src . '/' . $file, $dest . '/' . $file);
			} else {
				copy($src . '/' . $file, $dest . '/' . $file);
			}
		}
	}
} 

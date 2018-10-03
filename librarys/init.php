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
		$oldParentFolderPath = "/uploads/";
		foreach ($files as $key => $value) {
			if($key == 0){
				$oldParentFolder = $this->_DB->from("medias",["id" => $value["pid"]])->get()->row();
				if($oldParentFolder){
					$oldParentFolderPath = $oldParentFolderPath["path"];
				}
			}
			$root = $value["id"];
			$oldPath = $value["path"];
			unset($value["id"]);
			$filesCf = null;
			$value["pid"] = $idRoot;
			$checkFolder = $this->_DB->from("medias")->where(
				[
					"name" => trim($value["name"]) ,
					"pid" => $id 
				]
			)->get()->row();
			if($checkFolder){
				$value["name"] = uniqid() . '-'. $value["name"];
			}
			$value["path"] = $path . $value["name"] . "/";	
			if($value["extension"] == "folder"){
				$filesCf = $this->_DB->from("medias")->like(["path" => $oldPath])->get()->rows();
				if (!file_exists(PATHFC . $value["path"])) { 
					mkdir(PATHFC . $value["path"] , 0777, true); 
				} 
				if(file_exists(ATHFC . $oldPath)){
					if($is_cut == 1){
						$this->delete_folder(PATHFC . $oldPath);
					}
				}
			} 
			else{
				if(file_exists(ATHFC . $oldPath)){
					copy( PATHFC . $oldPath , PATHFC .$value["path"] );
					if($value["full"]){
						$odl = $value["full"];
						if (!file_exists(PATHFC . $path ."full")) { 
							mkdir(PATHFC .$path ."full" , 0777, true); 
						} 
						$value["full"] = $path ."full/". $value["name"] ;
						copy( PATHFC . $odl  ,PATHFC . $value["full"]);
					}
					if($value["large"]){
						$odl = $value["large"];
						if (!file_exists(PATHFC . $path ."large")) { 
							mkdir(PATHFC .$path ."large" , 0777, true); 
						} 
						$value["large"] = $path ."large/". $value["name"] ;
						copy( PATHFC . $odl ,PATHFC . $value["large"]);
					}
					if($value["medium"]){
						$odl = $value["medium"];
						if (!file_exists(PATHFC . $path ."medium")) { 
							mkdir(PATHFC .$path ."medium" , 0777, true); 
						} 
						$value["medium"] = $path ."medium/". $value["name"] ;
						copy( PATHFC . $odl ,PATHFC . $value["medium"]);
					}
					if($value["small"]){
						$odl = $value["small"];
						if (!file_exists(PATHFC . $path ."small")) { 
							mkdir(PATHFC .$path ."small" , 0777, true); 
						} 
						$value["small"] = $path ."small/". $value["name"] ;
						copy( PATHFC . $odl ,PATHFC . $value["small"]);
					}
					if($value["thumb"]){
						$odl = $value["thumb"];
						if (!file_exists(PATHFC . $path ."thumb")) { 
							mkdir(PATHFC .$path ."thumb" , 0777, true); 
						} 
						$value["thumb"] = $path ."thumb/". $value["name"] ;
						copy( PATHFC . $odl ,PATHFC . $value["thumb"]);
					}
					if($is_cut == 1){
						unlink(PATHFC . $oldPath);
					}
				}	
			} 
			$id = $this->_DB->insert("medias",$value);
			$value["id"] = $id;
			if($filesCf){
				$this->copyFnc($filesCf,$root,$id,$value["path"]);
			}
			$responseFiles [] = $value;	
		}
		$this->_DATA["response"] = $responseFiles;
		$this->_DATA["status"]= 1;			
		echo $this->_DB->printsql();
		die(json_encode($this->_DATA));
		
	}
	private function copyFnc($data,$root,$newParent,$newPath){
		foreach($data as $key => $value){
			if($value["pid"] == $root){
				$oldroot = $value["id"];
				$checkFolder = $this->_DB->from("medias")->where(
					[
						"name" => trim($value["name"]) ,
						"pid" => $newParent 
					]
				)->get()->row();
				if($checkFolder){
					$value["name"] = uniqid(). '-'. $value["name"];
				}
				$oldnewPath = $newPath . $value["name"] . "/";
				if($value["extension"] !== "folder"){
					copy( PATHFC . $value["path"] , PATHFC . $oldnewPath );
				}else{
					if (!file_exists(PATHFC . $oldnewPath)) { 
						mkdir(PATHFC . $oldnewPath , 0777, true); 
					} 
				}
				$value["pid"]  = $newParent;
				unset($value["id"]);
				if($value["extension"] !== "folder"){
					if($value["full"]){
						$odl = $value["full"];
						if (!file_exists(PATHFC . $newPath ."full")) { 
							mkdir(PATHFC .$newPath ."full" , 0777, true); 
						} 
						$value["full"] = $newPath ."full/". $value["name"] ;
						copy( PATHFC . $odl  ,PATHFC . $value["full"]);
					}
					if($value["large"]){
						$odl = $value["large"];
						if (!file_exists(PATHFC . $newPath ."large")) { 
							mkdir(PATHFC .$newPath ."large" , 0777, true); 
						} 
						$value["large"] = $newPath ."large/". $value["name"] ;
						copy( PATHFC . $odl ,PATHFC . $value["large"]);
					}
					if($value["medium"]){
						$odl = $value["medium"];
						if (!file_exists(PATHFC . $newPath ."medium")) { 
							mkdir(PATHFC .$newPath ."medium" , 0777, true); 
						} 
						$value["medium"] = $newPath ."medium/". $value["name"] ;
						copy( PATHFC . $odl ,PATHFC . $value["medium"]);
					}
					if($value["small"]){
						$odl = $value["small"];
						if (!file_exists(PATHFC . $newPath ."small")) { 
							mkdir(PATHFC .$newPath ."small" , 0777, true); 
						} 
						$value["small"] = $newPath ."small/". $value["name"] ;
						copy( PATHFC . $odl ,PATHFC . $value["small"]);
					}
					if($value["thumb"]){
						$odl = $value["thumb"];
						if (!file_exists(PATHFC . $newPath ."thumb")) { 
							mkdir(PATHFC .$newPath ."thumb" , 0777, true); 
						} 
						$value["thumb"] = $newPath ."thumb/". $value["name"] ;
						copy( PATHFC . $odl ,PATHFC . $value["thumb"]);
					}
				}
				$value["path"] = $newPath;
				$oldnewParent = $this->_DB->insert("medias",$value);	 
				unset($data[$key]);
				if($value["extension"] == "folder"){
					$this->copyFnc($data,$oldroot,$oldnewParent,$oldnewPath);
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
} 

<?php
namespace librarys;
use Db;
class File
 {
    public $id = 0 ;
    public $pid = 0; 
    public $extension;
    private $config = [
        "extension" => "*",
        "path"      => PATHFC,  
    ];
    public $_ConfigSize = [
		"full"   => 1900,
		"large"  => 1366,
		"medium" => 1024,
		"small"  => 768,
		"thumb"  => 420,
	];
    private $errors = [];
    function __construct($files = null,$config) {
        if(is_array($files)){
            foreach($files as $key => $value){
                $this->{$key} = $value;
                $this->is_server = false;
            }
        }else if(is_string($files)){
            $this->is_server = true;
            $this->path_file = $files;
        }
        $this->config = array_merge ($this->config,$config);
    }
    function move (){
        if($this->checkextension()){
            if(!$this->is_server){
                if($this->config["name"]){
                    $name = str_replace(".".$this->extension,"", $this->config["name"]).".".$this->extension;
                    $this->name = $name;
                }else{
                    $name = $this->name;
                }
                $this->path_folder = $this->config["path"];
                if (!file_exists($this->path_folder)) {
                    mkdir($this->path_folder, 0777, true);
                }
                if(move_uploaded_file($this->tmp_name,$this->config["path"] . '/'. $name)){
                    $this->path_file   = $this->path_folder . '/'. $name;
                    $this->path_file   = str_replace("//","/",$this->path_file);
                    $this->path        = str_replace(PATHFC,"",$this->path_file);
                    $this->status      = true;
                }else{
                    $this->status = false;
                    $this->errors[] = "Upload file not working";
                }
            }else{
                $this->status = false;
            }
        }else{
            $this->status = false;
        }
        return $this;
    }
    function resize ($size = false){
        if($this->errors != null || $this->status == false) return false;
        list($width, $height, $type, $attr) = getimagesize($this->path_file);
        if(in_array($type , array(IMAGETYPE_GIF , IMAGETYPE_JPEG ,IMAGETYPE_PNG , IMAGETYPE_BMP))){
            if(!$size){
                foreach ($this->_ConfigSize AS $key => $value){
                    if (!file_exists($this->path_folder. "/" .$key)) {
                        mkdir($this->path_folder . "/" .$key, 0777, true);
                    }
                    $size = $value;
                    $ratio_image = $this->ratio_image($width,$height,$size,0);
                    switch($type)
                    {
                        case "1": $source = imagecreatefromgif($this->path_file); break;
                        case "2": $source = imagecreatefromjpeg($this->path_file);break;
                        case "3": $source = imagecreatefrompng($this->path_file); break;
                        default:  $source = imagecreatefromjpeg($this->path_file);
                    }
                    $thumb = imagecreatetruecolor($ratio_image['width'], $ratio_image['height']);
                    $path_copy = str_replace("/".$this->name,"/".$key."/".$this->name,$this->path_file);
                    imagecopyresized($thumb, $source, 0, 0, 0, 0, $ratio_image['width'], $ratio_image['height'], $width, $height);
                    switch($type)
                    {
                        case "1": $source = imagegif($thumb,$path_copy); break;
                        case "2": $source = imagejpeg($thumb,$path_copy);break;
                        case "3": $source = imagepng($thumb,$path_copy); break;
                        default:  $source = imagejpeg($thumb,$path_copy);
                    }
                    $path = str_replace(PATHFC,"",$path_copy);
                    $this->{$key} = $path;
                }
            }else{
                $size = @$this->_ConfigSize[$size];
                if($size){
                    list($width, $height, $type, $attr) = getimagesize($this->dir_file);
                    $ratio_image = $this->ratio_image($width,$height,$size,0);
                    $src = imagecreatefromjpeg($this->dir_file);
                    $dst = imagecreatetruecolor($ratio_image["width"],$ratio_image["height"]);
                    imagecopyresampled($dst, $src, 0, 0, 0, 0,$ratio_image["width"], $ratio_image["height"], $width, $height); 
                }else{
                    return false;
                }
            }
        }
        
        return $this;
    }
    function crop(){
        return $this;
    }
    function delete(){
        return $this;
    }
    function copy (){
        return $this;
    }
    function cut (){
        return $this;
    }
    function getData  (){
        return [
            "status" => $this->status,
            "path"   => @$this->path,
            "full"   => @$this->full,
            "large"  => @$this->large,
            "medium" => @$this->medium,
            "small"  => @$this->medium,
            "thumb"  => @$this->thumb,
            "error"  => @$this->errors
        ] ;
    }
    function checkextension (){
        if ($this->error > 0){
            $this->errors[] = "This is file upload error";
            return false;
        }
        $extension = $this->config["extension"];
        if($extension != "*"){
            $argE = explode (",",$extension);
            $path_parts = pathinfo($this->name);
            $ext  = $path_parts['extension'];
            $argE = array_diff($argE,[""]);
            if(!in_array($ext,$argE)){
                $this->errors [] = "The extension of file not allow, please uploads file has extension is `".$this->config["extension"]."`";
            }
        }
        $this->extension = $ext;
        return in_array($ext,$argE);
    }
    private function ratio_image($original_width, $original_height, $new_width = 0, $new_heigh = 0) {
        $size['width'] = $new_width;
        $size['height'] = $new_heigh;
        if ($new_heigh != 0) {
            $size['width'] = intval(($original_wdith / $original_height) * $new_height);
        }
        if ($new_width != 0) {
            $size['height'] = intval(($original_height / $original_width) * $new_width);
        }
        return $size;
    }

    public function save(){
        $db = new Db();
        $in = [
            "name" => $this->name,
            "path" => $this->path,
            "full" => $this->full,
            "large" => $this->large,
            "medium" => $this->medium,
            "small" => $this->small,
            "thumb" => $this->thumb,
            "extension" => $this->extension,
            "pid" => $this->pid
        ];
        $this->id =  $db->insert("medias", $in);
        return $this;
    }
 }
 


 
 
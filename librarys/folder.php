<?php
namespace librarys;
use librarys\Db;
Class Folder {
    public $id = 0;
    public $name = "";
    public $path = "";
    public $extension = "folder";
    public $pid = 0;
    public $status = 1;
    public $created_at  = null;
    public $updated_at  = null;
    public function __construct() {
        
    }
    public function find($id){
        $DB = new Db();
        $sql = "select * from medias where id = $id";
        $folder =  $DB->query($sql)->get()->row();
        if($folder){
            foreach($folder as $key => $value){
                $this->{$key} = $value;
            }
        }
        return $this;
    }
    public function childrens(){
        $DB = new Db();
        $sql = "select * from medias where pid = $this->id";
        $folders =  $DB->query($sql)->get()->rows();
        return $folders;
    }
    public function save(){
        $DB = new Db();
        $colums = [
            "id",
            "name",
            "path",
            "pid",
            "extension",
            "status",
            "created_at",
            "updated_at"
        ];
        if($this->id == 0){
            $this->created_at =  date('m/d/Y h:i:s a', time());
        }
        $this->updated_at = date('m/d/Y h:i:s a', time());
        if($this->id == 0){
            $columsString = $valueString = [];
            foreach($colums as $key => $value){
                if($key != "id"){
                    $columsString [] = $value;
                    if(!is_numeric( $this->{$value} )){
                        $valueString [] = "'".$this->{$value}."'";
                    }else{
                        $valueString [] = $this->{$value};
                    }                    
                }
            }
            $sqlinsert = "INSERT INTO `medias` (" .implode(",",$columsString).") VALUES (".implode(",",$valueString).")";
            $r = $DB->query("SELECT LAST_INSERT_ID()")->get()->row();
            $this->id = $r["LAST_INSERT_ID()"];
        }else{
            $columsString = $valueString = [];
            foreach($colums as $key => $value){
                if($key != "id"){
                    $updateString [] = $key ."=". $value;
                }
            }
            $sqlinsert = "UPDATE `medias` SET (" .implode(",",$updateString).") WHERE (`id` = $this->id )";
            $DB->query($sqlinsert)->get()->rows();
        }
        return $this;
    }
    
}
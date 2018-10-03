<?php 
Class Db {
	private $_servername = "localhost";
	private $_username = "root";
	private $_password = "";
	private $_dbname = "filemanager";
	private $_conn;
	private $_rows    		  = [];
	private $_source          = null;
	private $_sql     		  = "";
	private $_table   		  = null;
	private $_columns 		  = "*";
	private $_limit           = "";
	private $_order           = "";
	private $_group           = "";
	private $_relationship 	= [];
	private $_condition 		= [];
	private $_sqlPrint = "";
	private $_operator = [
		"=",">","<","<>",">=","<=","!=","like","in"
	];
	function __construct($foo = null)
	{
		$this->_conn = mysqli_connect($this->_servername, $this->_username, $this->_password, $this->_dbname) or die("Unable to connect to MySQL");
		if (mysqli_connect_errno())
		{
		  	echo "Failed to connect to MySQL: " . mysqli_connect_error();
		}
	}
	function select ($columns){
		$joinString = implode("`,`",$columns);
		$joinString = str_replace("````","`",$joinString);
		$joinString = str_replace("```","`",$joinString);
		$joinString = str_replace("``","`",$joinString);
		$joinString = "`".$joinString."`";
		$joinString = str_replace(".","`.`",$joinString);
		$joinString = str_replace("`*`","*",$joinString);
		$this->_columns = $joinString;
		return true;
	}
	function from($table){
		$this->_table = $table;
		return $this;
	}
	function join  ($table, $ondata , $type = "INNER"){
		$this->_relationship[] = (trim($type) . " JOIN ". trim($table) . " ON " . trim($ondata)) ;
		return $this;
	}
	function where($wheredata){
		if(is_array($wheredata)){
			foreach($wheredata as $key => $value){
				$argkey = explode(" ",$key); 
				$argkey = array_diff($argkey,[""]);
				$operator = " = ";
				if(count($argkey) > 1 && in_array(@$argkey[1],$this->_operator)){
					$key = $argkey[0];
					$operator = " " .$argkey[1] ." ";
				}
				if($value == null && $value !== 0)
					$value = "null";
				else{
					if(is_numeric($value))
						$value = trim($value);	
					if( is_string ($value) )
						$value = "'" . trim($value) . "'";
				}
				if($value == '')
					$value = "''";	
				$this->_condition[] = ("AND `" .trim($key) ."`" . $operator . $value);
			}
		}
		return $this;
	}
	function like ($data){
		foreach($data as $key => $value){
			if($value == null && $value !== 0)
					$value = "null";
				else{
					if(is_numeric($value))
						$value = trim($value);	
					if( is_string ($value) )
						$value = "'%" . trim($value) . "%'";
				}
				if($value == '')
					$value = "''";	
				$this->_condition[] = ("AND `" .trim($key) . "` LIKE(". $value .")");
		}
		return $this;
	}
	function where_or ($wheredata){
		if(is_array( $wheredata )){
			foreach($wheredata as $key => $value){
				if($value == null && $value !== 0)
					$value = "null";
				else{
					if(is_numeric($value))
						$value = trim($value);	
					if( is_string ($value) )
						$value = "'" . trim($value) . "'";
				}
				if($value == '')
					$value = "''";	
				$this->_condition[] = ("OR `" . trim($key) . "` = " . $value);
			}
		}
		return $this;
	}
	function where_in($column,$arg,$type = false){
		$string = "";
		$data  = [];
		foreach ($arg as $key => $value){
			if(is_numeric($value))
				$value = trim($value);	
			if( is_string ($value) )
				$value = "'" . trim($value) . "'";
			$data[] = ($value);	
		}
		$string = implode(",",$data);
		$this->_condition [] = ("AND `" . trim($column) . "` IN ( " . $string . " )");
		return $this;
	}
	function where_not_in ($column,$arg,$type = false){
		$string = "";
		$data  = [];
		foreach ($arg as $key => $value){
			if(is_numeric($value))
				$value = trim($value);	
			if( is_string ($value) )
				$value = "'" . trim($value) . "'";
			$data[] = ($value);	
		}	
		$string = implode(",",$data);
		$this->_condition [] = ("AND `" . trim($column) . "` NOT  IN ( " . $string . " )");
		return $this;
	}
	function start_group (){
		$this->_condition [] = ("(");
		return $this;
	}
	function end_group (){
		$this->_condition [] = (")");
		return $this;
	}
	function limit ($offset,$limit){
		$this->_limit = " LIMIT " . $offset  . " , " . $limit ;
		return $this;
	}
	function order_by ($order = [] ,$type = "ASC"){
		$this->_order = " ORDER BY `".implode("`,`",$order)."` " . $type ;
		return $this;
	}
	function group_by ($order){
		$this->_group = " GROUP BY `".implode("`,`",$order)."`";
		return $this;
	}
	function get (){
		$stringcondition = $stringJoin = null;
		if($this->_condition)
			$stringcondition = implode(" ",$this->_condition);

		if($this->_relationship)
			$stringJoin = implode(" ",$this->_relationship);
		if($stringcondition != "" )
			$stringcondition = "WHERE" . $stringcondition;
		if($stringcondition != "" ){
			$stringcondition = str_replace("WHEREAND","WHERE",$stringcondition);
			$stringcondition = str_replace("WHEREOR","WHERE",$stringcondition);
			$stringcondition = str_replace("WHEREIN","WHERE",$stringcondition);
		}	
	    $this->_sql = "SELECT " . $this->_columns . " FROM " . $this->_table . " " . $stringJoin . $stringcondition  . $this->_limit . $this->_order . $this->_group;
		$this->_sqlPrint .= ($this->_sql. " <br/>");	
		$this->_source = $this->_conn->query($this->_sql);
		return $this->resetQuery();
	}
	function resetQuery (){
		$this->_sql     		= "";
		$this->_table   		= null;
	    $this->_columns 		= "*";
		$this->_limit           = "";
		$this->_relationship 	= [];
		$this->_condition 		= []; 
		return $this;
	}
	function row(){
		if ($this->_source->num_rows > 0) {
		    $row = $this->_source->fetch_assoc() ;
		    return ($row);
		} else {
		   return null;
		}
		return false;
	}
	function rows(){
		$data = [];
		if($this->_source){
			if ($this->_source->num_rows > 0) {
				while($row = $this->_source->fetch_assoc()) {
					$data []= $row;
				}
				return $data;
			} else {
			   return null;
			}
		}
		return false;
	}
	function printsql (){
		return $this->_sqlPrint;
	}
	function update ($table, $dataUpdate, $where = null){
		$lengthArg =  count($dataUpdate);
		try{
			$sql = "UPDATE " . $table ." SET "; 
			$i = 1;
			foreach($dataUpdate as $key => $value){
				if(is_numeric($value))
					$value = trim($value);	
				if( is_string ($value) )
					$value = "'" . trim($value) . "'";
				if($lengthArg < $i) 
					$sql .= '`' .trim($key) ."` = " . $value . ",";
				else 
					$sql .= '` '. trim($key) . "` = " . $value ;
				$i++;
			}
			if( $where != null){
				$sql .= " WHERE ";
				$i = 1;
				$lengthArg = count($where);
				foreach($where as $key => $value){
					if(is_numeric($value))
						$value = trim($value);	
					if( is_string ($value) )
						$value = "'" . trim($value) . "'";
					if($lengthArg < $i) 
						$sql .= '`'. trim($key) . "` = " . $value . " AND ";
					else 
						$sql .= '`'. trim($key) . "` = " . $value;
					$i++;
				}
			}
			$this->_conn->query($sql);
			$this->_sqlPrint .= $sql . "<br/>";
			return true;
		}catch (Exception $e) {
			echo 'Caught exception: ',  $e->getMessage(), "\n";
			return false;
		}	
	}
	function delete ($table,$where){
		$sql = "DELETE FROM " . $table; 
		if($where != null){
			$sql .= " WHERE ";
			$i = 1;
			$lengthArg = count($where);
			foreach($where as $key => $value){
				if(is_numeric($value))
					$value = trim($value);	
				if( is_string ($value) )
					$value = "'" . trim($value) . "'";
				if($lengthArg < $i) $sql .= '`'. trim($key) . "` = " . $value . " AND ";
				else $sql .= '`' . trim($key) . "` = " . $value;
				$i++;
			}
			try{
				$this->_conn->query($sql);
				$this->_sqlPrint .= $sql . "<br/>";
				return true;
			}catch (Exception $e) {
				echo 'Caught exception: ',  $e->getMessage(), "\n";
				return false;
			}
		}
	}
	function insert ($table,$data){
		$sql = "INSERT INTO " . $table. " ";
		$key_insert = [];
		$value_insert = [];
		foreach($data as $key => $value){
			$key_insert[] = '`'.$key.'`';
			if(is_numeric($value))
				$value = trim($value);	
			if( is_string ($value) )
				$value = "'" . trim($value) . "'";
			$value_insert[] = $value;
		}
		$sql .= "(".implode(",",$key_insert).") VALUE (".implode(",",$value_insert).")";

		try{
			$this->_conn->query($sql);
			$this->_sqlPrint .= $sql . "<br/>";
			$this->_source = $this->_conn->query("SELECT LAST_INSERT_ID()");
			$r = $this->row();
			$id = $r["LAST_INSERT_ID()"];
			if($id)
				return $id;
			else
				return false;
		}catch (Exception $e) {
			echo 'Caught exception: ',  $e->getMessage(), "\n";
			return false;
		}
	}
	function query ($sql = null){
		$this->_source = $this->_conn->query($sql);
		$this->_sqlPrint .= $sql . "<br/>";
		return $this->resetQuery();
	}
}

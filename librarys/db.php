<?php 
namespace librarys;
Class Db{
	private $servername = "localhost";
	private $username = "root";
	private $password = "";
	private $dbname = "filemanager";
	private $conn;
	private $_selects = [];
	private $_wheres  = [];
	private $_orders  = [];
	private $_offset  = false;
	private $_limit   = false;
	private $_having  = false;
	private $_groupby = false; 
	private $_string_select = "";
	private $_string_where = "";
	private $_source       = "";
	private $_sql          = "";
	function __construct($foo = null)
	{
		// Create connection
		$this->conn = mysqli_connect($this->servername, $this->username, $this->password, $this->dbname) or die("Unable to connect to MySQL");
		if (mysqli_connect_errno())
		{
		  	echo "Failed to connect to MySQL: " . mysqli_connect_error();
		}
		
	}
	function query ($sql = null){
		$this->_sql = $sql ;
		return $this;
	}
	function select($data){
		$this->_selects = array_merge($this->_selects,$data);
		return $this;
	}
	function where($data){
		$this->_wheres = array_merge($this->_wheres,$data);
		return $this;
	}
	function order($data){
		$this->_orders = array_merge($this->_orders,$data);
		return $this;
	}
	function offset($offset){
		$this->_offset = $offset;
		return $this;
	}
	function limit($limit){
		$this->_limit = $limit;
		return $this;
	}
	function insert ($data){

	}
	function delete ($id){

	}
	function update ($id){

	}
	function get(){
		$this->_source = $this->conn->query($this->_sql);
		return $this->resetQuery();
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
	function resetQuery (){
		$this->_selects = [];
		$this->_wheres  = [];
		$this->_orders  = [];
		$this->_offset  = false;
		$this->_limit   = false;
		$this->_having  = false;
		$this->_groupby = false ;
		return $this;
	}
}

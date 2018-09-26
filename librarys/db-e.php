<?php

class Db {
    private $servername = "localhost";
	private $username = "root";
	private $password = "";
	private $dbname = "filemanager";
	private $_table       = null;
	private $_columns     = [];
    private $_joins       = [];
    private $_order       = [];
    private $_where       = [];
    private $_group       = [];
    private $_limit       = [];
    private $_sql         = "";
    private $_conn        = null;
	public function __construct()
	{
		// Create connection
		$this->_conn = mysqli_connect($this->servername, $this->username, $this->password, $this->dbname) or die("Unable to connect to MySQL");
		if (mysqli_connect_errno())
		{
		  	echo "Failed to connect to MySQL: " . mysqli_connect_error();
		}
		
	}
	private function end (){
		$this->_conn->end();
    }
	this.reset = function (){
		this._table       = null;
		this._columns     = [];
	    this._joins       = [];
	    this._order       = [];
	    this._where       = [];
	    this._group       = [];
	    this._limit       = [];
	    this._sql         = "";
	}
	this.from = function($model = null){
		var argTable    = $model.table.split(" ");
		argTable        = cleanEmtyItemArray(argTable,"");
		var newargTable = [];
		for (var i in argTable){
			newargTable.push(replacecolum(argTable[i]));
		}
		var asString = "";
		if($model.phoenix_as !== false){
			asString = " AS `"+$model.phoenix_as+"` ";
		}
		this._table = newargTable.join(" ") + asString;
	}
	this.select = function($data = []){
		var selectString ;
		if(typeof $data == "object"){
			for (var i in $data){
				selectString = replacecolum($data[i]);
				this._columns.push(selectString);
			}
			return this;
		}else{
			_Controller.phoenix_info.error.push({detail:"" ,message : "The data sent to select must be an object"});
			return false;
		}
	}
	this.join = function ($data = {}){
		var joinType = ["INNER","LEFT","RIGHT"];
		var on    = (typeof $data.on == "object") ? $data.on : null;
		var and   = (typeof $data.and == "object") ? $data.and : null;
		var table = $data.table;
		var stringOn = "";
		var argOn    = [];
		var argAnd   = [];
		if(on != null){
			argOn.push(replacecolum(on[0]));
			argOn.push(replacecolum(on[1]));
			argOn.push(replacecolum(on[2]));
		}
		var newAnd  = [];
		var fixAnd  = "";
		if(and != null){
			fixAnd = " AND ";
			for(var i in and){
				argAnd.push(replacecolum(and[i][0]));
				argAnd.push(replacecolum(and[i][1]));
				argAnd.push(replacevalue(and[i][2]));
				newAnd.push(argAnd.join(" "));
				argAnd = [];
			}
		}
		var stringjoin = "";
		if(typeof table == "string"){
			table  = replacecolum(table);
			stringjoin = joinType[$data.type] + " JOIN " + table + " ON " + argOn.join(" ") + fixAnd + newAnd.join(" AND ");
		}else if(typeof table == "object") {
			if(table._as !== false){
				table.reader();
				var sql    = table.phoenix_sql;
				stringjoin = joinType[$data.type] + " JOIN (" + sql + ") AS " + replacecolum(table.phoenix_as) + " ON " + argOn.join(" ") + fixAnd + newAnd.join(" AND ");
			}else{
				_Controller.phoenix_info.error.push({detail:null ,message : "Please Aliases model first join models!"});
			}		
		}
		this._joins.push(stringjoin);

	}
	this.where = function($model = null){
		var typewhere = ["AND","OR","","IN","NOT IN"];
		var argAnd  = [];
		var data ,type ;
		for(var i in $model.phoenix_where){
			argAnd  = [];
			type = $model.phoenix_where[i].type;
			data = $model.phoenix_where[i].data;
			if(type == 2){
				this._where.push($model.phoenix_where[i].data);
			}else if(type == 0 || type == 1){	
				if(i != 0){
					argAnd.push(typewhere[type]);
				}
				argAnd.push(replacecolum(data[0]));
				argAnd.push(data[1]);
				argAnd.push(replacevalue(data[2]));
				var stringwhere = argAnd.join(" ");
				this._where.push(stringwhere);
			}else if(type == 3 || type == 4){
				var key      = replacecolum($model.phoenix_where[i].key);
				var dataIn   = data;
				var argIn    = [];
				for (var i in dataIn ){
					argIn.push(replacevalue(dataIn[i]))
				}
				var stringwhere = "AND " + key + " "+typewhere[type]+" ( " + argIn.join(" , ") +" ) ";
				this._where.push(stringwhere);
			}
		}
	}

	this.limit = function($limit = null){
	    this._limit = $limit;
	}
	this.orderby = function($data = {}){
		var key,value,stringorder;
		for (var i in $data){
			key = replacecolum(i);
			value = $data[i];
			this._order.push(key + " " + value)
		}
	}
	this.groupby = function($data = []){
		for (var i in $data){
			key = replacecolum($data[i]);
			this._group.push(key);
		}
	}
	this.get = function($model, $type = 0,$connect = true){
		if($model.table != null){
			this.from($model);
			this.select($model.phoenix_selects);
			if($model.phoenix_joins.length > 0){
				for(var i in $model.phoenix_joins){
					this.join($model.phoenix_joins[i]);
				}
			}
			if($model.phoenix_where.length > 0){
				this.where($model);
			}
			if($model.phoenix_order.length > 0){
				for(var i in $model.phoenix_order){
					this.orderby($model.phoenix_order[i]);
				}
			}
			if($model.phoenix_group.length > 0){
				for(var i in $model.phoenix_group){
					this.groupby($model.phoenix_group[i]);
				}
			}
			if($model.phoenix_limit.length > 0){
				this.limit($model.phoenix_limit);
			}
			var sql = this.convertSql(0);
			$model.phoenix_sql = sql;
			this.reset();
			if($connect == true){
				try { 
					var options = {sql : sql, nesttables: false};
	
					_connection.query(options,function(err, rows, fields){
						if ($model.phoenix_tomodel != false) {
							$model.phoenix_tomodel.phoenix_callback = $model.phoenix_callback;
							$model = $model.phoenix_tomodel;
						}
						if (err) 
							_Controller.phoenix_info.error.push({detail:err ,message : err.sqlMessage});
						else
							if($type == 0){
								if(rows.length > 0 ){
									var row = rows[0];
									for (var i in row){
										$model[i] = row[i];
									}

								}
								$model.phoenix_list = [];
								if(typeof $model.phoenix_callback == "function"){
									$model.phoenix_callback(this.phoenix_list = null);
								}
							}else{
								var argModels = [];
								for (var i in rows){
									var row = rows[i];
									var dataModel = new Object;
									for (var i in $model){
										dataModel[i] = $model[i];
									}
									for (var i in row){
										dataModel[i] = row[i];
									}
									dataModel.reset();
									argModels.push(dataModel);
								}	
								if(typeof $model.phoenix_callback == "function"){
									$model.phoenix_list = argModels;
									$model.phoenix_callback($model.phoenix_callback = null);
								}
							}
					   	
						_Controller.endwait();
					});
				}catch (e){
					if (e instanceof SyntaxError) _Controller.phoenix_info.error.push({detail:e ,message : e.message});
					else _Controller.phoenix_info.error.push({detail:e ,message : e});
				
					_Controller.endwait();
				}
			}
		} 
	}
	this.save = function($model){
		var that = this;
		var sql  = "";
		var options = {sql : "DESCRIBE " + replacecolum($model.table), nesttables: false};
		try {
			_connection.query(options,function(err, rows, fields){
				if(err == null){
					var dataColumns = [];
					for ( var i in rows){
						dataColumns.push(rows[i]["Field"]);
					}
					var  dataChange = {};
					for( var i in dataColumns){
						if(dataColumns[i] != $model.key){
							if(typeof $model[dataColumns[i]] !== "undefined"){
								dataChange[dataColumns[i]] = $model[dataColumns[i]];
							}else{
								$model[dataColumns[i]] = null;
							}
						}
					}
					var check = false;
					if(typeof $model.key == "string" )
					{
						check = ($model[$model.key] == 0) ? false : true;
					}
					else if(typeof $model.key == "object"){
						for (var i in $model.key){
							if($model[$model.key[i]] != 0){
								check = true;
							}	 
						}
					}
					if(check == false ){
						var argcolum = []; 
						var argvalue = [];
						for(var i in dataChange){
							if(typeof(i) === "string"){
								argcolum.push(replacecolum(i));
								argvalue.push(replacevalue(dataChange [i]));
							}	
						}
						var stringColum = argcolum.join(" , ");
						var stringValue = argvalue.join(" , ");
						sql  = 'INSERT INTO '+ replacecolum($model.table) + " ( " + stringColum + " ) VALUE ( "+ stringValue + " )";
					}else{
						var argUpdate = []; 
						for(var i in dataChange){
							if(typeof(i) === "string"){
								argUpdate.push(replacecolum(i) + " = " +replacevalue(dataChange[i]));
							}	
						} 
						if($model.phoenix_where.length > 0){
							for(var i in $model.phoenix_where){
								that.where($model.phoenix_where[i]);
							}
						}
						var where = that.convertSql(1);
					    sql = "UPDATE "+ replacecolum($model.table)+ " SET " + argUpdate.join(" , ") + where ;
					}
					$model.phoenix_sql  = sql;
					$model.phoenix_new  = 0 ;
					that.reset();
					try {
						_connection.query(sql, function(err, result) {
						  	if (err) {
								_Controller.phoenix_info.error.push({detail:err ,message : err.sqlMessage});
						  	
						  	}else{
						  		if($model[$model.key] == 0){
							  		$model[$model.key] = result.insertId; 
							  	}
								if(typeof $model.phoenix_callback == "function"){
									$model.phoenix_callback($model.phoenix_callback = null);
								}
							
						  	}
							_Controller.endwait();
						});
					}catch (e){
						if (e instanceof SyntaxError) _Controller.phoenix_info.error.push({detail:e ,message : e.message});
						else _Controller.phoenix_info.error.push({detail:e ,message : e});
					
						_Controller.endwait();
					}
				}else{
					_Controller.phoenix_info.error.push({detail:err ,message : err.sqlMessage});
				
				}
			});
		}catch (e){
			if (e instanceof SyntaxError) _Controller.phoenix_info.error.push({detail:e ,message : e.message});
			else _Controller.phoenix_info.error.push({detail:e ,message : e});
		
			_Controller.endwait();
		}
	}
	this.find = function ($model){
		if($model.phoenix_where.length > 0){
			for(var i in $model.phoenix_where){
				this.where($model);
			}
		}
		var where = this.convertSql(1);
		var sql = "SELECT * FROM " + replacecolum($model.table) + where + " LIMIT 0,1";
		var options = {sql : sql, nesttables: false};
		$model.phoenix_sql = sql;
		this.reset();
		try{
			_connection.query(options,function(err, rows){
				if (err) {
					_Controller.phoenix_info.error.push({detail:err ,message : err.sqlMessage});
			  	}else{
			  		var row = null;
			  		if(rows.length > 0 ){
						row = rows[0];
						for (var i in row){
							$model[i] = row[i];
						}
					}
					$model.phoenix_list = [];
				    if(typeof $model.phoenix_callback !== null){
						$model.phoenix_callback($model.phoenix_callback = null);
					}	
			  	}
			  
			  	_Controller.endwait();
			  	
			});
		}catch (e){
			if (e instanceof SyntaxError) _Controller.phoenix_info.error.push({detail:e ,message : e.message});
			else _Controller.phoenix_info.error.push({detail:e ,message : e});
		
			_Controller.endwait();
		}
		
	}
	this.destroy = function($model){
		var sql = "";
		if($model.phoenix_where.length > 0){
			for(var i in $model.phoenix_where){
				this.where($model.phoenix_where[i]);
			}
		}
		if($model.phoenix_wherein.length > 0){
			for(var i in $model.phoenix_wherein){
				this.wherein($model.phoenix_wherein[i]);
			}
		}
		if($model.phoenix_wherenotin.length > 0){
			for(var i in $model.phoenix_wherenotin){
				this.wherenotin($model.phoenix_wherenotin[i]);
			}
		}
		var where = this.convertSql(1);
		sql = "DELETE FROM " + replacecolum($model.table) + where;
		$model.phoenix_sql = sql;
		this.reset();
		var options = {sql : sql, nesttables: false};
		try{
			_connection.query(options,function(err, rows){
				if (err) {
					_Controller.phoenix_info.error.push({detail:err ,message : err.sqlMessage});
			  	}else{
				    if(typeof $model.phoenix_callback  == "function"){
						$model.phoenix_callback($model.phoenix_callback = null);
					}
			  	}
			  
			  	_Controller.endwait();	
			});
		}catch (e){
			if (e instanceof SyntaxError) _Controller.phoenix_info.error.push({detail:e ,message : e.message});
			else _Controller.phoenix_info.error.push({detail:e ,message : e});
		
			_Controller.endwait();
		}
		
	}
	this.convertSql = function(type){
		var replayKey = {
			"(  AND" : "AND (",
			"(  OR" : "OR (",
			"WHERE  AND" : "WHERE",
			"WHERE  OR" : "WHERE",
			"OR WHERE" : "OR",
			"AND WHERE" : "AND",
		};
		var selectString = joinString = stringWhere = groupString = orderString = limitString = "";
		if(this._columns == null || this._columns.length < 1){
			this._columns.push("*");
		}
		selectString = this._columns.join(" , ");
		if(this._joins.length > 0){
			joinString = " " + this._joins.join(" ");
		}
		if(this._where.length > 0){
			stringWhere = " WHERE " + this._where.join(" ") ;
		}
		if(this._group.length > 0){
			groupString = " GROUP BY " + this._group.join(" , ");
		}
		if(this._order.length > 0){
			orderString = " ORDER BY " + this._order.join(" , ");
		}
		if(this._limit.length > 0){
			limitString = " LIMIT " + this._limit.join(" , ");
		}
		if(type == 0){
			var sql = "SELECT " + selectString + " FROM " + this._table + joinString + stringWhere + groupString + orderString + limitString;
		}
		if(type == 1){
			var sql = stringWhere;
		}	
		sql = sql.ReplaceKeyAll(replayKey);
		return sql;
	}
	const replacecolum  = function($column = null){
		const _sqlKeyWord  = ["%","=","*","/","+","-","like","in","not","or","on","and","left","end","as","right","inner"];
		var argString = $column.split(" ");
		argString     = cleanEmtyItemArray(argString);
		var keyString = "";
		var argNew    = [];
		var columString = "";
		for (var i in argString){
			columString = argString[i];
			if(_sqlKeyWord.indexOf(argString[i].toLowerCase().trim()) == -1){
				columString  = columString.ReplaceAll("```","`");
				columString  = columString.ReplaceAll("[","`");
				columString  = columString.ReplaceAll("]","`");
				columString  = columString.ReplaceAll("``","`");
				columString  = "`"+columString+"`";
				columString  = columString.ReplaceAll(".","`.`");
				columString  = columString.ReplaceAll("`*`","*");
			}
			argNew.push(columString);
		}
		return 	argNew.join(" ");
	}
	const replacevalue = function($value = null){
		var valueString
		if($value == null) return "NULL";
		if(typeof $value == "string"){
		 	valueString = ("'"+$value+"'");
		}
		else
			valueString = ($value);
		return 	valueString;
	}
}
module.exports = driverMysql;

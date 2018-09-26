function driverMysql(database){
	var that            = require('mysql');
	var rows    		= [];
	var sql     		= "";
	var table   		= null;
	var columns 		= "*";
	var limit           = "";
	var order           = "";
	var group           = "";
	var relationship 	= [];
	var condition 		= [];
	this.connection = that.createConnection(database);
	try{
		this.connection.connect(function($err) {
			if ($err) {
				_Controller.info.error.push({detail:$err ,message : $err.stack});
			}
		});
	}catch(e){
		if (e instanceof SyntaxError)  _Controller.info.error.push({detail:e ,message : e.message});
		else  _Controller.info.error.push({detail:e ,message : e});
	}
	var sqlPrint = "";
	this.select = function($columns){
		var joinString = $columns.join("`,`");
		joinString = joinString.replaceAll("````","`");
		joinString = joinString.replaceAll("```","`");
		joinString = joinString.replaceAll("``","`");
		joinString = "`"+joinString+"`";
		joinString = joinString.replaceAll(".","`.`");
		joinString = joinString.replaceAll("`*`","*");
		columns    = joinString;
		return true;
	}
	this.from = function($table){
		table = $table;
		return true;
	}
	this.join = function($table, $ondata , $type = ""){
		relationship.push($type.trim() + " JOIN " + $table.trim() + " ON " + $ondata.trim());
		return true;
	}
	this.where = function($wheredata){
		if(typeof $wheredata == "object"){
			var dataValue = "";
			for (var i in $wheredata){
				if($wheredata[i] == null)
					$wheredata[i] = "null";
				else{
					if( isNaN($wheredata[i]) == true )
						dataValue = "'" + $wheredata[i].trim() + "'";
					else
						dataValue = $wheredata[i].trim();	
				}
				if(dataValue == '')
					dataValue = "''";	
				condition.push("AND " + key + " = " + dataValue);
			}
			return true;
		}
		return false;
	}
	this.where_or = function($wheredata){
		if(typeof $wheredata == "object"){
			var dataValue = "";
			for (var i in $wheredata){
				if($wheredata[i] == null)
					$wheredata[i] = "null";
				else{
					if( isNaN($wheredata[i]) == true )
						dataValue = "'" + $wheredata[i].trim() + "'";
					else
						dataValue = $wheredata[i].trim();	
				}
				if(dataValue == '')
					dataValue = "''";	
				condition.push("OR " + key + " = " + dataValue);
			}
			return true;
		}
		return false;
	}
	this.where_in = function($columns,$arg,$type = false){
		var string = "";
		var data  = [];
		var dataValue;
		for(var i in arg){
			if( isNaN(arg[i]) == true )
				dataValue = "'" + $arg[i].trim() + "'";
			else
				dataValue = $arg[i].trim();
			data.push(dataValue);	
		}
		string = data.join(",");
		condition.push("AND " + $columns + " IN ( " + string + " )");
		return true;
	}
	this.where_not_in = function($columns,$arg,$type = false){
		var string = "";
		var data  = [];
		var dataValue;
		for(var i in $arg){
			if( isNaN($arg[i]) == true )
				dataValue = "'" + $arg[i].trim() + "'";
			else
				dataValue = arg[i].trim();
			data.push(dataValue);	
		}
		string = data.join(",");
		condition.push("AND " + $columns + " NOT IN ( " + string + " )");	
		return true;
	}
	this.start_group = function(){
		condition.push("(");
		return true;
	}
	this.end_group = function(){
		condition.push(")");
		return true;
	}
	this.limit = function($offset,$limit){
		limit = " LIMIT " + $offset + " , " + $limit ;
		return true;
	}
	this.order_by = function ($order){
		order = " ORDER BY `"+$order.join("`,`")+"`";
	}
	this.group_by =  function ($order){
		group = " GROUP BY `"+$order.join("`,`")+"`";
	}
	this.get = function($callback){
		rows    		    = [];
		var stringcondition = condition.join(" ");
		var stringJoin      = relationship.join(" ");
		stringcondition     = stringcondition.replace("AND", "");
		if(stringcondition != "" )
			stringcondition = "WHERE" + stringcondition;
		sql = "SELECT " + columns + " FROM " + table +" " + stringJoin + stringcondition  + limit + order + group;
		var options = {sql: sql, nesttables: false};
		try { 
			this.connection.query(options,function(err, rows, fields){
				if (err) 
					_Controller.info.error.push({detail:err ,message : err.sqlMessage});
				else
					$callback(rows, fields);
				_Controller.endwait();
			});
		}catch (e){
			if (e instanceof SyntaxError) _Controller.info.error.push({detail:e ,message : e.message});
			else _Controller.info.error.push({detail:e ,message : e});
			_Controller.endwait();
		}
		sqlPrint	    += (sql+ " <br/>");	
		sql     		= "";
		table   		= null;
	    columns 		= "*";
		limit           = "";
		relationship 	= [];
		condition 		= []; 

	}
	this.printsql = function(){
		return sqlPrint;
	}
	this.update = function($table,$dataUpdate,$where = null){
		var lengthArg = $dataUpdate.length;
		try{
			var sql = "UPDATE FROM "+$table+" SET "; 
			var i = 1;
			for(var key in $dataUpdate){
				if( isNaN($dataUpdate[key]) == true ) $dataUpdate[key] = "'" + $dataUpdate[key].trim() + "'";
				else $dataUpdate[key] = $dataUpdate[key].trim();
				if(lengthArg < i) sql += key + " = " + $dataUpdate[key] + ",";
				else sql += key + " = " + $dataUpdate[key];
				i++;
			}
			if(where != null){
				sql+ " WHERE ";
				i = 1;
				lengthArg = $where.length;
				for(var key in $where){
					if( isNaN($where[key]) == true ) $where[key] = "'" + $where[key].trim() + "'";
					else $where[key] = $where[key].trim();
					if(lengthArg < i) sql += key + " = " + $where[key] + " AND ";
					else sql += key + " = " + $where[key];
					i++;
				}
			}
			connection.query(sql);
			return true;
		}catch(e) {
    		if (e instanceof SyntaxError) write(e.message);
			else console.log(e);
			return false;
		}	
		
	}
	this.delete = function($table,$where){
		var sql = "DELETE FROM "+$table; 
		if($where != null){
			sql+ " WHERE ";
			i = 1;
			var lengthArg = $where.length;
			for(var key in $where){
				if( isNaN($where[key]) == true ) $where[key] = "'" + $where[key].trim() + "'";
				else $where[key] = $where[key].trim();
				if(lengthArg < i) sql += key + " = " + $where[key] + " AND ";
				else sql += key + " = " + $where[key];
				i++;
			}
			try{
				connection.query(sql);
				sqlPrint += sql + "<br/>";
				return true;
			}catch(e) {
    			if (e instanceof SyntaxError) write(e.message);
				else console.log(e);
				return false;
			}
		}
	}
	this.insert = function($table,$data,$callback){
		try{
			connection.query('INSERT INTO '+$table+' SET ?',$data, function(err, result) {
			  	$callback(err, result);
			});
			return true;
		}catch(e) {
			if (e instanceof SyntaxError) write(e.message);
			else console.log(e);
			return false;
		}
	}
	this.sql = function($sql,$callback){
		var options = {sql: $sql, nesttables: false};
		try {	
			this.connection.query(options,function(err, rows, fields){$callback(err, rows, fields);});
			sqlPrint += sql + "<br/>";
			return true;
		}catch(e) {
    		if (e instanceof SyntaxError) write(e.message);
			else console.log(e);
			return false;
		}
	}
}
module.exports = driverMysql;

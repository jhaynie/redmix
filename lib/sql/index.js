/**
 *
 */
var sqlParser = require('simple-sql-parser'),
	path = require('path'),
	fs = require('fs'),
	_ = require('lodash'),
	util = require('../util');

function parse(query, opts, callback) {
	if (_.isFunction(opts)) {
		callback = opts;
		opts = {};
	}
	var ast = sqlParser.sql2ast(query);
	util.trace(opts,'ast','SQL AST',ast);
	if (ast.status) {
		var value = ast.value,
			type = value.type,
			parser = path.join(__dirname, type+'.js');
		if (fs.existsSync(parser)) {
			parser = require(parser);
			parser.parse(value, callback);
		}
		else {
			return callback(new Error("SQL type "+type+" not supported"));
		}
	}
	else {
		var messages = [
			'Invalid SQL: '+ast.error+' at position '+ast.index,
			'',
			'SQL statement was: '+query,
			'--------------------' + (ast.index > 0 ? Array(ast.index).join('-') : '') + '^'
		];
		callback(new Error(messages.join('\n')));
	}
}

exports.parse = parse;

// FOR TESTING
if (module.id === ".") {
	var query = 'SELECT name from Files where name = "a"';
	parse(query, function(err,result){
		if (err) { 
			console.log(err.message);
			process.exit(1);
		}
		console.log(JSON.stringify(result,null,2));
	});
}

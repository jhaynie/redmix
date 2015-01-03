var util = require('./util'),
	objects = require('../conf/objects'),
	querylib = require('./query'),
	sqllib = require('./sql'),
	fs = require('fs'),
	path = require('path'),
	_ = require('lodash'),
	chalk = require('chalk'),
	inquirer = require('inquirer');


function sqlCreator (sqlString, opts, callback) {
	sqllib.parse(sqlString, opts, function(err,result){
		if (err) { return callback(err); }
		// get the object for querying
		var object = result.object;
		// remove it from the payload
		delete result.object;
		var type = result.type;
		delete result.type;
		switch (type) {
			case 'select': {
				var executor = util.createACSFunctor(object,'query',opts);
				return callback(null, executor, result);
			}
			case 'delete': {
				return deleteCreator(object,null,opts,callback,result);
			}
			default: {
				return callback(new Error("query type not handled:"+type));
			}
		}
	});
}

function queryCreator(classname, queryString, opts, callback) {
	var query = querylib.parse(queryString,opts),
		executor = util.createACSFunctor(classname,'query',opts);
	return callback(null, executor, query);
}

function deleteCreator(classname, idString, opts, callback, query) {
	opts = opts || {};
	
	var message, def = true;

	if (!query) {
		query = {};
		var idlist = util.makeArray(idString);
		if (idlist.length===1) {
			query.id = idlist[0];
		}
		else {
			query.ids = idlist.join(',');
		}
		message = "Are you sure you want to delete the following ids:\n\n\t"+chalk.red(idlist.join("\n\t"))+"\n\nPlease confirm deletion: ";
	}
	else {
		var q = _.pick(query,'where');
		if (Object.keys(q.where).length===0) {
			def = false;
			message = "Are you sure you want to delete "+chalk.red.underline("all the records")+" from the table "+classname+"? Please confirm deletion: ";
		}
		else {
			message = "Are you sure you want to delete the following query:\n\n"+chalk.red(JSON.stringify(q,null,2))+"\n\nPlease confirm deletion: ";
		}
	}

	inquirer.prompt([
		{
			type: 'confirm',
			name: 'confirm',
			message: message,
			default: def,
			when: function() {
				return opts.prompt===undefined || opts.prompt;
			}
		}
	], function(answers){
		if (answers.confirm) {
			var executor = util.createACSFunctor(classname,['batchDelete','delete'],opts);
			return callback(null, executor, query);
		}
		return callback(new Error("Cancelled!"));
	});
}

function createCreator(classname, objectString, opts, callback) {
	opts = opts || {};
	var executor = util.createACSFunctor(classname,'create',opts),
		value = util.parseObjectAsJS(objectString);

	if (executor.custom) {
		value = {
			classname: classname,
			fields: value
		};
	}
	else {
		var schema = objects[executor.objectName.toLowerCase()];
		if (!schema) {
			return callback(new Error("couldn't find schema for "+executor.objectName));
		}
		var keys = Object.keys(schema.fields);
		for (var c=0;c<keys.length;c++) {
			var key = keys[c];
			var desc = schema.fields[key];
			if (desc.required && !(key in value)){
				return callback(new Error("required attribute '"+key+"' missing. '"+key+"' is "+desc.description));
			}
			var v = value[key];
			if (desc.array) {
				v = util.makeArray(v);
			}
			if (v && desc.path) {
				v = util.resolvePath(v);
				if (!fs.existsSync(v)) {
					return callback(new Error("required attribute '"+key+"' path not found at "+v+". '"+key+"' is "+desc.description));
				}
			}
			if (desc.required_if_missing) {
				if (!(desc.required_if_missing in value)) {
					return callback(new Error("required attribute '"+key+"' missing. '"+key+"' is "+desc.description));
				}
			}
			value[key]=v;
		}
		// any fields not defined in the schema, we need to put into custom_fields
		var custom_fields = {};
		Object.keys(value).forEach(function(key){
			if (!(key in schema.fields)) {
				custom_fields[key] = value[key];
				delete value[key];
			}
		});
		if (Object.keys(custom_fields).length) {
			if (schema.supports_custom) {
				value.custom_fields = custom_fields;
			}
			else {
				return callback(new Error(executor.objectName+" doesn't support custom fields"));
			}
		}
	}
	if (opts.acl) {
		value.acl_name = opts.acl;
	}
	if (opts.acl_id) {
		value.acl_id = opts.acl_id;
	}
	if (opts.tags) {
		value.tags = opts.tags;
	}
	if (opts.user_id) {
		value.user_id = opts.user_id;
	}
	return callback(null, executor, value);
}

exports.createCreator = createCreator;
exports.queryCreator = queryCreator;
exports.sqlCreator = sqlCreator;
exports.deleteCreator = deleteCreator;

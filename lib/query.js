var vm = require('vm'),
	_ = require('lodash'),
	util = require('./util');

// these are the operator rules for parsing the query
var operatorMappings = {
	'=~': {op:'$regex', regex:true},
	'regex': {op:'$regex', regex:true},
	'like': {op:'$regex', regex:true},
	'not like': {op:'$regex', regex:true, negate:true},
	'near': {op:'$nearSphere', number:true, array:true},
	'=': {op:'=', assign:true},
	'is': {op:'=', assign:true},
	'equals': {op:'=', assign:true},
	'equal': {op:'=', assign:true},
	'eq': {op:'=', assign:true},
	'!=': {op:'$ne'},
	'not equals': {op:'$ne'},
	'not equal': {op:'$ne'},
	'not eq': {op:'$ne'},
	'>=': {op:'$gte', number:true},
	'>': {op:'$gt', number:true},
	'<=': {op:'$lte', number:true},
	'<': {op:'$lt', number:true},
	'in': {op:'$in',array:true},
	'not in': {op:'$nin',array:true},
	'contains': {op:'$in',array:true},
	'not contains': {op:'$nin',array:true},
};

// the query regular expression
var queryRegex = new RegExp('^(\\w+)\\s?('+Object.keys(operatorMappings).join('|')+')?\\s?(.*?)?$'),
	stringQuoteRegex = /^["'](.*?)['"]$/,
	isValidRegEx = /^\^(.*)/; // ACS requires this


/**
 * remove outer quotes from strings
 */
function dequoteString(str) {
	if (str && stringQuoteRegex.test(str)) {
		return stringQuoteRegex.exec(str)[1];
	}
	return str ? str.replace(/\\\"/g,'"') : str;
}

/**
 * parse args and opts into a suitable ACS query
 */
function parse(args, opts) {
	if (_.isString(args)) {
		args = [args];
	}
	opts = opts || {};

	var query = {where:{}};

	// walk through all the arguments and make our query
	for (var c=0;c<args.length;c++) {
		var arg = args[c],
			match = queryRegex.exec(arg),
			key = match && match[1],
			token = match && match[2],
			mapping = token && operatorMappings[token],
			value = match && dequoteString(match[3]);

		if (!match) {
			throw new Error("couldn't parse query: "+arg);
		}

		// this is a simple exists if we don't have an operator
		if (!mapping) {
			mapping = {op:'$exists'};
			value = true;
		}

		// if it looks like an object, make it an object
		if (util.isStringAnObject(value)) {
			value = util.parseObjectAsJS(value);
		}

		// value must be an array
		if (mapping.array) {
			if (!Array.isArray(value)) {
				if (_.isString(value)) {
					value = value.split(',');
				}
				else {
					value = [value];
				}
			}
		}

		if (mapping.number) {
			if (Array.isArray(value)) {
				/*jshint -W083 */
				value = value.map(function(v) { return Number(v); });
			}
			else {
				value = Number(value);
			}
		}

		if (mapping.regex) {
			if (!isValidRegEx.test(value)) {
				if (mapping.negate) {
					value = value='(?!'+value+')';
				}
				value = '^'+value;
			}
		}

		// this is an assignmment
		if (mapping.assign) {
			query.where[key] = value;
		}
		else {
			var obj = {};
			obj[mapping.op] = value;
			query.where[key] = obj;
		}
	}

	// add any options
	if (opts.limit) {
		query.limit = opts.limit;
	}
	if (opts.skip) {
		query.skip = opts.skip;
	}
	if (opts.order) {
		query.order = opts.order;
	}
	if (opts.sel) {
		query.sel = {all:util.makeArray(opts.sel)};
	}
	if (opts.unsel) {
		query.unsel = {all:util.makeArray(opts.unsel)};
	}

	return query;
}

exports.parse = parse;
exports.dequoteString = dequoteString;

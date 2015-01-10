var path = require('path'),
	fs = require('fs'),
	vm = require('vm'),
	_ = require('lodash'),
	util = require('util'),
	chalk = require('chalk'),
	ACSNode = require('acs-node'),
	objects = require('../conf/objects'),
	configDir = path.join(process.env.HOME || process.env.USERPROFILE),
	configFile = path.join(configDir,'.redmix.json'),
	cachedConfig;

function saveConfig (config) {
	if (!fs.existsSync(configDir)) {
		fs.mkdir(configDir);
	}
	cachedConfig = config;
	fs.writeFileSync(configFile, JSON.stringify(config||{}, null, 2));
}

function getConfig () {
	if (!fs.existsSync(configDir)) {
		fs.mkdir(configDir);
	}
	if (fs.existsSync(configFile)) {
		return (cachedConfig = JSON.parse(fs.readFileSync(configFile)));
	}
	return (cachedConfig = {});
}

function fail(err) {
	console.log(chalk.red(err.message || String(err)));
	process.exit(1);
}

function isConnected(config) {
	return (config.username && config.session && config.key) ||
		(config.aliases && config.alias && config.alias in config.aliases &&
		config.aliases[config.alias].username && config.aliases[config.alias].session &&
		config.aliases[config.alias].key);
}

function getACSConfig(config) {
	return config.alias && config.aliases && config.aliases[config.alias] || config;
}

/**
 * return a masked version of key
 */
function maskSessionValue(key) {
	return key && key.substring(0,Math.floor(Math.min(key.length/2,6))) + '******';
}

/**
 * used to mask session details so we don't ever log them to console or file
 * since they are sensitive and shouldn't be shared
 */
function maskSessionDetails(obj) {
	// make a copy so we don't jack with real config
	obj = _.clone(obj);
	if ('session' in obj) {
		obj.session = maskSessionValue(obj.session);
	}
	if ('key' in obj) {
		obj.key = maskSessionValue(obj.key);
	}
	if (obj.aliases) {
		Object.keys(obj.aliases).forEach(function(key){
			var entry = obj.aliases[key];
			entry.session = maskSessionValue(entry.session);
			entry.key = maskSessionValue(entry.key);
		});
	}
	return obj;
}

/**
 * return the ACS connection object
 */
function getACS (opts) {
	var config = _.merge(getConfig(), opts|| {});
	if (!isConnected(config)) {
		fail("Not connected. Run redmix connect to connect to your ACS app.");
	}
	var acsEntry = getACSConfig(config),
		acsApp = new ACSNode(acsEntry.key,{
			prettyJson: true,
			autoSessionManagement: false
		});
	trace(opts,'acs','ACS Env',maskSessionDetails(acsEntry));
	acsApp.sessionCookieString = '_session_id='+acsEntry.session;
	return acsApp;
}

function evalResult(code, result) {
	code = code.trim();
	// if we have a return, trim it out
	if (/^return\s+/.test(code)) {
		code = code.substring(6);
	}
	var jscode = 'function f(){ return ' + code + '; }; f';
	var fnobj = vm.runInNewContext(jscode);
	return fnobj.call(result);
}

var keyValueWithArray=/(\w+)\s?=\s?(\[[\w,'"\s]+\])/;
var keyValueWithObject=/(\w+)\s?=\s?(\{[\w,:'"\s]+\})/;

// make it easy to make the JSON look more like JS objects so
// the user doesn't have to actually do weird escaping
function parseObjectAsJS(value) {
	if (isStringAnObject(value)) {
		var code = 'var code = '+value+'; code;';
		return vm.runInNewContext(code);
	}
	else {
		var result = {}, m, key, originalValue = value;
		if (keyValueWithArray.test(value)) {
			// attempt to clean up the string to keep the regex more basic
			value = value.trim()
				.replace(/\s=\s/g,'=')
				.replace(/,\s/g,',')
				.replace(/\[\s/g,'[')
				.replace(/\s\]/g,']')
				.replace(/\s+,\s+/g,',')
				.replace(/\s+,/g,',');
			originalValue = value; // reset after trim
			var firstIndex = -1, lastIndex = -1;
			while(keyValueWithArray.test(value)) {
				m = keyValueWithArray.exec(value);
				key = m[1];
				result[key] = makeArray(m[2]);
				value = value.substring(m.index+m[0].length+1);
				if (firstIndex < 0) {
					firstIndex = m.index;
				}
				else {
					lastIndex = m.index;
				}
			}
			// if we went passed our original
			if (firstIndex > 0) {
				value = originalValue.substring(0, firstIndex);
			}
			// if we didn't go far enough
			else if (lastIndex > 0 && lastIndex < value.length) {
				value = value.substring(lastIndex);
			}
		}
		if (keyValueWithObject.test(value)) {
			value = value.trim()
				.replace(/\s=\s/g,'=')
				.replace(/,\s/g,',')
				.replace(/\{\s/g,'{')
				.replace(/\s\}/g,'}')
				.replace(/\s+,\s+/g,',')
				.replace(/\s+,/g,',');
			while(keyValueWithObject.test(value)) {
				m = keyValueWithObject.exec(value);
				key = m[1];
				result[key] = parseObjectAsJS(m[2]);
				value = value.substring(m.index+m[0].length+1);
			}
		}
		else {
			var tokens = value.split(',');
			tokens.forEach(function(line){
				var token = line.split("="),
					key = token[0].trim(),
					value = (token[1] || '').trim();
				result[key] = isStringAnObject(value) ? parseObjectAsJS(value) : value;
			});
		}
		return result;
	}
}

var isObjectPrefix = /^\s?[\[\{]/,
	isObjectSuffix = /[\}\]]\s?$/;

function isStringAnObject (value) {
	return isObjectPrefix.test(value) && isObjectSuffix.test(value);
}

function makeArray(value) {
	if (!value) { return []; }
	if (isStringAnObject(value)) {
		value = parseObjectAsJS(value);
		if (Array.isArray(value)) {
			return value;
		}
		return [value];
	}
	var tok = value.split(',');
	return tok.map(function(v) {
		return v.trim();
	});
}


function resolveBuiltinObject(objectName, objectList){
	if (objectName in objectList) {
		return objectList[objectName];
	}
	var properCase = objectName.charAt(0).toUpperCase() + objectName.substring(1);
	if (properCase in objectList) {
		return objectList[properCase];
	}
	if (properCase+'s' in objectList) {
		return objectList[properCase+'s'];
	}
	// look up using exact match
	var keys = Object.keys(objectList);
	for (var c=0;c<keys.length;c++) {
		var key = keys[c].toLowerCase();
		if (key === objectName) {
			return objectList[keys[c]];
		}
	}
	// if we couldn't find, we use CustomObjects
	return objectList.CustomObjects;
}

function createACSFunctor(objectName, methods, opts) {
	opts = opts||{};
	var acs = getACS(opts),
		objectList = acs.getACSObjects(),
		object = resolveBuiltinObject(objectName,objectList),
		desc = objects[object.objectName.toLowerCase()],
		methodObj,
		methodlist = Array.isArray(methods) ? methods : [methods];

	// search for a method in order of precedence
	for (var c=0;c<methodlist.length;c++) {
		var method = methodlist[c];
		var methodName = desc && desc[method] || method;
		if (methodName) {
			methodObj = object.methods[methodName];
			if (methodObj) {
				break;
			}
		}
	}

	// check to make sure we got one
	methodObj = methodObj || object.methods[methodlist[0]];

	if (!methodObj) {
		throw new Error("couldn't find a valid method using "+methodlist.join(",")+" for "+objectName);
	}

	var executor = methodObj && acs[methodObj.apiMethodName],
		custom = object.objectName==='customObjects',
		fn = function(query, callback) {
			var expressions, hook;
			if (query) {
				expressions = query.expressions;
				delete query.expressions;
				hook = query.hook;
				delete query.hook;
			}
			query = query || {};
			if (custom) {
				query.classname = objectName;
			}
			trace(opts,'query','ACS QUERY',query);
			executor.apply(acs, [query, function(err,result){
				if (err) {
					if (callback) {
						return callback && callback(err);
					}
					else {
						fail(err);
					}
				}
				try {
					var key = custom ? objectName : object.objectName.toLowerCase(),
						body = result.body && result.body.response && result.body.response[key],
						meta = result.body && result.body.meta;

					trace(opts,'meta','ACS META',meta);

					if (expressions) {
						// if we have expressions, we hook the callback to run them first
						if (body && body.length) {
							var newbody = {};
							for (var e=0;e<expressions.length;e++) {
								var expr = expressions[e];
								var exprResult = expr(body);
								if (Array.isArray(exprResult)) {
									body = newbody = exprResult;
								}
								else {
									// merge in each result
									newbody = _.merge(newbody,exprResult);
								}
							}
							if (!Array.isArray(newbody)) {
								body = [newbody];
							}
						}
					}

					if (hook) {
						body = hook(body);
					}

					/*jshint -W061 */
					if (opts.eval) {
						body = evalResult(opts.eval,body);
					}

					if (!callback) {
						return output(opts, body, meta, query);
					}
					else {
						return callback && callback(null, body, meta, result);
					}
				}
				catch (E) {
					if (callback) {
						return callback(E);
					}
					fail(E);
				}
			}]);
		};
	fn.objectName = object.objectName;
	fn.object = object;
	fn.custom = custom;
	return fn;
}

function resolvePath (fn) {
	var home = process.env.HOME || process.env.USERPROFILE;
	return path.resolve(process.cwd(), fn.replace(/~/g,home));
}

var validSelectExpressions = /^(count|max|min|avg|sum|round)\s?\(([\*\w]+)\)/i;
function parseSelectExpression(value) {
	if (validSelectExpressions.test(value)) {
		var match = validSelectExpressions.exec(value),
			op = match[1].toLowerCase(),
			field = match[2],
			jscode,
			record = field==='*' ? '' : '.'+field,
			makeFieldAccessor = function() {
				if (record) {
					return 'this[c]'+record+' || (this[c].custom_fields && this[c].custom_fields'+record+') ';
				}
				return 'this[c]';
			};
		switch (op) {
			case 'count': {
				if (record) {
					jscode = [
						'var value = 0',
						'for (var c=0;c<this.length;c++){',
						'  var found = !!('+makeFieldAccessor()+')',
						'  if (found) { value += 1; }',
						'}',
						'return value',
					].join(';\n');
				}
				else {
					jscode = 'return this.length';
				}
				break;
			}
			case 'max': {
				jscode = [
					'var value = 0',
					'for (var c=0;c<this.length;c++){',
					'  value = Math.max(value, ('+makeFieldAccessor()+'|| value))',
					'}',
					'return value',
				].join(';\n');
				break;
			}
			case 'min': {
				jscode = [
					'var value = Number.MAX_VALUE',
					'for (var c=0;c<this.length;c++){',
					'  value = Math.min(value, ('+makeFieldAccessor()+'|| value))',
					'}',
					'return value',
				].join(';');
				break;
			}
			case 'sum': {
				jscode = [
					'var value = 0',
					'for (var c=0;c<this.length;c++){',
					'  value += ('+makeFieldAccessor()+'|| 0)',
					'}',
					'return value',
				].join(';\n');
				break;
			}
			case 'avg': {
				jscode = [
					'var value = 0',
					'for (var c=0;c<this.length;c++){',
					'  value += '+makeFieldAccessor()+'||0',
					'}',
					'return value > 0 ? value/this.length : 0',
				].join(';\n');
				break;
			}
			case 'round': {
				jscode = [
					'var value = 0',
					'for (var c=0;c<this.length;c++){',
					'  value += '+makeFieldAccessor()+'||0',
					'}',
					'return Math.round(value)',
				].join(';\n');
				break;
			}
		}
		jscode = 'function f(){'+jscode+'}; f';
		// console.log(jscode);
		var fn = vm.runInNewContext(jscode);
		fn.op = op;
		fn.field = field;
		return fn;
	}
}

/**
 * get the output formats string
 */
function getOutputFormats() {
	return 'text, json, columns, csv, tsv';
}

/**
 * print result output
 */
function output(opts, body, meta, query) {
	if (!body && meta.status === 'ok') {
		if (/delete/i.test(meta.method_name)) {
			console.log("Deleted!");
		}
		return;
	}
	var format = opts.output || 'text';
	switch (format) {
		case 'text': {
			if (_.isString(body)) {
				console.log(body);
			}
			else {
				console.log(util.inspect(body,{colors:chalk.enabled,depth:null}));
			}
			break;
		}
		case 'json': {
			if (_.isString(body)) {
				console.log(body);
			}
			else {
				console.log(JSON.stringify(body,null,2));
			}
			break;
		}
		case 'tsv':
		case 'csv': {
			var json2csv = require('json-2-csv').json2csv,
				options = {};
			if (format==='tsv') {
				options.DELIMITER = {FIELD:'\t'};
			}
			if (query.sel && query.sel.all) {
				// put them in the right order by using the columns
				options.columns = query.sel.all;
			}
			json2csv(body, function(err, csv) {
				if (err) fail(err);
				console.log(csv);
			},options);
			break;
		}
		case 'columns': {
			var columnify = require('columnify'),
				columns = columnify(body,{
					headingTransform: function(value) {
						return chalk.white.bold.underline(value.toUpperCase());
					},
					columns: query.sel && query.sel.all,
					columnSplitter: '  ' // give it a little more space
				});
			console.log(columns);
			break;
		}
		default: {
			fail("Unsupported format: "+format);
		}
	}
}

/**
 * trace logging
 */
function trace(opts, key, label, msg) {
	if (opts && !opts.quiet && (opts[key] || opts.debug) && msg) {
		var obj = _.isObject(msg) ? util.inspect(msg,{colors:chalk.enabled,depth:null}) : msg;
		console.log(chalk.grey('['+label.toUpperCase()+'] ')+obj);
	}
}

/**
 * config color coding
 */
function setupColors(opts) {
	if (opts.colors===false) {
		chalk.enabled = false;
	}
}

exports.saveConfig = saveConfig;
exports.getConfig = getConfig;
exports.fail = fail;
exports.getACS = getACS;
exports.evalResult = evalResult;
exports.parseObjectAsJS = parseObjectAsJS;
exports.makeArray = makeArray;
exports.createACSFunctor = createACSFunctor;
exports.isStringAnObject = isStringAnObject;
exports.resolvePath = resolvePath;
exports.parseSelectExpression = parseSelectExpression;
exports.trace = trace;
exports.output = output;
exports.setupColors = setupColors;
exports.getOutputFormats = getOutputFormats;

var _ = require('lodash'),
	util = require('../util'),
	select = require('./select');


/**
 * parse SQL AST into ACS Query Format
 */
function parse (ast, opts, callback) {
	if (_.isFunction(opts)) {
		callback = opts;
		opts = {};
	}

	var from = ast.from && ast.from[0],
		query = {
			type: 'delete',
			object: from.table,
			where: select.parseWhereExpression(ast.where,ast.select)
		};

	callback(null, query);
}

exports.parse = parse;
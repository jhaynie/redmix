var querylib = require('../query'),
	util = require('../util'),
	_ = require('lodash');

/**
 * parse a SQL AST select into an ACS where
 */
function parseWhereExpression (where, select) {
	if (!where || !where.expression) {
		return {};
	}
	// parse the query
	var query = querylib.parse(where.expression).where;

	// fix any alias mappings
	if (select) {
		select.forEach(function(sel){
			if (sel.alias && sel.alias in query) {
				var expr = query[sel.alias];
				delete query[sel.alias];
				query[sel.column] = expr;
			}
		});
	}
	return query;
}

/**
 * create a row level expression evaluator for a select expression (such as COUNT(*))
 */
function createRowEvalExpressionEvaluator(select, allSelects, group, order) {
	var expr = util.parseSelectExpression(select.expression);
	if (expr) {
		return function(resultSet) {
			// if we have a group by, group each result and then do expressions over each group
			if (group && group.length) {
				var results = [];
				group.forEach(function(g){
					var groupByColumn = g.column;
					var rows = _.groupBy(resultSet,function(row){
						return (row[groupByColumn] || (row.custom_fields && row.custom_fields[groupByColumn]));
					});
					Object.keys(rows).forEach(function(key){
						var groupRows = rows[key], obj = {};
						obj[select.alias||select.expression] = expr.call(groupRows);
						obj[g.alias||groupByColumn] = key;
						results.push(obj);
					});
				});
				return results;
			}
			else {
				// flat result set
				var obj = {};
				obj[select.alias||select.expression] = expr.call(resultSet);
				return obj;
			}
		};
	}
}

/**
 * hook that will iterate over result set and set our aliases correctly and make
 * sure that any custom_fields that are aliases are put into the main row result
 */
function createFixColumnsHook(select, group, order){
	return function hook(resultSet) {
		if (!resultSet) { return; }
		for (var c=0;c<resultSet.length;c++) {
			var row = resultSet[c];
			for (var s=0;s<select.length;s++) {
				var sel = select[s];
				if (sel.column && row.custom_fields && sel.column in row.custom_fields) {
					var v = row.custom_fields[sel.column];
					delete row.custom_fields[sel.column];
					row[sel.alias] = v;
				}
			}
			if (row.custom_fields && !Object.keys(row.custom_fields).length) {
				delete row.custom_fields;
			}
		}
		// only deal with one re-order if the alias of the expression matches the order by
		// and we only deal with this in a group by scenario.  in an ideal world we would 
		// re-sort all the columns but since the DB will sort, will only need to resort a 
		// group by since it gets shuffled when the expression is done
		var needsResort = !!(group && group.length && order && order.length && _.filter(select,function(e){return !!e.evalExpression;}).length);
		if (needsResort) {
			var sortDown = /desc/i.test(order[0].order),
				column = order[0].column;
			resultSet.sort(function(a,b){
				var av = a[column],
					bv = b[column],
					r = av < bv ? -1 : av > bv ? 1 : 0;
				return sortDown ? -r : r;
			});
		}
		return resultSet;
	};
}

/**
 * parse SQL AST into ACS Query Format
 */
function parse (ast, opts, callback) {
	if (_.isFunction(opts)) {
		callback = opts;
		opts = {};
	}
	var select = ast.select,
		from = ast.from && ast.from[0],
		join = ast.join,
		where = ast.where,
		group = ast.group,
		order = ast.order,
		limit = ast.limit,
		queryCount = ast.from.length,
		aliases = {};

	if (queryCount > 1) {
		return callback(new Error("multiple SELECTs not supported at this time"));
	}

	var query = {
		type: 'select',
		object: from.table,
		sel: {all:[]},
		expressions: []
	};
	
	// select the columns
	for (var c=0;c<select.length;c++) {
		if (select[c].alias && select[c].column) {
			aliases[select[c].alias] = select[c].column;
		}
		if (select[c].expression!=='*') {
			// this is some sort of SQL expression
			if (select[c].expression && !select[c].column) {
				var expr = createRowEvalExpressionEvaluator(select[c],select,group,order);
				if (!expr) {
					return callback(new Error("unsupported field expression: "+select[c].expression));
				}
				select[c].evalExpression = true;
				query.expressions.push(expr);
			}
			else {
				query.sel.all.push(select[c].column);
			}
		}
	}

	// parse the where expression
	query.where = parseWhereExpression(where,select);

	// limit
	if (limit && limit.nb) {
		query.limit = limit.nb;
	}

	// order
	if (order && order.length) {
		query.order = order.map(function(o){
			return (o.order.toLowerCase()==='asc' ? '': '-') + (aliases[o.column] || o.column);
		}).join(',');
	}

	// remove it we are selecting all fields
	if ((!query.sel.all.length || query.sel.all[0]===null) || (query.expressions.length)) {
		delete query.sel;
	}

	// remove any empty expressions statements
	if (!query.expressions.length) {
		delete query.expressions;
	}

	query.hook = createFixColumnsHook(select,group,order);

	callback(null, query);
}

exports.parse = parse;
exports.parseWhereExpression = parseWhereExpression;

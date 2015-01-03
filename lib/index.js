/**
 * expose our main modules so this can be used as a module as well
 */
module.exports = require('./factory');
module.exports.querylib = require('./query');
module.exports.utillib = require('./util');
module.exports.sqllib = require('./sql');


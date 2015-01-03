var exec = require('child_process').exec;

module.exports = function(grunt) {

	var tests = ['test/*_test.js'];

	// Project configuration.
	grunt.initConfig({
		env: {
			dev: {
				APPC_TEST: '1'
			},
			cover: {
				APPC_TEST: '1'
			}
		},
		mochaTest: {
			options: {
				timeout: 3000,
				reporter: 'spec',
				ignoreLeaks: false,
				globals: []
			},
			src: tests
		},
		jshint: {
			options: {
				jshintrc: true
			},
			src: ['index.js', 'lib/**/*.js', 'test/**/*.js']
		},
		kahvesi: { src: tests },
		clean: ['tmp']
	});

	// Load grunt plugins for modules
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-kahvesi');
	grunt.loadNpmTasks('grunt-env');

	// compose our various coverage reports into one html report
	grunt.registerTask('report', function() {
		var done = this.async();
		exec('./node_modules/grunt-kahvesi/node_modules/.bin/istanbul report html', function(err) {
			if (err) { grunt.fail.fatal(err); }
			grunt.log.ok('composite test coverage report generated at ./coverage/index.html');
			return done();
		});
	});

	grunt.registerTask('cover', ['clean', 'env:cover', 'kahvesi', 'report']);
	grunt.registerTask('default', ['clean', 'jshint', 'env:dev', 'mochaTest']);

};

module.exports = function (grunt) {
	"use strict";

	var module = "angular-stripe-checkout";

	grunt.initConfig({
		compress: {
			main: {
				options: {
					mode: 'gzip'
				},
				files: [
					{src: module + '.min.js', dest: module+'.min.js.gz'}
				]
			}
		},

		uglify: {
			main: {
				options: {
					sourceMap: true,
					sourceMapName: module + '.map'
				},
				files: [
					{src: module + '.js', dest: module + '.min.js'}
				]
			}
		},

		clean: ["*.min.*"]

	});

	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');


	grunt.registerTask('default', ['uglify', 'compress']);
	grunt.registerTask('clean', ['clean']);

};
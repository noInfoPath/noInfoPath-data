module.exports = function(grunt) {

  	var DEBUG = !!grunt.option("debug");

  	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
	    concat: {
		    noinfopath: {
		        src: [
		        	'src/globals.js',
		        	'src/storage.js',
		        	'src/configuration.js',
		        	'src/http.js',
		        	'src/manifest.js',
		        	'src/indexeddb.js'
		        ],
		        dest: 'dist/lib/noinfopath-data.js'
		    }
	 	}		
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
 
	//Default task(s).
	//  grunt.registerTask('production', ['copy:production']);

};
module.exports = function(grunt) {

  	var DEBUG = !!grunt.option("debug");

  	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
	    concat: {
		    noinfopath: {
		        src: ['src/*.js'],
		        dest: 'dist/lib/noinfopath-data.js'
		    }
	 	},
        karma: {
          unit: {
            configFile: "karma.conf.js"
          },
          continuous: {
            configFile: 'karma.conf.js',
            singleRun: true,
            browsers: ['PhantomJS']
          }
        }		
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-karma');
 
	//Default task(s).
	//  grunt.registerTask('production', ['copy:production']);

};
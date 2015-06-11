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
		        dest: 'dist/noinfopath-data.js'
		    },
		    dexie: {
		    	src: [
		    		'lib/dexie.js',
		    		'lib/dexie.observable.js',
		    		'lib/dexie.syncable.js'
		    	],
		    	dest: 'dist/noinfopath-dexie.js'
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
        },
        bumpup: {
        	file: 'package.json'
    	},
    	version: {
    		options: {
        		prefix: '@version\\s*'
      		},
    		defaults: {
    			src: ['src/globals.js']
    		}
    	}		
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-bumpup');
	grunt.loadNpmTasks('grunt-version');
 
	//Default task(s).
	grunt.registerTask('build', ['karma:continuous', 'bumpup', 'version', 'concat:noinfopath','concat:dexie']);

};
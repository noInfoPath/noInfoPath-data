module.exports = function(grunt) {

  	var DEBUG = !!grunt.option("debug");

  	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
        copy: {
            test: {
                files: [
                    //{expand:true, flatten:false, src: [ 'lib/js/noinfopath/*.*'], dest: 'build/'},
                    {expand:true, flatten:true, src: [ 'dist/*.js'], dest: '../noinfopath-test-server-node/no/lib/js/noinfopath/'},
                ]
            }
        },
	    concat: {
		    noinfopath: {
		        src: [
		        	'src/globals.js',
                    'src/classes.js',
                    'src/query-builder.js',
		        	'src/storage.js',
		        	'src/configuration.js',
		        	'src/http.js',
                    'src/schema.js',
		        	'src/import.js',
		        	// 'src/indexeddb.js',
		        	'src/dexie.js'
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
            browsers: ['Chrome']
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
    	},
    	nodocs: {
    		"internal": {
    			options: {
    				src: 'dist/noinfopath-data.js',
    				dest: 'docs/noinfopath-data.wiki.md',
    				start: ['/*','/**']
    			}
    		},
    		"public": {
    			options: {
    				src: 'dist/noinfopath-data.js',
    				dest: 'docs/noinfopath-data.md',
    				start: ['/*']
    			}
    		}
    	},
        watch: {
            files: ['src/*.js', 'test/*.spec.js'],
            tasks: ['test']
        }
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-bumpup');
	grunt.loadNpmTasks('grunt-version');
 	grunt.loadNpmTasks('grunt-nodocs');
	//Default task(s).
	grunt.registerTask('build', ['karma:continuous', 'bumpup', 'version', 'concat:noinfopath','concat:dexie']);

    grunt.registerTask('test', ['karma:continuous', 'concat:noinfopath', 'nodocs:internal', 'copy:test']);

    grunt.registerTask('compile', ['karma:continuous', 'concat:noinfopath', 'nodocs:internal']);


};

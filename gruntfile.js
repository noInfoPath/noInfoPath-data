module.exports = function(grunt) {

	var DEBUG = !!grunt.option("debug");

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		copy: {
			test: {
				files: [
					//{expand:true, flatten:false, src: [ 'lib/js/noinfopath/*.*'], dest: 'build/'},
					{
						expand: true,
						flatten: true,
						src: ['dist/*.js'],
						dest: '../noinfopath-test-server-node/no/lib/js/noinfopath/'
					},
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
					'src/sql-builder.js',
					'src/websql-2.js',
					//'src/manifest.js',
					'src/transaction-cache.js',
					//'src/noInitDatabases.js',
					'src/indexeddb.js',
					'src/data-source.js',
					'src/misc.js',
					'src/dynamic-filters.js',
					'src/template-cache.js',
					'src/mock-http.js',
					'src/file-storage.js'
				],
				dest: 'dist/noinfopath-data.js'
			},
			dexie: {
				src: [
					'node_modules/dexie/dist/dexie.min.js'
				],
				dest: 'dist/noinfopath-dexie.js'
			},
			readme: {
				src: ['docs/noinfopath-data.md'],
				dest: 'readme.md'
			}

		},
		karma: {
			unit: {
				configFile: "karma.conf.js"
			},
			noDbSchema: {
				configFile: "karma.conf.noDBSchema.js",
				singleRun: true
			},
			noConfig: {
				configFile: "karma.conf.noConfig.js",
				singleRun: true
			},
			noWebSQL2: {
				configFile: "karma.conf.websql2.js",
				singleRun: false
			},
			noWebSQL2_ci: {
				configFile: "karma.conf.websql2.js",
				singleRun: true,
				logLevel: "error"
			},
			/*noInitDatabases: {
				configFile: "karma.conf.noInitDatabases.js",
				singleRun: true
			},*/
			continuous: {
				configFile: 'karma.conf.js',
				singleRun: true,
				browsers: ['Chrome']
			},
			ugly: {
				configFile: 'karma.ugly.conf.js',
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
					src: 'src/*.js',
					dest: 'docs/noinfopath-data.md',
					start: ['/*', '/**'],
					multiDocs: {
						multiFiles: true,
						dest: "docs/"
					}
				}
			},
			"internalGlobals": {
				options: {
					src: 'src/globals.js',
					dest: 'readme.md',
					start: ['/*', '/**']
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
			files: ['src/*.js', 'test/**/*.spec.js'],
			tasks: ['compile']
		},
		uglify: {
			options: {
				mangle: false
			},
			my_target: {
				files: {
					'dist/noinfopath-data.min.js': ['dist/noinfopath-data.js']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-bumpup');
	grunt.loadNpmTasks('grunt-version');
	grunt.loadNpmTasks('grunt-nodocs');
	//Default task(s).

	//Only globals.js in readme.md
	grunt.registerTask('build', ['karma:noWebSQL2_ci', 'bumpup', 'version', 'concat:noinfopath', 'nodocs:internal', 'nodocs:internalGlobals', 'concat:dexie']);

	//grunt.registerTask('build', ['karma:noWebSQL2_ci', 'bumpup', 'version', 'concat:noinfopath', 'nodocs:internal', 'concat:readme', 'concat:dexie']);

	grunt.registerTask('unstable', ['bumpup', 'version', 'concat:noinfopath', 'nodocs:internal', 'concat:readme', 'concat:dexie']);

	grunt.registerTask('notest', ['concat:noinfopath', 'copy:test']);

	grunt.registerTask('uglytest', ['concat:noinfopath', 'uglify', 'karma:ugly']);

	grunt.registerTask('compile', ['karma:noWebSQL2_ci', 'concat:noinfopath', 'nodocs:internal', 'concat:readme']);

	grunt.registerTask('document', ['concat:noinfopath', 'nodocs:internal', 'concat:readme']);

	grunt.registerTask('test', ['karma:unit']);

	grunt.registerTask('jenkins', ['karma:continuous']);

};

module.exports = function (grunt) {

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
					}
				]
			},
			test2: {
				files: [
					{
						expand: true,
						flatten: true,
						src: ['dist/*.js'],
						dest: '/Users/gochinj/ws/noinfopath-v3/noinfopath-app/test/http/lib/js/noinfopath'
					}
				]
			},
			wiki: {
	            files: [
	                {
	                    expand: true,
	                    flatten: true,
	                    src: ['docs/*.md', '!docs/global.md'],
	                    dest: '../wikis/<%= pkg.shortName %>.wiki/'
	                }
	            ]
	        }
		},
		concat: {
			noinfopath: {
				src: [
					'src/global.js',
					'src/helper-functions.js',
					'src/classes.js',
					'src/no-data-model.js',
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
					//'src/file-storage.js',
					'src/no-local-file-storage.js',
					'src/parameter-parser.js',
					'src/metadata.js'
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
	            src: ['docs/home.md'],
	            dest: 'readme.md'
	        },
			readmeFull: {
				src: ['docs/globals.md', 'docs/storage.md', 'docs/file-storage.md', 'docs/data-source.md', 'docs/transaction-cache.md', 'docs/template-cache.md', 'docs/http.md', 'docs/indexeddb.md', 'docs/websql-2.md', 'docs/no-local-file-storage.md', 'helper-functions.md', 'classes.md'],
				dest: 'readme.md'
			},
			wikiHome: {
	            src: ['docs/global.md'],
	            dest: 'docs/home.md'
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
				configFile: "karma.conf.nodatamodel.js",
				singleRun: true
				//logLevel: "error"
			},
			noDataModel: {
				configFile: "karma.conf.nodatamodel.js",
				singleRun: false
			},
			noDataSource: {
				configFile: "karma.conf.nodatasource.js",
				singleRun: false
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
				src: ['src/*.js']
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
					src: 'src/home.js',
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
			},
			wiki: {
	            options: {
	                src: 'src/*.js',
	                dest: 'docs/<%= pkg.shortName %>.md',
	                start: ['/*', '/**'],
	                multiDocs: {
	                    multiFiles: true,
	                    dest: "docs/"
	                }
	            }
	        }
		},
		watch: {
			dev: {
				files: ['src/*.js', 'test/**/*.spec.js'],
				tasks: ['compile'],
				options: {
					spawn: false
						// livereload: true
				}
			},
			document: {
				files: ['src/*.js'],
				tasks: ['document'],
				options: {
					spawn: false
						// livereload: true
				}
			}
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
		},
		shell: {
	        wiki1: {
	            command: [
	                'cd ../wikis/<%= pkg.shortName %>.wiki',
	                'pwd',
	                'git stash',
	                'git pull'
	            ].join(' && ')
	        },
	        wiki2: {
	            command: [
	                'cd ../wikis/<%= pkg.shortName %>.wiki',
	                'pwd',
	                'git add .',
	                'git commit -m"Wiki Updated"',
	                'git push'
	            ].join(' && ')
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
	grunt.loadNpmTasks('grunt-shell');

	//Default task(s).

	//Only globals.js in readme.md
	//grunt.registerTask('build', ['karma:noWebSQL2_ci', 'bumpup', 'version', 'concat:noinfopath', 'nodocs:internal', 'nodocs:internalGlobals', 'concat:dexie']);

	grunt.registerTask('build', ['karma:noWebSQL2_ci', 'bumpup', 'version', 'concat:noinfopath', 'nodocs:internalGlobals', 'nodocs:internal', 'concat:dexie', 'copy:wiki']);

	grunt.registerTask('unstable', ['bumpup', 'version', 'concat:noinfopath', 'nodocs:internal', 'concat:readme', 'concat:dexie']);

	grunt.registerTask('notest', ['concat:noinfopath', 'copy:test']);

	grunt.registerTask('uglytest', ['concat:noinfopath', 'uglify', 'karma:ugly']);

	grunt.registerTask('compile', ['karma:noWebSQL2_ci', 'concat:noinfopath', 'nodocs:internalGlobals']);

	grunt.registerTask('document', ['concat:noinfopath', 'nodocs:internal', 'copy:wiki']);

	grunt.registerTask('test', ['karma:unit']);

	grunt.registerTask('jenkins', ['karma:continuous']);

	//WikiWacked!
	grunt.registerTask('document', ['concat:noinfopath', 'nodocs:wiki']);
	grunt.registerTask('wikiWack', ['shell:wiki1', 'concat:wikiHome', 'copy:wiki', 'shell:wiki2']);
	grunt.registerTask('updateWiki', ['document', 'wikiWack']);
	grunt.registerTask('release', ['karma:noWebSQL2_ci', 'bumpup', 'version', 'concat:noinfopath', 'concat:dexie', 'updateWiki', 'copy:wiki', 'concat:wikiHome', 'concat:readme']);
};

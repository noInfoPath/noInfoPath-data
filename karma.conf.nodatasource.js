// Karma configuration
// Generated on Wed Dec 31 2014 11:18:56 GMT-0500 (Eastern Standard Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
	files: [
			'node_modules/es5-shim/es5-shim.min.js',
	        'node_modules/noinfopath-helpers/node_modules/jquery/dist/jquery.js',
	        'node_modules/moment/min/moment.min.js',
	        'node_modules/angular/angular.js',
	        'node_modules/angular-mocks/angular-mocks.js',
	        'node_modules/angular-base64/angular-base64.min.js',
	        'node_modules/ng-lodash/build/ng-lodash.js',
	        'node_modules/dexie/dist/dexie.js',
	        'node_modules/noinfopath/dist/noinfopath.js',
	        'node_modules/noinfopath-helpers/src/noinfopath-helpers.js',
	        'node_modules/noinfopath-helpers/src/noinfopath-filters.js',
	        'node_modules/@noinfopath/noinfopath-user/dist/noinfopath-user.js',
	        'node_modules/@noinfopath/noinfopath-logger/dist/noinfopath-logger.js',
			'node_modules/@noinfopath/noinfopath-data/test/mock/form-controller.mock.js',
			'src/global.js',
			'src/helper-functions.js',
			'src/classes.js',
			'src/no-data-model.js',
			'test/fixures/project.fixture.js',
			'test/fixures/project.schema.fixture.js',
			'test/mock/form-controller.mock.js',
			'test/mock/data-source.mock.js',
	        'test/no-data-source.spec.js',
	        'src/data-source.js',
	        'test/no-data-source.spec.js'
	    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    // preprocessors: {
    //     'src/*.js': 'coverage'
    // },

    coverageReporter: {
        type: 'cobertura',
        dir: 'coverage/'
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    // reporters: ['verbose', 'coverage'],
    reporters: ['verbose'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};

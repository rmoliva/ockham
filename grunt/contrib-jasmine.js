module.exports = function(grunt) {
  
  grunt.config('jasmine', {
    generic: {
      src: grunt.file.readJSON('files.json'),
      options: {
        specs: 'spec/**/*Spec.js',
        helpers: 'spec/*Helper.js',
        vendor: [
          'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.9.3/lodash.js',
          'https://cdnjs.cloudflare.com/ajax/libs/bluebird/2.9.30/bluebird.js'
        ],
        display: "full",
        template: require('grunt-template-jasmine-istanbul'),
        templateOptions: {
            coverage: 'coverage/coverage.json',
            report: [
                {
                    type: 'lcov',
                    options: {
                        dir: 'coverage/lcov'
                    }
                },
                {
                    type: 'text-summary'
                }
            ]
        }
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-jasmine');
};

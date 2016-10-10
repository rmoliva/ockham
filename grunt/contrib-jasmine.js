module.exports = function(grunt) {

  grunt.config('jasmine', {
    all: {
      src: grunt.file.readJSON('files.json'),
      options: {
        specs: 'spec/**/*Spec.js',
        helpers: 'spec/*Helper.js',
        vendor: [
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
    },
    spec: {
      src: grunt.file.readJSON('files.json'),
      options: {
        specs: ["spec/generic/<%= grunt.config.get('specFile') %>Spec.js"],
        helpers: 'spec/*Helper.js',
        vendor: [
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
  grunt.registerTask('spec', 'Runs a task on a specified file', function (fileName) {
    // Guardar el nombre del fichero para pasarselo luego a la tarea
    grunt.config('specFile', fileName);
    grunt.task.run('jasmine:spec');
  });

  grunt.loadNpmTasks('grunt-contrib-jasmine');
};

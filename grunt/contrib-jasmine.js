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
        display: "full"
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-jasmine');
};

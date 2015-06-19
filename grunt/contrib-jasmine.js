module.exports = function(grunt) {
  
  grunt.config('jasmine', {
    generic: {
      src: 'src/**/*.js',
      options: {
        specs: 'spec/**/*Spec.js',
        helpers: 'spec/*Helper.js',
        vendor: [
        ]
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-jasmine');
};
module.exports = function(grunt) {
  
  grunt.config('connect', {  
    server: {
      options: {
        port: 4000,
        base: '.',
        keepalive: true,
        hostname: '0.0.0.0', // here
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-connect');
};
module.exports = function(grunt) {
  
  grunt.config('clean', {
    dist: ["dist"]
  });
  
  grunt.loadNpmTasks('grunt-contrib-clean');
};

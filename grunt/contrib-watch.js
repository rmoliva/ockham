module.exports = function(grunt) {
  
  grunt.config('watch', {
    scripts: {
      files: ['src/**/*.js','files.json'],
      tasks: ["clean:dist", 'jshint:with_debug', "concat:dist"],
      options: {
        spawn: false
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-watch');
};

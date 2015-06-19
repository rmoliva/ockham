module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
  });

  //Load per-task config from separate files.
  grunt.loadTasks('grunt');

  // Default task(s).
  grunt.registerTask('default', ['jshint:all','jsbeautifier']);
  grunt.registerTask('buildjs', ["clean:dist", 'jsbeautifier', 'jshint:all', "concat:dist"]);
  grunt.registerTask('buildjs:with_debug', ["clean:dist", 'jsbeautifier', 'jshint:with_debug', "concat:dist"]);
  
  grunt.registerTask('deploy', function(commit_message) {
    var build_task = commit_message ? 
        'build:patch:'+commit_message : 
        'build:patch';
  });
};

module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
  });

  //Load per-task config from separate files.
  grunt.loadTasks('grunt');

  // Default task(s).
  grunt.registerTask('default', 'buildjs');
  grunt.registerTask('buildjs', ['jshint:all','jsbeautifier']);
  
  grunt.registerTask('deploy', function(commit_message) {
    var build_task = commit_message ? 
        'build:patch:'+commit_message : 
        'build:patch';
  });
};

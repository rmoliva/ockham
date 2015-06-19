module.exports = function(grunt) {
  
  grunt.config('build', {
    tasks: ['buildjs'],
    packageConfig: 'pkg',
    packages: 'package.json',
    jsonSpace: 2,
    jsonReplacer: undefined,
    gitAdd: '--all'
  });
  
  grunt.loadNpmTasks('grunt-bump-build-git');
};

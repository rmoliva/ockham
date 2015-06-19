module.exports = function(grunt) {
  
  grunt.config('jsbeautifier', {
    files : ["src/**/*.js"],
    options : {
      indentChar: " ",
      indentLevel: 0,
      indentWithTabs: false,
      preserveNewlines: true,
      maxPreserveNewlines: 10,
      jslintHappy: false,
      braceStyle: "collapse",
      keepArrayIndentation: false,
      keepFunctionIndentation: false,
      spaceBeforeConditional: true,
      breakChainedMethods: false,
      evalCode: false,
      wrapLineLength: 0,
      unescapeStrings: false    }
  });
  
  grunt.loadNpmTasks('grunt-jsbeautifier');
};
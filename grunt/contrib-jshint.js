module.exports = function(grunt) {
  
  grunt.config('jshint', {  
    all: [
      'Gruntfile.js', 
      'src/**/*.js',
      '!src/templates/**/*.js'
      
    ],
    options: {
      curly: true,
      eqeqeq: true,
      immed: true,
      latedef: true,
      newcap: true,
      noarg: true,
      sub: true,
      undef: true,
      boss: true,
      eqnull: true,
      node: true,
      strict: false,
      debug: true,
      globals: {
        "window": false,
        "NS": false,
        "_": false,
        "alert": false,
        "document": false,
        "Promise": true,
        "navigator": true,
        "Ockham": true,
        "define": true,
        "self": true
      }
    },
    with_debug: {
      options: {
        debug: true
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-jshint');
};

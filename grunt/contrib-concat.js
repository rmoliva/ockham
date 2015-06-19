module.exports = function(grunt) {
  
  grunt.config('concat', {
    options: {
      separator: ';',
      stripBanners: true,
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> */',    
    },
    dist: {
      src: grunt.file.readJSON('files.json'),
      dest: 'dist/ockham.max.js'
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-concat');
};

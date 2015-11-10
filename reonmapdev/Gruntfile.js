module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options:{
          separator:';'
        },
        dist: {
          src:[
            'vendor/js/hexbin.js', 
            'vendor/js/leaflet.markercluster-src.js',
            'vendor/js/leaflet-d3.js',
            'vendor/js/jquery.maskedinput.js',
            'vendor/js/bootswatch.js',
            'vendor/js/heatmap.js',
            'vendor/js/leaflet-heatmap.js',
            'vendor/js/leaflet-provider.js',
            'vendor/js/hexbin.js',
            'vendor/js/leaflet.label-src.js',
            'vendor/js/leaflet.iconlabel.js',         
            'vendor/js/angular-nvd3.js',   
            // 'js/controllers.js',
            // 'js/directives.js',
            // 'js/services.js',
            // 'js/app.js',
          ],
          dest:'bin/lib_<%= pkg.name %>.js'
        }   
    },

    uglify:{
      options:{
          banner:'/*! <%= pkg.name %> <%= grunt.template.today("yyyymmdd")%> */\n'
        },
        dist:{
          files:{
            'bin/lib_<%= pkg.name %>.min.js' : ['<%= concat.dist.dest %>']
          }
        }
    },

    cssjoin: {
      path_option:{
        files:{
          'bin/lib_<%= pkg.name %>.css': [
            'vendor/css/bootstrap.min.css',
            'bower_components/leaflet.markercluster/dist/MarkerCluster.css',
            'vendor/css/clusterpies.css',
            'vendor/css/leaflet.iconlabel.css',
          ]
        }
      }
    },
    
    cssmin: {
      css:{
        src:['bin/lib_<%= pkg.name %>.css' ],
        dest:'bin/lib_<%= pkg.name %>.min.css'
      }
    }, 
    express: {
      options: {
        // Override defaults here 
        cmd: process.argv[0],
        opts: [ ],
        args: [ ],
        background: true,
        fallback: function() {},
        port: 2222,
        // node_env: {},
        delay: 0,
        output: ".+",
        debug:false
      },
      dev: {
        options: {
          script: 'dev.js'
        }
      }
    },
    watch: {
      express: {
        files:  [ '**/*.js' ],
        tasks:  [ 'express:dev' ],
        options: {
          spawn: false // for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions. Without this option specified express won't be reloaded 
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-cssjoin');

  grunt.registerTask('default', ['concat','cssjoin', 'cssmin','uglify', 'express:dev', 'watch']);
  

};

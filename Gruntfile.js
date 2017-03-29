module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    shell: {
      prodServer: {
        command: 'git push live master',
        options: {
          stdout: true,
          stderr: true,
          failOnError: true
        }
      },
      compile: {
        command: 'babel ./client/src --out-dir ./client/compiled --presets=es2015,react --source-maps inline'
      }
    },

    concat: {
      options: {
        seperator: ';'
      },
      dist: {
        src: ['client/**/*.js'],
        dest: 'dist/build.js'
      }
    },

    clean: ['dist/build.js'],

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    eslint: {
      target: [
        'Gruntfile.js',
        'client/**/*.js',
        './*.js',
      ]
    },

    cssmin: {
      options: {
        keepSpecialComments: 0
      },
      dist: {
        files: {
          'dist/style.min.css': 'client/styles.css'
        }
      }
    },

    nodemon: {
      dev: {
        script: 'server/server.js'
      }
    },

    watch: {
      scripts: {
        files: ['client/src/**/*.jsx', 'client/src/**/*.js'],
        tasks: [
          'shell:compile',
          'concat',
          'uglify'
        ]
      }, css: {
        files: 'client/*.css',
        tasks: ['cssmin']
      }
    },

    concurrent: {
      tasks: ['start', 'watch'],
      options: {
        logConcurrentOutput: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');

  grunt.registerTask('server-dev', function (target) {
    grunt.task.run([ 'nodemon', 'watch' ]);
  });

  grunt.registerTask('compile', ['shell:compile']);
  grunt.registerTask('start', ['nodemon:dev']);
  grunt.registerTask('default', ['compile', 'concurrent']);
  grunt.registerTask('build', ['eslint', 'concat', 'cssmin']);
  grunt.registerTask('upload', function(n) {
    if (grunt.option('prod')) {
      grunt.task.run([ 'shell:prodServer' ]);
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });
    grunt.registerTask('deploy', function() {
    if (grunt.option('prod')) {
      grunt.task.run([
        'build',
        'upload:prod'
      ]);
    } else {
      grunt.task.run([
        'build',
        'upload'
      ]);
    }
  });


};
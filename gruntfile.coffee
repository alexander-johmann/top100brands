module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"

    notify:
      watch:
        options:
          title: 'Task Complete'
          message: 'SASS and Uglify finished running'
      server:
        options:
          message: 'Grunt finished'

    config:
      dev:
        options:
          variables:
            'assetsDir': 'develop',
            'buildDir':  'public',
            'sassOutputStyle': 'compressed'

    sass:
      dist:
        files: [
          expand: true
          cwd: "<%= grunt.config.get('assetsDir') %>"
          src: ['app.scss']
          dest: "<%= grunt.config.get('buildDir') %>/css"
          ext: '.css'
        ]
        options:
          style: "<%= grunt.config.get('sassOutputStyle') %>"
          loadPath: [require('node-bourbon').includePaths]

    coffee:
      compile:
        files:
          "<%= grunt.config.get('assetsDir') %>/js/compiled/oms.js": "<%= grunt.config.get('assetsDir') %>/js/oms.coffee"

    uglify:
      my_target:
        files:
          "<%= grunt.config.get('buildDir') %>/js/app.js": [
            "<%= grunt.config.get('assetsDir') %>/js/jquery-2.1.1.min.js",
            "<%= grunt.config.get('assetsDir') %>/js/skrollr.min.js",
            "<%= grunt.config.get('assetsDir') %>/js/skrollr.menu.min.js",
            "<%= grunt.config.get('assetsDir') %>/js/pace.js",
            "<%= grunt.config.get('assetsDir') %>/js/geojson.top100brands.js",
            "<%= grunt.config.get('assetsDir') %>/js/compiled/oms.js",
            "<%= grunt.config.get('assetsDir') %>/js/map.js"
          ]

      newer:
        options:
          override: (detail, include) ->
            if detail.task is 'sass'
              checkForModifiedImports(detail.path, detail.time, include)
            else
              include(false)

    watch:
      scripts:
        files: ["develop/**/*.{scss,css,js,coffee}"]
        tasks: ["default"]
        options:
          spawn: false

  grunt.loadNpmTasks "grunt-contrib-sass"
  grunt.loadNpmTasks "grunt-config"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-newer"
  grunt.loadNpmTasks "grunt-notify"

  grunt.registerTask "default", ["config:dev", "sass", "coffee", "newer:uglify", "notify:server"]

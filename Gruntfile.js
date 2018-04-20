module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify: {
            dist: {
                files: {
                    'src/views/assets/js/script.min.js': ['src/views/assets/js/**.min.js']
                },
                options: {
                    transform: ['babelify'],
                    browserifyOptions: {
                        debug: true,

                    }
                }
            }
        },

        uglify: {
            build: {
                files: [
                    {
                        expand: false,
                        //cwd: 'src/views/assets/js/components',
                        src: ['src/views/assets/js/components/*.js'],
                        dest: 'src/views/assets/js/components.min.js'
                    },
                    {
                        expand: false,
                        //cwd: 'src/views/assets/js/templates',
                        src: ['src/views/assets/js/templates/*.js'],
                        dest: 'src/views/assets/js/templates.min.js'
                    },
                    {
                        expand: false,
                        //cwd: 'src/views/assets/js/vendors',
                        src: ['src/views/assets/js/vendors/*.js'],
                        dest: 'src/views/assets/js/vendors.min.js'
                    }
                ]
            }
        },

        // Grunt sprite
        svg_sprite: {
            complex: {

                // Target basics
                expand: true,
                cwd: 'src/views',
                src: ['assets/sprites/*.svg'],
                dest: 'src/views/assets',

                // Target options
                options: {

                    mode: {
                        view: {            // Activate the «view» mode
                            bust: false,
                            render: {
                                scss: {
                                    dest: '../scss/components/_sprite'
                                }        // Activate Sass output (with default options)
                            },
                            sprite: '../svg/sprite'
                        },
                        symbol: false        // Activate the «symbol» mode
                    }
                }
            }
        },
    });

    // Load the plugin that provides the "browserify" task.
    grunt.loadNpmTasks('grunt-browserify');

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify-es');

    // Load the plugin "grunt svg"
    grunt.loadNpmTasks('grunt-svg-sprite');

    // Default task(s).
    grunt.registerTask('default', ['browserify:dist', 'uglify', 'svg_sprite']);
};

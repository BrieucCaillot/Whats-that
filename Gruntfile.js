module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

	    browserify: {
		    development: {
			    src: [
				    "src/views/assets/js/components/components.js",
				    "src/views/assets/js/templates/templates.js"
			    ],
			    dest: 'src/views/assets/js/script.min.js',
			    options: {
				    browserifyOptions: { debug: true },
				    transform: [["babelify", { "presets": ["es2015"] }]],
				    plugin: [
					    ["factor-bundle", { outputs: [
							    "src/views/assets/js/components.min.js",
							    "src/views/assets/js/templates.min.js"
						    ] }]
				    ]
			    },
			    watch: true,
			    keepAlive: true
		    },
		    production: {
			    src: [
				    "src/views/assets/js/components/components.js",
				    "src/views/assets/js/templates/templates.js"
			    ],
			    dest: 'src/views/assets/js/script.min.js',
			    options: {
				    browserifyOptions: { debug: true },
				    transform: [["babelify", { "presets": ["es2015"] }]],
				    plugin: [
					    ["factor-bundle", { outputs: [
							    "src/views/assets/js/components.min.js",
							    "src/views/assets/js/templates.min.js"
						    ] }]
				    ]
			    },
			    watch: true,
			    keepAlive: true
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

    // Load the plugin "grunt svg"
    grunt.loadNpmTasks('grunt-svg-sprite');

	grunt.registerTask("buildDev", ['browserify:development', 'svg_sprite']);
	grunt.registerTask("buildProd", ['browserify:production']);

    // Default task(s).
    // grunt.registerTask('default', ['browserify:dist', 'uglify', 'svg_sprite']);
};

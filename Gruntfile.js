module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: '\n'
            },
            dist: {
                src: [
                    'src/Idea.js',
                    'src/Conf.js',
                    'src/Slide.js',
                    'src/util/**.js',
                    'src/primitives/Object.js',
                    'src/primitives/**.js',
                    'src/ui/**.js',
                    'src/contrib/widgets/**.js',

                ],
                dest: '<%= pkg.name %>.js'
            }
        },
        jshint: {
            files: ['<%= concat.dist.dest %>'],
            options: {
                force: true, // continue even upon warnings
                asi: true, // do not warn on semicolons
                undef: true, // warn on undefined variables
                eqnull: true, // don't report error for a == null
                globals: {
                    window: true,
                    document: true,
                    alert: true,
                    setInterval: true,
                    clearInterval: true,
                    setTimeout: true,
                    clearTimeout: true,
                    console: true,
                    module: true,
                    browser: true,
                    CustomEvent: true,
                    FormData: true, // common browser objects,
                    Idea: true, //library name
                }
            }
        },
        qunit:{
            files: ['test/qunit.html']
        },
        watch: {
            files: ['<%= concat.dist.src %>'],
            tasks: ['concat', 'jshint'],
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-qunit');

    grunt.registerTask('default', ['concat', 'jshint']);
    grunt.registerTask('test', 'qunit');

};

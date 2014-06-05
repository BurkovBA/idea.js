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
                    'src/Util.js',
                    'src/Canvas.js',
                    'src/Slide.js',
                    'src/Widget.js',
                    'src/contrib/widgets/**.js'
                ],
                dest: '<%= pkg.name %>.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat']);

};

var compileFile = require('./lib/compile.js');
var fs = require('graceful-fs');
var _ = require('underscore');
var file = require('file');


var walk = function (options) {
    _.each(options, function (option) {
        file.walk(option.input, function (nill, dirPath, dirs, files) {
//            console.log(option.input);
            compileDirectory(option.input, option.output, files);
        });
    });
}

var compileDirectory = function (inputBaseDir, outputBaseDir, files) {
    _.each(files, function (file) {
        var relativePath = _.last(file.split(inputBaseDir));
        var newFile = outputBaseDir + '/' + _.initial(relativePath.split('.')) + '.js';
        compileFile(file, newFile);
    });
}

walk([
    {
        input: '/Users/Richard/projects/1stdibs-admin-v2/public/templates',
        output: '/Users/Richard/projects/1stdibs-admin-v2/src/js/templates'
    }
]);


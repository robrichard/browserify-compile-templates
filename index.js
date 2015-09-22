var compileFile = require('./lib/compile.js');
var path = require('path');
var transformTools = require('browserify-transform-tools');

module.exports = transformTools.makeStringTransform('compile-templates', {}, function (content, transformOptions, done) {
    var file = transformOptions.file;
    var output;
    var extension = path.extname(file);
    var options = transformOptions.opts;
    var acceptedExt = '.html';

    if(options.extension){
        acceptedExt = options.extension;
    }

    if (extension === acceptedExt) {
        output = compileFile(content, options);
        // If compileFile returned an error send that to done
        if (output instanceof Error) {
            done(output.message);
        } else {
            done(null, output);
        }
    } else {
        done(null, content);
    }
});

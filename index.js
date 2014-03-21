var compileFile = require('./lib/compile.js');
var path = require('path');
var _ = require('underscore');
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-compile-templates';

function gulpCompiler(passedOptions) {
    var options = _.defaults(passedOptions || {}, {
            verbose: true
        });

    var stream = through.obj(function (file, enc, callback) {
        var output;
        var dest = gutil.replaceExtension(file.path, ".js");

        if (file.isNull()) {
            this.push(file); // Do nothing if no contents
            return callback();
        }

        if (file.isBuffer()) {
            output = compileFile(file.contents);
            file.contents = new Buffer(output, "utf-8");
            file.path = dest;
            this.push(file);
            if (options.verbose) {
                gutil.log('Compiled template:', file.path);
            }
            return callback();
        }

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Buffers not supported!'));
            return callback();
        }
    });

    // returning the file stream
    return stream;
}

module.exports = gulpCompiler;
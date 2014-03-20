"use strict";

var compileFile = require('./lib/compile.js');
var fs = require('graceful-fs');
var _ = require('underscore');
var file = require('file');
var replaceExt = require('replace-ext');

module.exports = function (options) {
    _.each(options, function (option) {
        file.walk(option.input, function (nill, dirPath, dirs, files) {
            compileDirectory(option.input, option.output, files);
        });
    });


};

var compileDirectory = function (inputBaseDir, outputBaseDir, files) {
    _.each(files, function (file) {
        var relativePath = _.last(file.split(inputBaseDir));
        var newFile = outputBaseDir + '/' + replaceExt(relativePath, '.js') + '.js';
        compileFile(file, newFile);
    });
};
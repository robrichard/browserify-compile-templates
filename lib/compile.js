
var htmlparser = require('htmlparser2');
var fs = require('fs');
var _ = require('underscore');
var gutil = require('gulp-util');
var path = require('path');

var logError = function () {
    var plugin = '[' + gutil.colors.cyan('gulp-compile-templates') + ']';
    var err = gutil.colors.white.bgRed.bold('ERROR');
    var args = Array.prototype.slice.call(arguments);
    args.unshift(err);
    args.unshift(plugin);
    gutil.log.apply(gutil, args)
};

module.exports = function (html) {
    var output = '';
    var templateCount = 0;

    var writeOutput = new htmlparser.DomHandler(function (error, dom) {
        output += 'module.exports = {\n';
        _.each(dom, function (el, index) {
            if (el.children &&
                el.children[0] &&
                el.children[0].data &&
                el.type === 'script' &&
                el.attribs.type === 'text/template') {
                var templateString = el.children[0].data;
                var id = el.attribs.id;
                var compiled;
                try {
                    compiled = _.template(templateString, null, {variable: 'obj'});
                    output += '    "' + id + '": ' + compiled.source;
                    if (index !== (dom.length - 1)) {
                        output += ',';
                    }
                    output += '\n';
                    templateCount += 1;
                }
                catch (e) {
                    logError('compiling template', '#' + id, e.message);
                }
            }
        });
        output += '};';
    });

    var parser = new htmlparser.Parser(writeOutput);
    parser.parseComplete(html);

    if (templateCount > 0) {
        return output;
    } else {
        return '';
    }
};
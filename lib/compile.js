
var htmlparser = require('htmlparser');
var fs = require('fs');
var _ = require('underscore');
var gutil = require('gulp-util');
var path = require('path');

module.exports = function (html) {
    var output = '';
    var templateCount = 0;

    var writeOutput = new htmlparser.DefaultHandler(function (error, dom) {
        output += 'module.exports = {\n';
        _.each(dom, function (el, index) {
            if (el.type === 'script' && el.attribs.type === 'text/template') {
                var templateString = el.children[0].raw;
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
                    gutil.log('ERROR compiling template:', '#' + id, e.message);
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
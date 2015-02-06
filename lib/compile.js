'use strict';

var htmlparser = require('htmlparser2');
var _ = require('underscore');

module.exports = function (html, options) {
    var output = '';
    var templateCount = 0;
    var err = false;
    var compiledTemplates = [];

    var writeOutput = new htmlparser.DomHandler(function (error, dom) {
        output += "_ = require('underscore');\n";
        output += 'module.exports = {\n';
        _.each(dom, function (el) {
            if (el.children &&
                el.children[0] &&
                el.children[0].data &&
                el.type === 'script' &&
                el.attribs.type === 'text/template') {
                var templateString = el.children[0].data;
                var id = el.attribs.id;
                var compiled;
                var varName = el.attribs['data-variable-name'] || 'obj';
                if (options && options.noVar) {
                    varName = null;
                }
                try {
                    compiled = _.template(templateString, null, {variable: varName});
                    compiled = '    "' + id + '": ' + compiled.source;
                    compiledTemplates.push(compiled);
                    templateCount += 1;
                }
                catch (e) {
                    err = new Error('Template Compilation Error: ' + '#' + id + ' - ' + e.message);
                }
            }
        });
        output += compiledTemplates.join(',\n');
        output += '\n};';
    });

    var parser = new htmlparser.Parser(writeOutput);
    parser.parseComplete(html);

    if (err) {
        return err;
    }

    if (templateCount > 0) {
        return output;
    } else {
        return '';
    }
};
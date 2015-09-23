'use strict';

var htmlparser = require('htmlparser2');
var _ = require('underscore');
var engine = 'underscore';

var contextObj = 'ctx';

module.exports = function (html, options) {
    var output = '';
    var templateCount = 0;
    var err = false;
    var compiledTemplates = [];
    if(options.engine && ['underscore','lodash','none'].indexOf(options.engine)){
        engine = options.engine;
    }

    var writeOutput = new htmlparser.DomHandler(function (error, dom) {
        if(engine !== 'none'){
            output += "var _ = require('"+engine+"');\n";
        }
        output += 'module.exports = ';
        _.each(dom, function (el) {
            if (el.children &&
                el.children[0] &&
                el.children[0].data &&
                el.type === 'script' &&
                el.attribs.type === 'text/template' &&
                el.attribs.id) {
                var templateString = el.children[0].data;
                var id = el.attribs.id;
                var varName = el.attribs['data-variable-name'] || contextObj;
                if (options && options.noVar) {
                    varName = null;
                }
                try {
                    var compiled;
                    compiled = _.template(templateString, null, {variable: varName}).source;
                    compiled = '    "' + id + '": ' + compiled;
                    compiledTemplates.push(compiled);
                    templateCount += 1;
                }
                catch (e) {
                    err = new Error('Template Compilation Error: ' + '#' + id + ' - ' + e.message);
                }
            }
        });

        //try to compile html without script tags
        if(compiledTemplates.length == 0 ){
                try {
                    var compiled = _.template(html, {variable: contextObj}).source;
                    templateCount += 1;
                }
                catch (e) {
                    err = new Error('Template Compilation Error: ' + e.message);
                }
                output += compiled;
        }else{
            output += '{\n'
            output += compiledTemplates.join(',\n');
            output += '\n};';
        }
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

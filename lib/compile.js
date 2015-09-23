'use strict';

var htmlparser = require('htmlparser2');
var template = require('lodash.template');
var engine = 'underscore';

var defVarName = 'obj';

module.exports = function (html, options) {
    var output = '';
    var templateCount = 0;
    var err = false;
    var compiledTemplates = [];
    var localCompiledTemplates = [];
    if(options.engine && ['underscore','lodash','none'].indexOf(options.engine)){
        engine = options.engine;
    }

    var writeOutput = new htmlparser.DomHandler(function (error, dom) {
        for (var i = 0, len = dom.length; i < len; i++) {
            var el = dom[i];
            if (el.children &&
                el.children[0] &&
                el.children[0].data &&
                el.type === 'script' &&
                el.attribs.type === 'text/template' &&
                el.attribs.id) {
                var templateString = el.children[0].data;
                var id = el.attribs.id;
                var varName = el.attribs['data-variable-name'] || defVarName;
                var local = typeof el.attribs['local'] == 'string';

                if (varName === defVarName && options && options.variable) {
                    varName = options.variable;
                }

                if (options && options.noVar){
                    varName = null;
                }

                try {
                    var compiled;
                    compiled = template(templateString, null, {variable: varName}).source;
                    if(local){
                        compiled = 'var ' + id + '=' + compiled;
                        localCompiledTemplates.push(compiled);
                    }else{
                        compiled = '    "' + id + '": ' + compiled;
                        compiledTemplates.push(compiled);
                    }
                    templateCount += 1;
                }
                catch (e) {
                    err = new Error('Template Compilation Error: ' + '#' + id + ' - ' + e.message);
                }
            }
        };


        if(engine !== 'none'){
            output += "var _ = require('"+engine+"');\n";
        }

        //try to compile html without script tags
        if(!localCompiledTemplates.length && !compiledTemplates.length){
                try {
                    output += 'module.exports = ';
                    var compiled = template(html, {variable: defVarName}).source;
                    templateCount += 1;
                }
                catch (e) {
                    err = new Error('Template Compilation Error: ' + e.message);
                }
                output += compiled;
        }else{
            if(localCompiledTemplates.length){
                output += localCompiledTemplates.join('\n');
                output += '\n'
            }
            if(compiledTemplates.length){
                output += 'module.exports = ';
                output += '{\n'
                output += compiledTemplates.join(',\n');
                output += '\n};';
            }
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

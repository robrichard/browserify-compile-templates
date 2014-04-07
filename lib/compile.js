var htmlparser = require('htmlparser2');
var _ = require('underscore');

module.exports = function (html) {
    var output = '';
    var templateCount = 0;
    var err = false;

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
                var varName = el.attribs['data-variable-name'] || 'obj';
                try {
                    compiled = _.template(templateString, null, {variable: varName});
                    output += '    "' + id + '": ' + compiled.source;
                    if (index !== (dom.length - 1)) {
                        output += ',';
                    }
                    output += '\n';
                    templateCount += 1;
                }
                catch (e) {
                    err = new Error('Template Compilation Error: ' + '#' + id + ' - ' + e.message);
                }
            }
        });
        output += '};';
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
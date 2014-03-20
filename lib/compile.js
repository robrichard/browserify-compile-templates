var htmlparser = require('htmlparser');
var fs = require('graceful-fs');
var _ = require('underscore');
var mkdirp = require('mkdirp');
var path = require('path');

module.exports = function (inputFile, outputFile) {
    var writeOutput = new htmlparser.DefaultHandler(function (error, dom) {
        var output = '';
        var dirname = path.dirname(outputFile);
        var templateCount = 0;
        output += 'module.exports = {\n';
        _.each(dom, function (el, index) {
            if (el.type === 'script' && el.attribs.type === 'text/template') {
                var templateString = el.children[0].raw;
                var id = el.attribs.id;
                var compiled;
                try {
                    compiled = _.template(templateString, null, {variable: 'obj'});
                    output += '    "' + id + '": ' + compiled.source;
                    if (index !== (dom.length -1)) {
                        output += ',';
                    }
                    output += '\n';
                    templateCount += 1;
                }
                catch (e) {
                    console.log('ERROR compiling template:', '#' + id, e.message);
                    console.log(inputFile);
                }
            }
        });
        output += '};';
        if (templateCount > 0) {
            mkdirp.sync(dirname);
            console.log('Wrote', inputFile);
            fs.writeFile(outputFile, output);
        }
    });

    var html = fs.readFileSync(inputFile, { encoding: 'utf8'});
    var parser = new htmlparser.Parser(writeOutput);
    parser.parseComplete(html);
};
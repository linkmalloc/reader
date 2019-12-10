const path = require('path')
const glob = require('glob');
const fs = require('fs');
const xml2js = require('xml2js');


var files = glob.sync(path.join(__dirname, './src/assets/sample_book/OEBPS/*.xhtml'));
var counter = 0;
files.forEach(function (f) {
    fs.readFile(f, function (err, data) {
        var parser = new xml2js.Parser({
            explicitArray: false
        });
        parser.parseString(data, function (err, xml) {
            fs.writeFile(__dirname + "/tmp/chapter-" + counter + ".json", JSON.stringify(xml), function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log("The file was saved!");
            });
        });
        counter++;
        if (counter === files.length) {
            console.log("Done parsing")
        }
    });
});
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

const path = require('path');
const os = require('os');
const fs = require('fs');
const xml2js = require('xml2js');
const {
    parseEpub
} = require("@gxl/epub-parser");

exports.xhtmltojson = functions.storage.object().onFinalize(async (object) => {
    const fileBucket = object.bucket;
    const filePath = object.name;
    const contentType = object.contentType;
    const fileName = path.basename(filePath);
    const bucket = admin.storage().bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const metadata = {
        contentType: contentType,
    };

    if (contentType.startsWith('application/epub')) {
        await bucket.file(filePath).download({
            destination: tempFilePath
        });
        console.log('File downloaded locally to', tempFilePath);

        return parseEpub(tempFilePath).then(result => {
            let counter = 0;

            result.sections.forEach(section => {
                xml2js.parseString(section["htmlString"], function (err, result) {
                    // fs.writeFile("/tmp/json_" + counter + ".json", JSON.stringify(result), function (err) {
                    //     if (err)
                    //         console.log("Error creating json")
                    // });
                    console.log(result);
                    counter++;
                });
            });
            if (counter === result.sections.length)
                return fs.unlinkSync(tempFilePath);
        });

        // return fs.readFile(tempFilePath, function (err, data) {
        //     var parser = new xml2js.Parser({
        //         explicitArray: false
        //     });

        //     return parser.parseString(data, function (err, xml) {
        //         // fs.writeFile(tempFilePath, JSON.stringify(xml), function (err) {
        //         //     if (err) {
        //         //         return console.log(err);
        //         //     }
        //         // });
        //         console.log(JSON.stringify(xml));
        //         return fs.unlinkSync(tempFilePath);
        //     });
        // });

        // const jsonName = `json_${fileName}`;
        // const jsonPath = path.join(path.dirname(filePath), jsonName);

        // // Uploading the thumbnail.
        // await bucket.upload(tempFilePath, {
        //     destination: jsonPath,
        //     metadata: metadata,
        // });

        // // Once the thumbnail has been uploaded delete the local file to free up disk space.
        // return fs.unlinkSync(tempFilePath);
    }
});
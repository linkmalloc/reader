// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require("firebase-admin");
admin.initializeApp();

const path = require("path");
const os = require("os");
const fs = require("fs");
const xml2js = require("xml2js");
const { parseEpub } = require("@gxl/epub-parser");

exports.xhtmltojson = functions.storage.object().onFinalize(async object => {
    const fileBucket = object.bucket;
    const filePath = object.name;
    const contentType = object.contentType;
    const fileName = path.basename(filePath);
    const bucket = admin.storage().bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const metadata = {
        contentType: contentType,
    };

    // Check if the uploaded file is an epub, if yes, continue, otherwise, exit.
    if (contentType.startsWith("application/epub")) {
        // download the epub file to Cloud Functions' temp directory
        await bucket.file(filePath).download({
            destination: tempFilePath,
        });
        console.log("File downloaded locally to", tempFilePath);

        // Start parsing the epub
        return parseEpub(tempFilePath).then(result => {
            let counter = 0;

            // loop each section and convert to json
            result.sections.forEach(section => {
                xml2js.parseString(section["htmlString"], function(
                    err,
                    result
                ) {
                    let jsonName = "converted_" + counter + ".json";
                    let convertedFile = path.join(os.tmpdir(), jsonName);

                    // create file (the converted json) in the temp directory
                    fs.writeFile(
                        convertedFile,
                        JSON.stringify(result),
                        function(err) {
                            if (err) console.log("Error creating json");
                        }
                    );

                    // upload the file to Firebase Storage
                    bucket.upload(convertedFile, {
                        metadata: { contentType: "application/json" },
                    });
                    counter++;
                });
            });

            // If done converting and saving, remove all files from temp directory
            if (counter === result.sections.length) {
                fs.readdir(os.tmpdir(), (err, files) => {
                    if (err) throw err;

                    for (const file of files) {
                        fs.unlinkSync(path.join(os.tmpdir(), file), err => {
                            if (err) throw err;
                        });
                    }
                });
            }
        });
    }
});

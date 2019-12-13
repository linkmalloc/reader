// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require("firebase-admin");
const firestore = require("@google-cloud/firestore");
admin.initializeApp();

const path = require("path");
const os = require("os");
const fs = require("fs");
const xml2js = require("xml2js");
const {
    parseEpub
} = require("@gxl/epub-parser");

exports.xhtmltojson = functions.storage.object().onFinalize(async object => {
    const fileBucket = object.bucket;
    const filePath = object.name;
    const contentType = object.contentType;
    const fileName = path.basename(filePath);
    const bucket = admin.storage().bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    let booksCollection = admin.firestore().collection("books");

    // Check if the uploaded file is an epub, if yes, continue, otherwise, exit.
    if (!contentType.startsWith("application/epub")) {
        return console.log("Not an epub file.");
    }

    // download the epub file to Cloud Functions' temp directory
    await bucket.file(filePath).download({
        destination: tempFilePath,
    });
    console.log("File downloaded locally to", tempFilePath);

    // Start parsing the epub
    return parseEpub(tempFilePath).then(result => {
        let bookInfo = {
            title: result.info.title,
            author: result.info.author,
            publisher: result.info.publisher,
        };
        let counter = 0;
        let bookDoc = booksCollection
            .add(bookInfo)
            .then(ref => {
                let bookDocRef = booksCollection.doc(ref.id);

                // loop each section and convert to json
                for (let i = 0; i <= result.sections.length; i++) {
                    xml2js.parseString(result.sections[i]["htmlString"], function (err, json) {
                        let x = bookDocRef.collection("sections").add(json).then(x => {
                            console.log("Added:", x.id);
                        });
                        counter++;
                    });
                }

                // If done converting and saving, remove file from temp directory
                // if (counter === result.sections.length) {
                return fs.unlinkSync(tempFilePath, err => {
                    if (err) throw err;

                    console.log("Removed temp file.");
                });
                // }
            })
            .catch(err => {
                console.log("Error creating document:", err);
            });
    });
});
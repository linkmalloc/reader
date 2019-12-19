// The Firebase Admin SDK to access the Firebase Realtime Database.
const functions = require("firebase-functions");
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

        let bookDoc = booksCollection
            .add(bookInfo)
            .then(ref => {
                let counter = 0;
                let bookDocRef = booksCollection.doc(ref.id);
                let sectionInOrder = {};

                // loop each section and convert to json
                result.sections.forEach(section => {
                    return xml2js.parseString(section["htmlString"], (err, json) => {
                        if (err)
                            return console.log("Cannot parse", err);

                        return bookDocRef.collection("sections")
                            .doc("section_" + counter)
                            .set(JSON.parse(JSON.stringify(json)))
                            .then(addedSection => {
                                sectionInOrder[counter] = addedSection.id;
                                // bookDocRef.update({
                                //     sectionInOrder: sectionInOrder
                                // });
                                counter++;
                                return console.log("Added:", addedSection);
                            }).catch(err => {
                                return console.log("Cannot add sections", err);
                            });
                    });
                });

                return fs.unlinkSync(tempFilePath, err => {
                    if (err) throw err;
                    console.log("Removed temp file.");
                });
            })
            .catch(err => {
                return console.log("Error creating document:", err);
            });

        return bookDoc;
    });
});
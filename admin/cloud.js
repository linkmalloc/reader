
const fs = require('fs');
const admin = require("firebase-admin");

const serviceAccount = require("./.secret/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bgreader-3f54e.firebaseio.com"
});


const firestore = admin.firestore();

var files = glob.sync(path.join(__dirname, './tmp/*.json'));
var counter = 0;
files.forEach(function (f) {
    fs.readFile(f, function (err, data) {
        var json = JSON.parse(data);

        admin.fire
    });
});

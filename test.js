const firebase = require("firebase");
require("firebase/functions");
firebase.initializeApp({
    apiKey: "AIzaSyByBmiBAlj0Oq9kQde-InpYsovEiJcwyUk",
    authDomain: "bgreader-3f54e.firebaseapp.com",
    databaseURL: "https://bgreader-3f54e.firebaseio.com",
    projectId: "bgreader-3f54e",
    storageBucket: "bgreader-3f54e.appspot.com",
    messagingSenderId: "203228008986",
    appId: "1:203228008986:web:fbe98d22eab718a889f7a3",
    measurementId: "G-B7XZEDH1SV",
});
const functions = firebase.functions();

const httpXML2JS = firebase.functions().httpsCallable("httpXML2JS");
return httpXML2JS({
    fileURL: "sample_book.epub"
}).then(r => {
    return console.log(r.data);
}).catch(err => {
    return console.log(err);
});
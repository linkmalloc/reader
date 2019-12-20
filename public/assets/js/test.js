var firebaseConfig = {
    apiKey: "AIzaSyByBmiBAlj0Oq9kQde-InpYsovEiJcwyUk",
    authDomain: "bgreader-3f54e.firebaseapp.com",
    databaseURL: "https://bgreader-3f54e.firebaseio.com",
    projectId: "bgreader-3f54e",
    storageBucket: "bgreader-3f54e.appspot.com",
    messagingSenderId: "203228008986",
    appId: "1:203228008986:web:fbe98d22eab718a889f7a3",
    measurementId: "G-B7XZEDH1SV",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var functions = firebase.functions();

var setWindowHeight = function setWindowHeight() {
    var headerH = $("#main-header").outerHeight();
    var footerH = $("#main-footer").outerHeight();
    var windowH = $(window).outerHeight();
    var diffH = windowH - (headerH + footerH);
    $("#bookgini-reader").outerHeight(diffH);
};

// setWindowHeight();
var collectionURL = "https://firestore.googleapis.com/v1/projects/bgreader-3f54e/databases/(default)/documents/books/jkDPgf4Z6rJaTOOY8VXR/sections/";
var currentURL = new URL(window.location.href);
var sectionParam = currentURL.searchParams.get("section");
var bookParam = currentURL.searchParams.get("book"); //jkDPgf4Z6rJaTOOY8VXR

var firestoreParser = firebase.functions().httpsCallable('firestoreParser');
firestoreParser({
    bookID: bookParam,
    sectionID: "section_" + sectionParam
}).then(function (result) {
    var body = JSON.parse(result.data);
    var para = body[0].div[0].p;
    $.each(para, function (p, content) {
        $.each(content, function (attr, value) {
            console.log(value);
            if (attr !== "p") {
                if (($.isArray(value) || typeof value === 'object'))
                    return "";
                $("#bookgini-reader").append("<p>" + value + "</p>");
            }
        })
    })
});

// fetch(collectionURL + "section_" + sectionParam)
//     .then(response => response.json())
//     .then(json => FireStoreParser(json))
//     .then(json => console.log(json));

// var db = firebase.firestore();
// var docRef = db.collection("books").doc("jkDPgf4Z6rJaTOOY8VXR");
// var section = docRef.collection("sections").doc("section_12");

// section.get().then(function (doc) {
//     if (doc.exists) {
//         var body = doc.data()["html"]["body"][0]["div"];
//         $(body[0]).map(async (i, item) => {
//             // console.log(item.p);
//             item.p.forEach(function (value, index) {
//                 if (value._ !== undefined) {
//                     $("#bookgini-reader").append("<p>" + value._ + "</p>");
//                 }
//             })
//         });
//     } else {
//         console.log("No such document!");
//     }
// }).catch(function (error) {
//     console.log("Error getting document:", error);
// });
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
firebase.analytics();

var setWindowHeight = function setWindowHeight() {
    var headerH = $("#main-header").outerHeight();
    var footerH = $("#main-footer").outerHeight();
    var windowH = $(window).outerHeight();
    var diffH = windowH - (headerH + footerH);
    $("#bookgini-reader").outerHeight(diffH);
};

// setWindowHeight();

var db = firebase.firestore();
var docRef = db.collection("books").doc("jkDPgf4Z6rJaTOOY8VXR");
var section = docRef.collection("sections").doc("section_11");

section.get().then(function (doc) {
    if (doc.exists) {
        var body = doc.data()["html"]["body"][0]["div"];
        $(body[0]).map(async (i, item) => {
            console.log(item.p);
            item.p.forEach(function (value, index) {
                if (value._ !== undefined) {
                    $("#bookgini-reader").append("<p>" + value._ + "</p>");
                }
            })
        });
    } else {
        console.log("No such document!");
    }
}).catch(function (error) {
    console.log("Error getting document:", error);
});
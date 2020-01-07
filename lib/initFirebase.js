import firebase from "firebase";
import firestore from "firebase/firestore";

const initFirebase = () => {
    const firebaseConfig = {
        apiKey: "AIzaSyByBmiBAlj0Oq9kQde-InpYsovEiJcwyUk",
        authDomain: "bgreader-3f54e.firebaseapp.com",
        databaseURL: "https://bgreader-3f54e.firebaseio.com",
        projectId: "bgreader-3f54e",
        storageBucket: "bgreader-3f54e.appspot.com",
        messagingSenderId: "203228008986",
        appId: "1:203228008986:web:fbe98d22eab718a889f7a3",
        measurementId: "G-B7XZEDH1SV",
    };

    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    else firebase.app();

    return firebase.firestore();
};

export default initFirebase;

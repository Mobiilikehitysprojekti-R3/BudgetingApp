import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


const firebaseConfig = {
    apiKey: "AIzaSyBFyBpPXzdPiT-OEHGE3zTMlAdGn9rAaw0",
    authDomain: "budgetingappdb.firebaseapp.com",
    projectId: "budgetingappdb",
    storageBucket: "budgetingappdb.firebasestorage.app",
    messagingSenderId: "982570774761",
    appId: "1:982570774761:web:a6c6e22a9118efd9e48078",
    measurementId: "G-4ZRETXPH70"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser, db }
import { getFirestore, doc, setDoc } from "firebase/firestore"; 
import { getAuth } from "firebase/auth";
import { getDoc } from "firebase/firestore";


const db = getFirestore();
const auth = getAuth();
// Save income to user data in Firestore
async function saveUserData(income) {
    if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, { income: income }, { merge: true });
        console.log("Income added to user data.");
    } else {
        console.log("No user signed in.");
    }
}

saveUserData(50000);

async function getUserData() {
    if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            console.log("User data:", userSnap.data());
        } else {
            console.log("No user data found.");
        }
    }
}

getUserData();


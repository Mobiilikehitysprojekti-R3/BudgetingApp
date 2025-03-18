import { getFirestore, doc, setDoc, updateDoc } from "firebase/firestore"; 
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDoc } from "firebase/firestore";
import { auth } from "./config";

const db = getFirestore();
//const auth = getAuth();

// Get the currently signed-in user
//const user = auth.currentUser;

onAuthStateChanged(auth, () => {
    const user = auth.currentUser;
    if (user) {
        console.log("User logged in:", user.uid);
        
        // Call functions only after the user is logged in
        updateUserIncome(50000);
        updateUserBudget(10000);
        getUserData();
    } else {
        console.error("No user logged in.");
    }
});

// Function to create an income field and update it to Firestore
const updateUserIncome = async (income) => {
    const user = auth.currentUser;

    if (!user) {
      console.error("No user logged in.");
      return;
    } else {
        try {
            await setDoc(doc(db, "users", user.uid), {
                income: income, // Add or update the "income" field
            });
            console.log("Income field added/updated!");
            console.log("User income:", income);
            } catch (error) {
            console.error("Error updating user data:", error);
            }
    }
  };

// Function to create a budget field and update it to Firestore
const updateUserBudget = async (budget) => {
    const user = auth.currentUser;

    if (!user) {
        console.error("No user logged in.");
        return;
    } else {
        try {
            await setDoc(doc(db, "users", user.uid), {
                budget: budget, // Add or update the "budget" field
            });
            console.log("Budget field added/updated!");
            console.log("User budget:", budget);
            } catch (error) {
            console.error("Error updating user data:", error);
            }
    }
};

// Function to get user data from Firestore
async function getUserData() {
    const user = auth.currentUser;
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

export { updateUserIncome, updateUserBudget, getUserData };
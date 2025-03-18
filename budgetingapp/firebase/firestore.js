import { getFirestore, doc, setDoc } from "firebase/firestore"; 
import { getAuth } from "firebase/auth";
import { getDoc } from "firebase/firestore";


const db = getFirestore();
const auth = getAuth();

// Get the currently signed-in user
const userId = auth.currentUser;

// Function to create an income field and update it to Firestore
const updateUserIncome = async (userId, income) => {
    if (!userId) {
      console.error("No user logged in.");
      return;
    } else {
        try {
            await updateDoc(doc(db, "users", userId), {
                income: income, // Add or update the "income" field
            });
            console.log("Income field added/updated!");
            } catch (error) {
            console.error("Error updating user data:", error);
            }
    }
  };

// Function to create a budget field and update it to Firestore
const updateUserBudget = async (userId, budget) => {
    if (!userId) {
        console.error("No user logged in.");
        return;
    } else {
        try {
            await updateDoc(doc(db, "users", userId), {
                budget: budget, // Add or update the "budget" field
            });
            console.log("Budget field added/updated!");
            } catch (error) {
            console.error("Error updating user data:", error);
            }
    }
};
  
// Test values for income and budget
updateUserIncome(userId, 50000);
updateUserBudget(userId, 10000);


// Function to get user data from Firestore
// This function will log the user data to the console
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


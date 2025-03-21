import { getFirestore, doc, setDoc, updateDoc } from "firebase/firestore"; 
import { getAuth, onAuthStateChanged, updateEmail, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { getDoc } from "firebase/firestore";
import { auth, db } from "./config";

//const db = getFirestore();

onAuthStateChanged(auth, () => {
    const user = auth.currentUser;
    if (user) {
        console.log("User logged in:", user.uid);
        
        // Call functions only after the user is logged in
        //updateUserIncome(50000);
        //updateUserBudget(10000);
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
            await setDoc(doc(db, "users", user.uid), { //updateDoc?
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

// Function to update the user's name.
const updateUserName = async (name) => {
    const user = auth.currentUser // Get the currently logged-in user

    if (!user) {
        console.error("No user logged in.")
        return
    }

    try {
        // Update Firestore document
        await updateDoc(doc(db, "users", user.uid), {
            name: name
        })
        console.log("User name updated!")
    } catch (error) {
        console.error("Error updating user name:", error)
    }
}

// Function to update the user's phone number.
const updateUserPhone = async (phone) => {
    const user = auth.currentUser

    if (!user) {
        console.error("No user logged in.")
        return
    }

    try {
        // Update Firestore document
        await updateDoc(doc(db, "users", user.uid), {
            phone: phone
        })
        console.log("User phone updated!")
    } catch (error) {
        console.error("Error updating user phone:", error)
    }
}

// Function to update the user's email address (requires re-authentication).
const updateUserEmail = async (newEmail, currentPassword) => {
    const user = auth.currentUser

    if (!user) {
        console.error("No user logged in.")
        return
    }

    // Create credential for re-authentication
    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    try {
        // Re-authenticate the user
        await reauthenticateWithCredential(user, credential)
        console.log("Re-authentication successful!")

        // Update email in Firebase Authentication
        await updateEmail(user, newEmail)
        console.log("Email updated successfully in Authentication!")

        // Update email in Firestore
        await updateDoc(doc(db, "users", user.uid), {
            email: newEmail,
        })
        console.log("Email updated successfully in Firestore!")

    } catch (error) {
        console.error("Error updating email:", error.message)
    }
}

// Function to update the user's password (requires re-authentication).
const updateUserPassword = async (currentPassword, newPassword) => {
    const user = auth.currentUser
    
    if (!user) {
        console.error("No user logged in.")
        return
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword)

    try {
        // Re-authenticate the user
        await reauthenticateWithCredential(user, credential);
        console.log("Re-authentication successful!");

        // Update password in Firebase Authentication
        await updatePassword(user, newPassword)
        console.log("Password updated successfully!")

    } catch (error) {
        console.error("Error updating password:", error.message)
    }
}

getUserData();

export { updateUserIncome, updateUserBudget, getUserData, updateUserPhone, updateUserName, updateUserEmail, updateUserPassword };
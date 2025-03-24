import { getFirestore, doc, setDoc, updateDoc, deleteDoc, collection, getDocs, addDoc } from "firebase/firestore"; 
import { getAuth, onAuthStateChanged, updateEmail, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { getDoc } from "firebase/firestore";
import { auth, db, deleteUser } from "./config";

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
            await setDoc(doc(db, "users", user.uid), {
                income: income, // Add or update the "income" field
            }, {merge: true});
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
            }, {merge: true});
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
const updateUserName = async (name, currentPassword) => {
    const user = auth.currentUser // Get the currently logged-in user

    if (!user) {
        console.error("No user logged in.")
        return
    }

    // Create credential for re-authentication
    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    try {
        await reauthenticateWithCredential(user, credential)

        // Update Firestore document
        await updateDoc(doc(db, "users", user.uid), {
            name: name
        }, {merge: true})
        console.log("User name updated!")
    } catch (error) {
        console.error("Error updating user name:", error)
    }
}

// Function to update the user's phone number.
const updateUserPhone = async (phone, currentPassword) => {
    const user = auth.currentUser

    if (!user) {
        console.error("No user logged in.")
        return
    }

    // Create credential for re-authentication
    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    try {
        await reauthenticateWithCredential(user, credential)

        // Update Firestore document
        await updateDoc(doc(db, "users", user.uid), {
            phone: phone
        }, {merge: true})
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
        }, {merge: true})
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

// Function to delete the user's account and data
const deleteAccount = async () => {
    const user = auth.currentUser;
    if (user) {
        try {
            // Delete user data from Firestore
            await deleteDoc(doc(db, "users", user.uid));
            console.log("User data deleted successfully!");    
            // Delete user from Firebase Authentication
            await deleteUser(user);
            console.log("User deleted successfully!");
        } catch (error) {
            console.error("Error deleting user:", error.message);
        }
    } else {
        console.error("No user logged in.");
    }
}

// Get remaining budget from Firestore
const getRemainingBudget = async () => {
    const user = auth.currentUser;
    if (!user) return null;

    const userRef = doc(db, "users", user.uid);
    // get data from the user document
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        const data = userSnap.data();
        return data.remainingBudget ?? data.budget ?? 0;
    } else {
        // If no document, create one with default budget
        await setDoc(userRef, {
            budget: 10000,
            remainingBudget: 10000
        });
        return 10000;
    }
};

// Add a new budget field and subtract from remaining budget
const addBudgetField = async (field, value) => {
    console.log("Current user:", auth.currentUser);
    const user = auth.currentUser;
    if (!user) return { error: "No user logged in." };
    // ger user document
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return { error: "User document not found." };

    const data = userSnap.data();
    const currentRemaining = data.remainingBudget ?? data.budget ?? 0;

    if (value > currentRemaining) {
        return { error: "Insufficient remaining budget." };
    }
    const safeField = field.replace(/[^a-zA-Z0-9_]/g, "_");
    // add new field and update remaining budget
    try {
        await setDoc(userRef, {
            [safeField]: value,
            remainingBudget: currentRemaining - value
        }, { merge: true });

        console.log("Firestore update successful:", {
            [safeField]: value,
            remainingBudget: currentRemaining - value
        });

        return { success: true, remainingBudget: currentRemaining - value };
    } catch (error) {
        console.error("Error adding budget field:", error);
        return { error: "Failed to update budget." };
    }
};

const createGroup = async (groupName, selectedMembers) => {
    const user = auth.currentUser // Get the currently logged-in user
  
    if (!user) {
      return alert("You need to be logged in to create a group")
    }
  
    if (!groupName.trim()) {
      return alert("Enter a valid group name")
    }
  
    // Prepare group data
    const newGroup = {
        name: groupName,
        owner: user.uid, // Set the creator as the owner
        members: selectedMembers.map((user) => ({
            uid: user.uid, // Store user ID
            phone: user.phone, // Store phone number
            name: user.dbName, // Store name from database
        })),
    }
    
    try {
        await addDoc(collection(db, "groups"), newGroup)
        alert("Group Created!")
    } catch (error) {
        console.error("Error creating group:", error)
        alert("Failed to create group")
    }
}

// Normalize phone numbers by removing non-digit characters
const normalizePhoneNumber = (number) => {
    if (!number) return ""
    let formatted = number.replace(/\D/g, "") // Remove all non-digit characters
    if (formatted.startsWith("0")) {
      formatted = "358" + formatted.slice(1) // Convert local Finnish numbers to international format
    }
    return formatted
}

// Fetch all registered users from database
const getRegisteredUsers = async () => {
    const usersRef = collection(db, "users")
    const snapshot = await getDocs(usersRef)
  
    return snapshot.docs.map((doc) => ({
        uid: doc.id, // Get user ID
        phone: normalizePhoneNumber(doc.data().phone),
        dbName: doc.data().name, // Get name from database
    }))
}

// Check if contacts exist in database
const matchContactsToUsers = async (contacts) => {
    const usersFromDB = await getRegisteredUsers()
  
    return contacts
      .map((contact) => {
        const phoneNumber = normalizePhoneNumber(contact.phoneNumbers?.[0]?.number)
        const matchedUser = usersFromDB.find(user => user.phone === phoneNumber)
        if (matchedUser) {
            return {
                id: contact.id,
                uid: matchedUser.uid,
                contactName: contact.name, // Contact name from phone
                dbName: matchedUser.dbName, // Name from database
                phone: phoneNumber,
            }
        }
        return null
      })
      .filter(Boolean)
}

getUserData();

export { createGroup, matchContactsToUsers, updateUserIncome, updateUserBudget, getUserData, updateUserPhone, updateUserName, updateUserEmail, updateUserPassword, deleteAccount, getRemainingBudget, addBudgetField };
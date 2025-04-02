import { getFirestore, doc, setDoc, updateDoc, deleteDoc, collection, getDocs, addDoc, deleteField, arrayUnion, where, query } from "firebase/firestore"; 
import { getAuth, onAuthStateChanged, updateEmail, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { getDoc, where } from "firebase/firestore";
import { auth, db, deleteUser } from "./config";

// Listen for authentication state changes
onAuthStateChanged(auth, () => {
    const user = auth.currentUser;
    if (user) {
        console.log("User logged in:", user.uid);
        listenToUserBudgetChanges()
        // Call functions only after the user is logged in

        //updateUserIncome(50000);
        //updateUserBudget();
        //updateRemainingUserBudget(10000);
        getUserData();
    } else {
        //console.error("No user logged in.");
    }
});

// Listen for changes to the user's budget in the database
const listenToUserBudgetChanges = () => {
    const user = auth.currentUser

    if (!user) {
        console.error("No user logged in.")
        return
    }

    const userRef = doc(db, "users", user.uid)

    // Set up a real-time listener for changes to the user's document
    onSnapshot(userRef, async (doc) => {
        if (doc.exists()) {
            const updatedBudget = doc.data().budget // Get updated budget value

            const sharedBudgetsRef = collection(db, "sharedBudgets")

            // Query shared budgets where the user is the owner
            const q = query(sharedBudgetsRef, where("userId", "==", user.uid))
            const querySnapshot = await getDocs(q)

            // Update all shared budgets with the new budget value
            const updatePromises = querySnapshot.docs.map((sharedBudgetDoc) => {
                return updateDoc(sharedBudgetDoc.ref, {
                    budget: updatedBudget,
                })
            })

            // Wait for all updates to complete
            await Promise.all(updatePromises)
            console.log("Shared budgets updated successfully!")
        }
    })
}

// Share the user's budget with a group
const shareBudgetWithGroup = async (groupId) => {
    const user = auth.currentUser

    if (!user) {
        console.error("No user logged in.")
        return
    }

    // Check if the user has already shared their budget with this group
    const sharedBudgetsRef = collection(db, "sharedBudgets")
    const q = query(sharedBudgetsRef, where("userId", "==", user.uid), where("groupId", "==", groupId))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
        console.error("Budget already shared with this group.")
        return
    }

    // Get the user's budget
    const userRef = doc(db, "users", user.uid)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) {
        console.error("User document not found.")
        return
    }

    // Get user's current budget
    const userBudget = userSnap.data().budget

    // Create a new shared budget document
    try {
        await setDoc(doc(sharedBudgetsRef), {
            userId: user.uid,
            groupId: groupId,
            budget: userBudget,
        })
        console.log("Budget shared successfully!")
    } catch (error) {
        console.error("Error sharing budget:", error)
    }
}

// Fetch all shared budgets for a given group
const fetchSharedBudgets = async (groupId) => {

    if (!groupId) {
        console.error("Group ID is required.")
        return []
    }

    try {
        const sharedBudgetsRef = collection(db, "sharedBudgets")
        const q = query(sharedBudgetsRef, where("groupId", "==", groupId))
        const querySnapshot = await getDocs(q)

        // Map over the documents and return an array of shared budgets
        const sharedBudgets = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        return sharedBudgets // Return the fetched budgets
    } catch (error) {
        console.error("Error fetching shared budgets:", error)
        return []
    }
}

// Function to create an income field and update it to Firestore
const updateUserIncome = async (income) => {
    const user = auth.currentUser;

    if (!user) {
      console.error("No user logged in.");
      return;
    } else {
        try {
            await updateDoc(doc(db, "users", user.uid), {
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
// Luultavasti turha, koska budjetti on jo luotu ja se on tallennettu Firestoreen
const updateUserBudget = async (budget) => {
    const user = auth.currentUser;

    if (!user) {
        console.error("No user logged in.");
        return;
    } else {
        try {
            await updateDoc(doc(db, "users", user.uid), {
                budget: budget, // Add or update the "budget" field
            }, {merge: true});
            console.log("Budget field added/updated!");
            console.log("User budget:", budget);
            } catch (error) {
            console.error("Error updating user data:", error);
            }
    }
};

const updateRemainingUserBudget = async (remainingBudget) => {
    const user = auth.currentUser;

    if (!user) {
        console.error("No user logged in.");
        return;
    } else {
        try {
            await updateDoc(doc(db, "users", user.uid), {
                remainingBudget: remainingBudget, // Add or update the "budget" field
            }, {merge: true});
            console.log("remainingBudget field added/updated!");
            console.log("Remaining User budget:", remainingBudget);
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
        await updateDoc(userRef, {
            [`budget.${safeField}`]: value,
            remainingBudget: currentRemaining - value
          });          

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

// delete a budget field and add to remaining budget
const deleteBudgetField = async (field) => {
    const user = auth.currentUser;
    if (!user) return { error: "No user logged in." };
    // get user document
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return { error: "User document not found." };

    const data = userSnap.data();
    const currentRemaining = data.remainingBudget ?? data.budget ?? 0;

    // delete field and update remaining budget
    try {
        const fieldValue = data.budget?.[field] ?? 0;

        await updateDoc(userRef, {
        [`budget.${field}`]: deleteField(),
        remainingBudget: currentRemaining + fieldValue
        });

        console.log("Firestore update successful:", {
            [field]: deleteField(),
            remainingBudget: currentRemaining + data[field]
        });

        return { success: true, remainingBudget: currentRemaining + fieldValue };
    } catch (error) {
        console.error("Error deleting budget field:", error);
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
    
    // Fetch the owner's details from Firestore
    const userDocRef = doc(db, "users", user.uid)
    const userDocSnap = await getDoc(userDocRef)

    let ownerDetails = {
        uid: user.uid,
        phone: user.phone || "Unknown",
        name: user.displayName || "Unknown",
    }

    if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        ownerDetails = {
            uid: user.uid,
            phone: userData.phone || "Unknown",
            name: userData.name || user.displayName || "Unknown",
        };
    }

    //Ensure the owner is in the members list
    const allMembers = [...selectedMembers]

    //Check if owner is already in the list; if not add them
    if (!selectedMembers.some(member => member.uid === user.uid)) {
        allMembers.push(ownerDetails)
    }
  
    // Prepare group data
    const newGroup = {
        name: groupName,
        owner: user.uid, // Set the creator as the owner
        members: allMembers, //Store all members
    }
    
    try {
        //Create the group and get the generated groupId
        const groupRef = await addDoc(collection(db, "groups"), newGroup)
        const groupId = groupRef.id

        //Update each user's groupsId field to include the new groupId
        const updatePromises = allMembers.map((member) =>
            updateDoc(doc(db, "users", member.uid), {
                groupsId: arrayUnion(groupId),
            })
        )

        await Promise.all(updatePromises)
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

//Function to fetch the logged-in user's groups
const fetchUserGroups = async () => {
    const user = auth.currentUser
    if (!user) return []

    try {
        const userRef = doc(db, "users", user.uid)
        const userSnap = await getDoc(userRef)

        /*if (!userSnap.exists()) {
            return []
        }*/

        const userData = userSnap.data()
        const userGroupsId = userData.groupsId || [] //Get the array of group IDs

        if (userGroupsId.length === 0) return []

        let groups = []
        const batchSize = 10

        /*//Fetch only the group names using groupsId
        const groupsRef = collection(db, "groups")
        const q = query(groupsRef, where("__name__", "in", userGroupsId))
        const groupsSnap = await getDocs(q)

        //Extract group IDs and names
        return groupsSnap.docs.map((doc) => ({
            id: doc.id,     //Group ID
            name: doc.data().name //Group name
        }))*/

        for (let i = 0; i < userGroupsId.length; i += batchSize) {
            const batchIds = userGroupsId.slice(i, i + batchSize)
            const q = query(collection(db, "groups"), where("__name__", "in", batchIds))
            const groupsSnap = await getDocs(q)
                
            groups.push(...groupsSnap.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name,
            })))
        }
    
        return groups
    } catch (error) {
        console.error("Error fetching groups: ", error)
        return []
    }
}

const fetchGroupById = async (groupId) => {
    const groupDoc = await firestore.collection('groups').doc(groupId).get();
    if (groupDoc.exists) {
      return { id: groupDoc.id, ...groupDoc.data() }; // Returns group data
    } else {
      throw new Error('Group not found');
    }
  }

const createBudget = async ({ name, groupId }) => {
    try {
        const newBudgetRef = await firestore.collection('budgets').add({
            name,
            groupId,
        });
        return newBudgetRef.id; // Returns the ID of the newly created budget
    } catch (error) {
        console.error("Error creating budget: ", error);
        throw new Error("Could not create budget");
    }
}

getUserData();

export {
    fetchSharedBudgets,
    createGroup, matchContactsToUsers, updateUserIncome, 
    updateUserBudget, getUserData, updateUserPhone, 
    updateUserName, updateUserEmail, updateUserPassword, 
    deleteAccount, getRemainingBudget, addBudgetField, 
    fetchUserGroups, fetchGroupById, createBudget
};

import { getFirestore, doc, setDoc, updateDoc, deleteDoc, collection, getDocs, addDoc, deleteField, arrayUnion, query, onSnapshot, where, serverTimestamp, orderBy } from "firebase/firestore"; 
import { getAuth, onAuthStateChanged, updateEmail, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { getDoc } from "firebase/firestore";
import { auth, db, deleteUser } from "./config";

// Listen for authentication state changes
onAuthStateChanged(auth, () => {
    const user = auth.currentUser;
    if (user) {
        console.log("User logged in:", user.uid);
        listenToUserBudgetChanges()
        // Call functions only after the user is logged in

        updateUserIncome(50000);
        //updateUserBudget();
        updateRemainingUserBudget(10000);
        getUserData();
    } else {
        //console.error("No user logged in.");
    }
});

// Delete a shared budget in a specific group
const deleteSharedBudget = async (groupId) => {
    const user = auth.currentUser

    if (!user) {
        console.error("No user logged in.")
        return
    }

    try {
        // Find the shared budget where the userId matches the logged-in user
        const sharedBudgetsRef = collection(db, "sharedBudgets")

        // Create a query to find the shared budget document where:
        // - The userId matches the logged-in user
        // - The groupId matches the provided groupId
        const q = query(sharedBudgetsRef, where("userId", "==", user.uid), where("groupId", "==", groupId))

        // Execute the query and get the matching documents
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
            console.error("No shared budget found for this user in the group.")
            return
        }

        // Delete all matching budget documents (should usually be just one)
        const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref))
        await Promise.all(deletePromises)

        console.log("Shared budget deleted successfully!")
    } catch (error) {
        console.error("Error deleting shared budget:", error)
    }
}

// Fetches shared budget by Id
const fetchBudgetById = async (budgetId) => {
    try {
        const budgetRef = doc(db, "sharedBudgets", budgetId)
        const budgetSnap = await getDoc(budgetRef)
        if (budgetSnap.exists()) {
            return budgetSnap.data()
        } else {
            console.error("No such budget!")
            return null
        }
    } catch (error) {
        console.error("Error fetching budget:", error)
        return null
    }
}

const fetchGroupBudgetById = async (budgetId) => {
    try {
        const budgetRef = doc(db, "groupBudget", budgetId)
        const budgetSnap = await getDoc(budgetRef)
        if (budgetSnap.exists()) {
            return budgetSnap.data()
        } else {
            console.error("No such budget!")
            return null
        }
    } catch (error) {
        console.error("Error fetching budget:", error)
        return null
    }
}

// Set initial budget for the group
const setGroupBudget = async (groupId, budgetValue) => {
    if (!auth.currentUser) return { error: "Not authenticated." }

    const groupBudgetRef = doc(db, 'groupBudget', groupId)
    const groupBudgetSnap = await getDoc(groupBudgetRef)
    if (!groupBudgetSnap.exists()) return { error: "Group not found." }

    try {
        await updateDoc(groupBudgetRef, {
            remainingBudget: budgetValue,
            budget: {}
        })
        return { success: true }
    } catch (err) {
        console.error("Error setting group budget:", err)
        return { error: "Failed to set group budget." }
    }
}

// Add an expense field to a group (subtract from the overall budget)
const addGroupBudgetField = async (groupId, field, value) => {
    if (!auth.currentUser) return { error: "Not authenticated." }

    const groupBudgetRef = doc(db, 'groupBudget', groupId)
    const groupBudgetSnap = await getDoc(groupBudgetRef)
    if (!groupBudgetSnap.exists()) return { error: "Group not found." }

    const currentBudget = groupBudgetSnap.data().remainingBudget
    const newRemainingBudget = currentBudget - value

    const safeField = field.replace(/[^a-zA-Z0-9_]/g, "_")

    try {
        // Update the expense field and remaining budget
        await updateDoc(groupBudgetRef, {
            [`budget.${safeField}`]: value,
            remainingBudget: newRemainingBudget
        })
        return { success: true }
    } catch (err) {
        console.error("Error adding group expense:", err)
        return { error: "Failed to update group budget." }
    }
}

// Delete an expense field from a group (add back to the overall budget)
const deleteGroupBudgetField = async (groupId, field) => {
    if (!auth.currentUser) return { error: "Not authenticated." };

    const groupBudgetRef = doc(db, 'groupBudget', groupId);
    const groupBudgetSnap = await getDoc(groupBudgetRef);
    if (!groupBudgetSnap.exists()) return { error: "Group not found." }

    const currentBudget = groupBudgetSnap.data().remainingBudget
    const expenseValue = groupBudgetSnap.data().budget[field]

    const newRemainingBudget = currentBudget + expenseValue

    try {
        // Delete the expense field and update the remaining budget
        await updateDoc(groupBudgetRef, {
            [`budget.${field}`]: deleteField(),
            remainingBudget: newRemainingBudget
        })
        return { success: true }
    } catch (err) {
        console.error("Error deleting group expense:", err)
        return { error: "Failed to delete group expense." }
    }
}

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
    const userData = userSnap.data()
    const userName = userData.name || "Unknown User"

    // Create a new shared budget document
    try {
        await setDoc(doc(sharedBudgetsRef), {
            userId: user.uid,
            userName: userName,
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
    const credential = EmailAuthProvider.credential(user.email, currentPassword)

    try {
        await reauthenticateWithCredential(user, credential)

        // Update Firestore document
        await updateDoc(doc(db, "users", user.uid), {
            name: name
        }, {merge: true})
        console.log("User name updated!")

        const sharedBudgetsRef = collection(db, "sharedBudgets")
        const q = query(sharedBudgetsRef, where("userId", "==", user.uid))
        const querySnapshot = await getDocs(q)

        // Update all shared budgets with new name
        const updatePromises = querySnapshot.docs.map((sharedBudgetDoc) => {
            return updateDoc(sharedBudgetDoc.ref, {
                userName: name
            })
        })

        await Promise.all(updatePromises)
        //console.log("Updated name in shared budgets.")

        const groupsRef = collection(db, "groups")
        const groupSnapshot = await getDocs(groupsRef)
        console.log("Group Snapshot:", groupSnapshot.docs)

        // Update all groups with new name
        const groupUpdatePromises = groupSnapshot.docs.map((groupDoc) => {
            const members = groupDoc.data().members
            //console.log("Members:", members)

            const memberToUpdate = members.find(member => member.uid === user.uid)
            
            if (memberToUpdate) {
                const updatedMembers = members.map(member => {
                    if (member.uid === user.uid) {
                        return { ...member, name: name };
                    }
                    return member
                })

                return updateDoc(groupDoc.ref, {
                    members: updatedMembers
                })
            } else {
                console.log("User is not a member of this group:", groupDoc.id)
            }
        })

        await Promise.all(groupUpdatePromises)
        //console.log("Updated name in groups.")
        
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

        const sharedBudgetsRef = collection(db, "sharedBudgets")
        const q = query(sharedBudgetsRef, where("userId", "==", user.uid))
        const querySnapshot = await getDocs(q)

        const updatePromises = querySnapshot.docs.map((sharedBudgetDoc) => {
            return updateDoc(sharedBudgetDoc.ref, {
                userPhone: phone
            })
        })

        await Promise.all(updatePromises)
        console.log("Updated phone number in shared budgets.")

        const groupsRef = collection(db, "groups")
        const groupSnapshot = await getDocs(groupsRef)
        //console.log("Group Snapshot:", groupSnapshot.docs)

        const groupUpdatePromises = groupSnapshot.docs.map((groupDoc) => {
            const members = groupDoc.data().members

            const memberToUpdate = members.find(member => member.uid === user.uid)

            if (memberToUpdate) {
                const updatedMembers = members.map(member => {
                    if (member.uid === user.uid) {
                        return { ...member, phone: phone };
                    }
                    return member
                })

                return updateDoc(groupDoc.ref, {
                    members: updatedMembers
                })
            } else {
                console.log("User is not a member of this group:", groupDoc.id)
            }
        })

        await Promise.all(groupUpdatePromises)
        console.log("Updated phone number in groups.")

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

    // Remove contactName before saving to Firestore
    const filteredMembers = allMembers.map(({ contactName, ...rest }) => rest)
  
    // Prepare group data
    const newGroup = {
        name: groupName,
        owner: user.uid, // Set the creator as the owner
        members: filteredMembers, //Store all members
    }
    
    try {
        //Create the group and get the generated groupId
        const groupRef = await addDoc(collection(db, "groups"), newGroup)
        const groupId = groupRef.id

        //Update each user's groupsId field to include the new groupId
        const updatePromises = filteredMembers.map((member) =>
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
                contactName: contact.name,
                dbName: matchedUser.dbName,
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

        const userData = userSnap.data()
        const userGroupsId = userData.groupsId || [] //Get the array of group IDs

        if (userGroupsId.length === 0) return []

        let groups = []
        const batchSize = 10

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
      try {
        const groupRef = doc(db, "groups", groupId);
        const groupSnap = await getDoc(groupRef);

        if (!groupSnap.exists()) {
            console.error("Group not found:", groupId);
            return null;
        }

        console.log("Fetched group:", groupSnap.data());
        return { id: groupSnap.id, ...groupSnap.data() };
    } catch (error) {
        console.error("Error fetching group:", error);
        return null;
    }
  }

const createGroupBudget = async ({ budgetName, groupId }) => {
    try {
    //Get the group's info
    const groupBudgetRef = collection(db, "groupBudget")
    const newBudget = await addDoc(groupBudgetRef, {
        name: budgetName,
        groupId: groupId,
        budget: {},
    });

        console.log("Budget created with ID:", newBudget.id);
        return newBudget.id;
    } catch (error) {
        console.error("Error creating budget:", error);
        return null;
    }
}

const fetchGroupBudgets = async (groupId) => {
    if (!groupId) {
        console.error("fetchGroupBudgets called with undefined groupId.");
        return [];
    }

    try {
        console.log("Querying Firestore for budgets with groupId:", groupId);
        const budgetsRef = collection(db, "groupBudget");
        const q = query(budgetsRef, where("groupId", "==", groupId));
        const budgetsSnap = await getDocs(q);


        if (budgetsSnap.empty) {
            console.warn("No budgets found for groupId:", groupId);
        }

        const budgets = budgetsSnap.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
            budget: doc.data().budget,
        }));
        
        console.log("Fetched budgets:", budgets);
        return budgets;
    } catch (error) {
        console.error("Error fetching group budgets: ", error);
        return [];
    }
};

const deleteGroup = async (groupId) => {
    const user = auth.currentUser;
    if (!user) {
        console.error("No user logged in.");
        return;
    }

    try {
        const groupRef = doc(db, "groups", groupId);
        const groupSnap = await getDoc(groupRef);

        if (!groupSnap.exists()) {
            console.error("Group does not exist.");
            return;
        }

        const groupData = groupSnap.data();
        if (groupData.owner !== user.uid) {
            console.error("User is not the owner of the group.");
            return;
        }

        await deleteDoc(groupRef);
        console.log("Group deleted successfully!");
    } catch (error) {
        console.error("Error deleting group:", error.message);
    }
};
/* Message functions */
const sendMessage = async (groupId, text) => {
  const currentUser = auth.currentUser//Get logged-in user
  //Stop if user is not logged-in or message is empty
  if (!currentUser || !text.trim()) return
  try {
    //Fetch info from users collection(name and phone)
    const userDocRef = doc(db, "users", currentUser.uid)
    const userSnap = await getDoc(userDocRef)
    //Use either custom 'name' from DB or fallback to firebase displayName
    const userData = userSnap.exists() ? userSnap.data() : {}
    const senderId = currentUser.uid
    const senderName = userData.name || currentUser.displayName || "Unknown"
    //Message object fields
    const message = {
      text: text.trim(),
      senderId: senderId,
      senderName: senderName,
      timestamp: serverTimestamp(),
      type: "text",
      readBy: [senderId],
    }
    //Get reference to the group's chat subcollection
    //Firestore path: messages/{groupId}/chats
    const messagesRef = collection(db, "messages", groupId, "chats")
    //Add messages to firestore
    await addDoc(messagesRef, message)
  } catch (error) {
    console.error("Error sending message: ", error)
  }
}

const listenToMessages = (groupId, callback) => {
  const messagesRef = collection(db, "messages", groupId, "chats")
  const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"))

  //Real-time listener
  const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(messages) //Update state in UI
  })
  return unsubscribe //Call this to stop listening
}

const markMessagesAsRead = async (groupId) => {
  const user = auth.currentUser
  if (!user) return

  try {
    const messagesRef = collection(db, "messages", groupId, "chats")
    //Find messages NOT read by this user
    const q = query(messagesRef, where("readBy", "not-in", [user.uid]))

    const snapshot = await getDocs(q)
    const unreadMessages = snapshot.docs.filter(
      (doc) => !doc.data().readBy?.includes(user.uid)
    )
    const updatePromises = unreadMessages.map((doc) => {
      return updateDoc(doc.ref, {
        readBy: arrayUnion(user.uid),
        isRead: true,
      })
    })
    
    await Promise.all(updatePromises)
  } catch (error) {
    console.error("Error marking messages as read: ", error)
  }
}

getUserData();

export {
    fetchSharedBudgets, shareBudgetWithGroup,
    createGroup, matchContactsToUsers, updateUserIncome, 
    updateUserBudget, getUserData, updateUserPhone, 
    updateUserName, updateUserEmail, updateUserPassword, 
    deleteAccount, getRemainingBudget, addBudgetField, 
    fetchUserGroups, fetchGroupById, createGroupBudget,
    deleteBudgetField, fetchGroupBudgets, fetchBudgetById,
    deleteSharedBudget, deleteGroup, sendMessage, listenToMessages,
    markMessagesAsRead, fetchGroupBudgetById, deleteGroupBudgetField,
    addGroupBudgetField, setGroupBudget
};
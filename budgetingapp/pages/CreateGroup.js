import * as Contacts from "expo-contacts";
import { useEffect, useState } from "react";
import { View, Text, Button, FlatList, TextInput } from "react-native";
import { db } from "../firebase/config";
import { collection, getDocs, addDoc } from "firebase/firestore";

/* 
    The CreateGroup component allows users to create a new budgeting group
    by selecting contacts from their phone that are also registered
    in the app.

    Expo Contacts is used to fetch the user's phone contacts, and 
    Firestore is used to check which contacts are already in the database.
*/

export default function CreateGroup() {
  const [contacts, setContacts] = useState([])
  const [matchedUsers, setMatchedUsers] = useState([])
  const [groupName, setGroupName] = useState("")
  const [selectedMembers, setSelectedMembers] = useState([])

  // Request contact permissions and fetch contacts.
  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync()
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync()
        if (data.length > 0) {
          setContacts(data)
          checkContactsInDatabase(data)
        }
      }
    })()
  }, [])

  // Normalize phone numbers by removing non-digit characters.
  const normalizePhoneNumber = (number) => {
    if (!number) return ""
    let formatted = number.replace(/\D/g, "") // Remove all non-digit characters.
    if (formatted.startsWith("0")) {
      formatted = "358" + formatted.slice(1) // Convert local Finnish numbers to international format.
    }
    return formatted
  }

  // Check if contacts exist in the database.
  const checkContactsInDatabase = async (contactList) => {
    const usersRef = collection(db, "users")
    const snapshot = await getDocs(usersRef)

    // Fetch users from database and normalize their phone numbers.
    const usersFromDB = snapshot.docs.map((doc) => ({
      phone: normalizePhoneNumber(doc.data().phone),
      dbName: doc.data().name, // Get name from database.
    }))

    // Match contacts from phone with users from database.
    const matched = contactList.map((contact) => {
      const phoneNumber = normalizePhoneNumber(contact.phoneNumbers?.[0]?.number)
      const matchedUser = usersFromDB.find((user) => user.phone === phoneNumber)
      if (matchedUser) {
        return {
          id: contact.id,
          contactName: contact.name, // Contact name from phone.
          dbName: matchedUser.dbName, // Name from database.
          phone: phoneNumber,
        }
      }
      return null
    }).filter(Boolean)

    setMatchedUsers(matched)
  }

  const toggleSelection = (user) => {
    setSelectedMembers((prev) =>
      prev.includes(user) ? prev.filter((u) => u !== user) : [...prev, user]
    )
  }

  // Create a new group and save it to Firestore.
  const createGroup = async () => {
    if (!groupName) return alert("Enter a group name") // Prevent empty group names.

    await addDoc(collection(db, "groups"), {
      name: groupName,
      members: selectedMembers.map((user) => user.phone),
    })

    alert("Group Created!")
    setGroupName("")
  }

  return (
    <View>
      <TextInput placeholder="Group Name" value={groupName} onChangeText={setGroupName} />
      <Text>Suggested Members</Text>
      <FlatList
        data={matchedUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text onPress={() => toggleSelection(item)}>
            {selectedMembers.includes(item) ? "✔ " : ""} {item.contactName} ({item.dbName})
          </Text>
        )}
      />
      <Button title="Create Group" onPress={createGroup} />
    </View>
  )
}

import * as Contacts from "expo-contacts";
import { useEffect, useState } from "react";
import { View, Text, Button, FlatList, TextInput, TouchableOpacity } from "react-native";
import { matchContactsToUsers, createGroup } from "../firebase/firestore";
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from "../styles";

/* 
    The CreateGroup component allows users to create a new budgeting group
    by selecting contacts from their phone that are also registered
    in the app.

    Expo Contacts is used to fetch the user's phone contacts, and 
    Firestore is used to check which contacts are already in the database.
*/

export default function CreateGroupModal({ navigation }) {
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
          const matched = await matchContactsToUsers(data)
          setMatchedUsers(matched)
        }
      }
    })()
  }, [])

  const toggleSelection = (user) => {
    setSelectedMembers((prev) =>
      prev.includes(user) ? prev.filter((u) => u !== user) : [...prev, user]
    )
  }

  const handleCreateGroup = async () => {
    if (!groupName) {
      Alert.alert("Error", "Enter a group name")
      return
    }
    try {
      await createGroup(groupName, selectedMembers)
      Alert.alert("Success", "Group Created!")
      setGroupName("")
      setSelectedMembers([])

      // Navigate to the group's page after successful creation
      //navigation.navigate("Group", { groupId: newGroup.id, groupName })
      //onClose()
    } catch (error) {
      Alert.alert("Error", error.message)
    }
  }

  return (
    <View style={{ padding: 10 }}>
      <Text style={styles.link}>Group name</Text>
      <TextInput 
        placeholder="" 
        value={groupName} 
        onChangeText={setGroupName}
        style={styles.formInput}
      />
      <Text style={styles.link}>Suggested Members</Text>
      <FlatList
        data={matchedUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={{ fontSize: 16, alignItems: "center", marginTop: 5}} onPress={() => toggleSelection(item)}>
            <Ionicons name="person-sharp" size={16} color="black" />
            {selectedMembers.includes(item) ? "✔ " : ""} {item.contactName} ({item.dbName})
          </Text>
        )}
      />
      <TouchableOpacity style={styles.buttonForm} onPress={handleCreateGroup}>
        <Text style={styles.buttonTextMiddle}>Create group</Text>
      </TouchableOpacity>
    </View>
  )
}
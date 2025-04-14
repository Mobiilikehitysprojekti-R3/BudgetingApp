import * as Contacts from "expo-contacts";
import { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, Modal, Alert, TouchableWithoutFeedback, Keyboard } from "react-native";
import { matchContactsToUsers, createGroup } from "../firebase/firestore";
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from "../styles";
import { ThemeContext } from '../context/ThemeContext';

/* 
    The CreateGroup component allows users to create a new budgeting group
    by selecting contacts from their phone that are also registered
    in the app.

    Expo Contacts is used to fetch the user's phone contacts, and 
    Firestore is used to check which contacts are already in the database.
*/

export default function CreateGroupModal({ visible, onClose }) {
  const [contacts, setContacts] = useState([])
  const [matchedUsers, setMatchedUsers] = useState([])
  const [groupName, setGroupName] = useState("")
  const [selectedMembers, setSelectedMembers] = useState([])
  const { isDarkMode } = useContext(ThemeContext)

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
    console.log("Selected member: ", selectedMembers)

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
      onClose()
    } catch (error) {
      Alert.alert("Error", error.message)
    }
  }

  return (
    <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={isDarkMode ? styles.modalOverlayDarkMode : styles.modalOverlay}>
        <View style={isDarkMode ? styles.modalContentDarkMode : styles.modalContent}>
				<Ionicons name="close" size={24} color={isDarkMode ? "#fff" : "#000"} onPress={onClose}/>
        <Ionicons name="man" size={100} color={isDarkMode ? "#fff" : "#000"}/>
          <Text style={styles.link}>Group name</Text>
          <TextInput
            placeholder="Enter group name"
            placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
            value={groupName}
            onChangeText={setGroupName}
            style={isDarkMode ? styles.formInputDarkMode : styles.formInput}
          />
          <Text style={styles.link}>Suggested Members</Text>
          <FlatList
            data={matchedUsers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => toggleSelection(item)}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
                backgroundColor: selectedMembers.includes(item) 
                ? (isDarkMode ? '#3A3A3A' : '#D0E6FF') 
                : (isDarkMode ? '#1F1F1F' : 'white'),
                borderRadius: 8,
                marginBottom: 8,
              }}>
            <Ionicons 
              name="person" 
              size={20} 
              color={isDarkMode ? "#fff" : "#000"} 
              style={{ marginRight: 10 }}
            />
            <Text style={isDarkMode ? styles.listTextDarkMode : styles.listText}>
              {item.contactName} ({item.name})
            </Text>
              </View>
              </TouchableOpacity>
            )}/>

        <TouchableOpacity style={styles.buttonForm} onPress={handleCreateGroup}>
          <Text style={styles.buttonTextMiddle}>Create Group</Text>
        </TouchableOpacity>
        </View>
      </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}
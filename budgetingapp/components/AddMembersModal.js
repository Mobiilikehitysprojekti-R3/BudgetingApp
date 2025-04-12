import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, Modal, TouchableOpacity  } from 'react-native'
import { addMemberToGroup, matchContactsToUsers } from '../firebase/firestore'
import * as Contacts from 'expo-contacts'; 
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from '../styles';


export default function AddMembersModal({ groupId, onClose, visible}) {
  const [matchedUsers, setMatchedUsers] = useState([])
  const [contacts, setContacts] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])


  useEffect(() => {
      (async () => {
        const { status } = await Contacts.requestPermissionsAsync()
        if (status === "granted") {
          const { data } = await Contacts.getContactsAsync()
          if (data.length > 0) {
            setContacts(data)
            const matched = await matchContactsToUsers(data)
            setMatchedUsers(matched)
            console.log("Matched users: ",matched)
          }
        }
      })()
    }, [])

    const toggleSelection = (user) => {
      setSelectedMembers((prev) =>
        prev.includes(user) ? prev.filter((u) => u !== user) : [...prev, user]
      )
      console.log("Selected member: ", selectedMembers, user)
    }

  const handleAdd= async () => {
    try {
      await addMemberToGroup(selectedMembers)
      setSelectedMembers([])
      onClose()
    } catch (error) {
      console.error("Failed to add user: " + error.message)
    }
  }
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
				<Ionicons name="close" size={24} color="black" onPress={onClose}/>
        <Text style={styles.link}>Suggested Members</Text>
        <FlatList
            data={matchedUsers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
          <Text style={{ fontSize: 16, alignItems: "center", marginTop: 5}} onPress={() => toggleSelection(item)}>
            <Ionicons name="person-sharp" size={16} color="black" />
            {selectedMembers.includes(item) ? "✔ " : ""} {item.contactName} ({item.name})
          </Text>
          )}
          />
          <TouchableOpacity style={styles.buttonForm} onPress={handleAdd}>
            <Text style={styles.buttonTextMiddle}>Add member</Text>
          </TouchableOpacity>
      </View>
    </View>
    </Modal>
  )
}
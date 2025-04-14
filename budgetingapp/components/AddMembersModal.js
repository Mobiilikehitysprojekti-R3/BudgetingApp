import React, { useEffect, useState } from 'react'
import { matchContactsToUsers, addMemberToGroup } from '../firebase/firestore'
import * as Contacts from 'expo-contacts'
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native'
import Ionicons from "@expo/vector-icons/Ionicons"
import styles from '../styles'

export default function AddMembersModal({ visible, onClose, groupId, currentGroupMembers, onMembersUpdated }) {
  const [suggestedMembers, setSuggestedMembers] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])

  useEffect(() => {
    const fetchSuggestedMembers = async () => {
      try {
        const { status } = await Contacts.requestPermissionsAsync()
        if (status === "granted") {
          const { data: contacts } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name]
          })
          const matchedMembers = await matchContactsToUsers(contacts)
          const newSuggestedMembers = matchedMembers.filter(member => 
            !currentGroupMembers.includes(member.uid)
        )
          setSuggestedMembers(newSuggestedMembers)
        }
      } catch (error) {
        console.error("Error loading suggested members: ", error)
      }
    }
    if (visible) {
      fetchSuggestedMembers()
    }
  }, [visible])

  const handleAddMembers = async () => {
    try {
      await addMemberToGroup(groupId, selectedMembers)
      if (onMembersUpdated) {
        await onMembersUpdated()
      }
      onClose()
    } catch (error) {
      console.error("Error adding members: ", error)
    }
  }

  const toggleMemberSelection = (member) => {
    setSelectedMembers(prevSelected => {
      if (prevSelected.includes(member)) {
        return prevSelected.filter(selected => selected !== member)
      } else {
        return [...prevSelected, member]
      }
    })
  }

  return (
    <Modal
      visible={visible}
      animationType='slide'
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
        <Ionicons name="close" size={24} color="black" onPress={onClose}/>
        <Text>Add Members to Group</Text>
        <FlatList
          data={suggestedMembers}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => toggleMemberSelection(item)}>
              <Text style={{ padding: 10, backgroundColor: selectedMembers.includes(item) ? 'lightblue' : 'white' }}>
                {item.contactName || item.name} ({item.phone})
              </Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity style={styles.buttonForm} onPress={handleAddMembers}>
            <Text style={styles.buttonTextMiddle}>Add member</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

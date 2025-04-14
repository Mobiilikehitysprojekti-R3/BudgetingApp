import React, { useEffect, useState } from 'react'
import { FlatList, View, Text, Alert, } from 'react-native'
import { 
  getUserByGroupId, 
  removeMemberFromGroup, 
  addMemberToGroup, 
  matchContactsToUsers 
} from '../firebase/firestore'
import { getAuth } from 'firebase/auth'
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from '../styles'
import AddMembersModal from '../components/AddMembersModal';

export default function GroupSettings({ route }) {
  const { groupId } = route.params
  const [members, setmembers] = useState([])
  const [ownerId, setOwnerId] = useState(null)
  const [openAddMembersModal, setOpenAddMembersModal] = useState(false)
  const [contacts, setContacts] = useState([])

  const currentUserId = getAuth().currentUser?.uid
  const isOwner = currentUserId === ownerId

  const fetchMembers = async () => {
    try {
      const fetchedMembers = await getUserByGroupId(groupId)

      if (fetchedMembers) {
        setmembers(fetchedMembers.members)
        setOwnerId(fetchedMembers.ownerId)
      } else {
        setError('Failed to load group members.')
      }
    } catch (error) {
      setError('Error fetching group members.')
    } 
  }
  useEffect(() => {
    fetchMembers()
  }, [groupId])

  const handleRemoveMember = (memberUid, memberName) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from the group?`,
      [
        { text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMemberFromGroup(groupId, memberUid)
              setmembers(prev => prev.filter(m => m.uid !== memberUid))
            } catch (error) {
              alert(error.message || "Failed to remove member.")
            }
          }
        }
      ]
    )
  }

  handleCloseModal = async () => {
    setOpenAddMembersModal(false)
  }

  return (
    <View>
      <Text style={styles.title}>Group settings</Text>
      <View>
      <Text style={styles.link}>Group Members</Text>

      <FlatList
        data={members}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <View style={styles.fakeInput}>
            <Text>{item.name}</Text>
            {isOwner && item.uid !== ownerId && (
              <Ionicons 
                name="trash-outline" 
                size={20} 
                color="#4F4F4F" 
                onPress={() => handleRemoveMember(item.uid, item.name)}
              />
            )}
          </View>
        )}
      />

{isOwner && (
  <Text
    style={styles.link}
    onPress={() => setOpenAddMembersModal(true)}
  >
    + Add Members
  </Text>
)}
<AddMembersModal
  visible={openAddMembersModal}
  onClose={handleCloseModal}
  groupId={groupId}
  currentGroupMembers={members.map(member => member.uid)}
  onMembersUpdated={fetchMembers}
/>
      </View>
    </View>
  )
}

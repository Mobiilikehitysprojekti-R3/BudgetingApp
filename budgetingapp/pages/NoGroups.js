import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import styles from '../styles';
import CreateGroupModal from '../components/CreateGroupModal';
import Ionicons from '@expo/vector-icons/Ionicons';
import { fetchUserGroups } from '../firebase/firestore';

export default function NoGroups ({ navigation }) {
  const [openCreateGroupModal, setOpenCreateGroupModal] = useState(false)
	
  const handleCloseModal = async () => {
    setOpenCreateGroupModal(false)

    const userGroups = await fetchUserGroups()
    // Navigate to MyGroups if a group is created
    if (userGroups.length > 0) {
      navigation.navigate('MyGroups')
    }
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Groups</Text>
      <View style={styles.formTwo}>
        <Text style={{ fontSize: 16}}>You're not in a group.</Text>
				<Text style={{ fontSize: 16, marginTop: 5}}>Start here!</Text>
      </View>

      <TouchableOpacity 
        style={styles.buttonOne} 
        onPress={() => setOpenCreateGroupModal(true)}>
      	<Text style={styles.buttonText}>Create group</Text>
				<Ionicons name="add" size={20} color="white" style={styles.iconStyle} />
      </TouchableOpacity>

      <CreateGroupModal 
        visible={openCreateGroupModal}
        onClose={handleCloseModal}
      />
      </View>
    );
  };
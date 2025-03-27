import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import styles from '../styles';
import CreateGroupModal from '../components/CreateGroupModal';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function NoGroups () {
  const [openCreateGroupModal, setOpenCreateGroupModal] = useState(false)
	
  const handleCloseModal = () => {
    setOpenCreateGroupModal(false)
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
        onPress={() => {setOpenCreateGroupModal(true)}}>
      	<Text style={styles.buttonText}>Create group</Text>
				<Ionicons name="add" size={20} color="white" style={styles.iconStyle} />
      </TouchableOpacity>

      <Modal
        visible={openCreateGroupModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal} // Handle back button on Android
      >
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View style={{ backgroundColor: 'white', margin: 20, borderRadius: 10, padding: 20 }}>
				<Ionicons name="close" size={24} color="black" onPress={handleCloseModal}/>
          <CreateGroupModal onPress={handleCloseModal} />
        </View>
      </View>
      </Modal>
      </View>
    );
  };
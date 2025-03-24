import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Button } from 'react-native';
import styles from '../styles';
import CreateGroupModal from '../components/CreateGroupModal';

export default function NoGroups () {
    const [openCreateGroupModal, setOpenCreateGroupModal] = useState(false)

    const handleCloseModal = () => {
        setOpenCreateGroupModal(false)
    }
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>My Groups</Text>
        <View style={styles.form}>
            <Text>You're not in a group yet, start here!</Text>
        </View>
        <TouchableOpacity 
            style={styles.buttonTwo} 
            onPress={() => {setOpenCreateGroupModal(true)}}>
            <Text style={styles.buttonTextMiddle}>Create group</Text>
        </TouchableOpacity>

        <Modal
                visible={openCreateGroupModal}
                animationType="slide"
                transparent={true}
                onRequestClose={handleCloseModal} // Handle back button on Android
            >
            <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ backgroundColor: 'white', margin: 20, borderRadius: 10, padding: 20 }}>
                        <CreateGroupModal onClose={handleCloseModal} />
                        <Button title="Close" onPress={handleCloseModal} />
                    </View>
                </View>
        </Modal>
      </View>
    );
  };
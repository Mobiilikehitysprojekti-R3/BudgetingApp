import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, Button } from 'react-native';
import styles from '../styles';
import Ionicons from '@expo/vector-icons/Ionicons';
import CreateGroupModal from '../components/CreateGroupModal';
import { getUsersGroups } from '../firebase/firestore';

export default function MyGroups({ navigation, uid }) {
  const [groups, setGroups] = useState([]);
	const [openCreateGroupModal, setOpenCreateGroupModal] = useState(false)

	useEffect(() => {
        const fetchGroups = async () => {
            try {
                const userGroups = await getUsersGroups(uid); // Fetch groups for the user
                setGroups(userGroups); // Set the fetched groups in state
            } catch (error) {
                console.error("Failed to fetch groups: ", error);
            }
        };

        fetchGroups(); // Call the function to fetch groups
    }, [uid]); // Dependency array includes userId to refetch if it changes


  const handleGroupPress = (groupId) => {
    navigation.navigate('Group', { groupId }); // Navigate to Group page
  };

	const handleCloseModal = () => {
    setOpenCreateGroupModal(false)
  }

  return (
  <View style={styles.container}>
		<Text style={styles.title}>MY GROUPS</Text>
		<View style={styles.list}>
    <FlatList
      data={groups}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
      <TouchableOpacity onPress={() => handleGroupPress(item.id)} style={styles.buttonTwo}>
        <Text style={styles.buttonText}>{item.name}</Text>
      </TouchableOpacity>
      )}     //lists all existing groups that user belongs to      
            // navigate to NoGroups page to create new group
    />
		</View>

		<Ionicons 
			name="add-circle-outline" 
			size={30} color="#A984BE" 
			onPress={() => {setOpenCreateGroupModal(true)}}
		/>
		<Modal
			visible={openCreateGroupModal}
			animationType="slide"
			transparent={true}
			onRequestClose={handleCloseModal} // Handle back button on Android
		>
			<View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
				<View style={{ backgroundColor: 'white', margin: 20, borderRadius: 10, padding: 20 }}>
				<Ionicons name="close" size={24} color="black" onPress={handleCloseModal}/>
					<CreateGroupModal onClose={handleCloseModal} />
				</View>
			</View>
		</Modal>
  </View>
  );
}

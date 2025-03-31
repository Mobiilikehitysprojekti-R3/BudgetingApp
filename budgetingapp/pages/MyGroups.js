import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal } from 'react-native';
import styles from '../styles';
import Ionicons from '@expo/vector-icons/Ionicons';
import CreateGroupModal from '../components/CreateGroupModal';
import { fetchUserGroups } from '../firebase/firestore';

export default function MyGroups({ navigation }) {
  const [groups, setGroups] = useState([]);
	const [openCreateGroupModal, setOpenCreateGroupModal] = useState(false)

	useEffect(() => {
		const loadGroups = async () => {
			const userGroups = await fetchUserGroups()
			setGroups(userGroups)
		}
		loadGroups()
	}, [])

  const handleGroupPress = (groupId) => {
    navigation.navigate('Group', { groupId }); // Navigate to Group page
  };

	const handleCloseModal = async () => {
    	setOpenCreateGroupModal(false)
		const userGroups = await fetchUserGroups() // Reload the group list
  		setGroups(userGroups)
  	}

  return (
  <View style={styles.container}>
		<Text style={styles.title}>MY GROUPS</Text>
		<View style={styles.list}>
    <FlatList
      data={groups}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
      <TouchableOpacity onPress={() => handleGroupPress(item.id)} style={styles.buttonThree}>
        <Text style={styles.buttonText}>{item.name}</Text>
				<Ionicons name="chevron-forward" size={20} color="white" style={styles.iconStyle} />
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
		<CreateGroupModal 
			visible={openCreateGroupModal}
			onClose={handleCloseModal}
		/>
  </View>
  );
}

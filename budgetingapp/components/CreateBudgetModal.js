import React, { useState, useEffect} from 'react';
import { View, Text, TextInput, Button, Modal, Alert, TouchableOpacity } from 'react-native';
import { createGroupBudget, fetchGroupById } from '../firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from '../styles';

export default function CreateBudgetModal({ visible, onClose, groupId }) {
  const [budgetName, setBudgetName] = useState('');
  const [group, setGroup] = useState(null); 

  useEffect(() => {
    const fetchGroup = async () => {
    try {
      if (groupId) {
        const groupData = await fetchGroupById(groupId);
      if (groupData) {
        setGroup(groupData);
      } else {
        console.warn("Group not found.");
      }
      }
    } catch (error) {
      console.error("Error fetching group:", error);
    }
    };

    fetchGroup();
  }, [groupId]);


  const handleCreateBudget = async () => {
    console.log("groupId:", groupId); 
    if (!budgetName.trim()) {
      Alert.alert("Error", "Please enter a budget name");
      return;
    }

    try {
      await createGroupBudget({ budgetName, groupId });
      Alert.alert("Success", "Budget Created!");
      setBudgetName('');
      onClose();
    } catch (error) {
      console.error("Error creating budget:", error);
      Alert.alert("Error", "Could not create budget");
    }
  };

  return (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
			<View style={styles.modalContent}>
		    <Ionicons name="close" size={28} color="black" onPress={onClose}/>
        <Text style={styles.link}>Create New Budget</Text>
        <TextInput
          placeholder="Budget Name"
          value={budgetName}
          onChangeText={setBudgetName}
          style={styles.formInput}
        />
        <TouchableOpacity style={styles.buttonForm} onPress={handleCreateBudget}>
          <Text style={styles.buttonTextMiddle}>Create</Text>
        </TouchableOpacity>
			</View>
    </View>
  </Modal>
  );
};
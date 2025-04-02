import React, { useState, useEffect} from 'react';
import { View, Text, TextInput, Button, Modal, Alert } from 'react-native';
import { createGroupBudget, fetchGroupById } from '../firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from '../styles';

export default function CreateBudgetModal({ visible, onClose, groupId }) {
    const [budgetName, setBudgetName] = useState('');
    const [group, setGroup] = useState(null); 
    //const [groupId, setGroupId] = useState(null)
    //const [budgetAmount, setBudgetAmount] = useState('');

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
    /*if (budgetName.trim()) {
            await createGroupBudget(budgetName, budgetAmount); // Create budget in Firestore
            Alert.alert("Success", "Budget Created!")
            setBudgetName(''); // Clear input
            setBudgetAmount([]);
            onClose(); // Close modal
        } else {
            alert('Please enter a budget name');
        }*/
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
			<Ionicons name="close" size={24} color="black" onPress={onClose}/>
        <Text>Create New Budget</Text>
          <TextInput
            placeholder="Budget Name"
            value={budgetName}
            onChangeText={setBudgetName}
            style={styles.formInput}
          />
          <Button title="Create" onPress={handleCreateBudget} />
                <Button title="Cancel" onPress={onClose} />
								</View>
            </View>
        </Modal>
    );
};
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet } from 'react-native';
import { createBudget } from '../firebase/firestore'; 

const CreateBudgetModal = ({ visible, onClose, groupId }) => {
    const [budgetName, setBudgetName] = useState('');

    const handleCreateBudget = async () => {
        if (budgetName.trim()) {
            await createBudget({ name: budgetName, groupId }); // Create budget in Firestore
            setBudgetName(''); // Clear input
            onClose(); // Close modal
        } else {
            alert('Please enter a budget name');
        }
    };

    return (
        <Modal>
            <View >
                <Text>Create New Budget</Text>
                <TextInput
                    placeholder="Budget Name"
                    value={budgetName}
                    onChangeText={setBudgetName}
                />
                <Button title="Create" onPress={handleCreateBudget} />
                <Button title="Cancel" onPress={onClose} />
            </View>
        </Modal>
    );
};

export default CreateBudgetModal;
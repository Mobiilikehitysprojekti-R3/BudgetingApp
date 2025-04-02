import React, { useEffect, useState } from 'react';
import { View, Text, Button, Modal } from 'react-native';
import { fetchGroupById } from '../firebase/firestore';
import CreateBudgetModal from '../components/CreateBudgetModal.js';
import styles from "../styles.js"

export default function Group({ route }) {
    const { groupId } = route.params; // Gets the groupId from the route parameters
    const [group, setGroup] = useState(null);
    const [openCreateBudgetModal, setOpenCreateBudgetModal] = useState(false)
    //const [isModalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const loadGroup = async () => {
            const groupData = await fetchGroupById(groupId); // Fetches group data
            console.log("Fetched group data:", groupData);
            setGroup(groupData);
        };
        loadGroup();
    }, [groupId]);

    if (!group) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const handleCloseModal = () => {
        setOpenCreateBudgetModal(false)
      }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{group.name}</Text>
            <Button title="Create New Budget" onPress={() => setOpenCreateBudgetModal(true)} />
            
            <CreateBudgetModal 
                visible={openCreateBudgetModal}
                onClose={handleCloseModal}
                groupId={groupId}
            />
            {/* 
            <CreateBudgetModal 
                visible={isModalVisible} 
                onClose={() => setModalVisible(false)} 
                groupId={groupId} // Pass the groupId to the modal
            />*/}
        </View>
    );
};
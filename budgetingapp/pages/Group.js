import React, { useEffect, useState } from 'react';
import { View, Text, Button, Modal, FlatList, TouchableOpacity } from 'react-native';
import { fetchGroupById, fetchGroupBudgets } from '../firebase/firestore';
import CreateBudgetModal from '../components/CreateBudgetModal.js';
import styles from "../styles.js"

export default function Group({ route }) {
    const { groupId } = route.params; // Gets the groupId from the route parameters
    const [group, setGroup] = useState(null);
    const [groupBudgets, setGroupBudgets] = useState([]); // State to hold group budgets
    const [openCreateBudgetModal, setOpenCreateBudgetModal] = useState(false)
    //const [isModalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const loadGroup = async () => {
            console.log("Fetching group data for groupId:", groupId);
            const groupData = await fetchGroupById(groupId); // Fetches group data
            console.log("Fetched group data:", groupData);
            setGroup(groupData);
        };

        const loadGroupBudgets = async () => {
            console.log("Fetching budgets for groupId:", groupId);
            const budgets = await fetchGroupBudgets(groupId); // Fetches group budgets
            console.log("Fetched budgets:", budgets);
            setGroupBudgets(budgets);
        };

        loadGroup();
        loadGroupBudgets();
    }, [groupId]);

    const handleCloseModal = () => {
        setOpenCreateBudgetModal(false);
        loadGroupBudgets(); // Refresh budgets after closing the modal
    };

    if (!group) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{group.name}</Text>
            {groupBudgets.length === 0 ? (
            <Text>No budgets available.</Text>
        ) : (

            <FlatList
                data={groupBudgets}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.button} onPress={() => {}}>
                        <Text>{item.name}</Text>
                    </TouchableOpacity>

                )}
            />
            )}
            <Button title="Create New Budget" onPress={() => setOpenCreateBudgetModal(true)} />
            
            <CreateBudgetModal 
                visible={openCreateBudgetModal}
                onClose={handleCloseModal}
                groupId={groupId}
            />
        </View>
    );
};
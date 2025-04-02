import React, { useEffect, useState } from 'react';
import { View, Text, Button, Modal, FlatList, TouchableOpacity } from 'react-native';
import { fetchGroupById, fetchGroupBudgets, fetchSharedBudgets, deleteSharedBudget } from '../firebase/firestore';
import CreateBudgetModal from '../components/CreateBudgetModal.js';
import styles from "../styles.js"
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebase/config.js';

export default function Group({ route, navigation }) {
    const { groupId } = route.params; // Gets the groupId from the route parameters
    const [group, setGroup] = useState(null);
    const [groupBudgets, setGroupBudgets] = useState([]); // State to hold group budgets
    const [sharedBudgets, setSharedBudgets] = useState([])
    const [openCreateBudgetModal, setOpenCreateBudgetModal] = useState(false)
    //const [isModalVisible, setModalVisible] = useState(false);
    
    const loadGroupBudgets = async () => {
        console.log("Fetching budgets for groupId:", groupId);
        try {
            const budgets = await fetchGroupBudgets(groupId); // Fetches group budgets
            setGroupBudgets(budgets);
            console.log("Fetched budgets:", budgets);
        } catch (error) {
            console.error('Error fetching budgets:', error)
        }  
    };

    useEffect(() => {
        const loadGroupData = async () => {
            try {
                console.log("Fetching group data for groupId:", groupId);
                const groupData = await fetchGroupById(groupId); // Fetches group data
                console.log("Fetched group data:", groupData);
                setGroup(groupData);
            } catch (error) {
                console.error('Error fetching group:', error)
            }
        };

        const loadSharedBudgetsData = async () => {
            try {
                const budgets = await fetchSharedBudgets(groupId)
                setSharedBudgets(budgets)
            } catch (error) {
                console.error('Error fetching shared budgets:', error)
            }
        }

        const loadData = async () => {
            await Promise.all([loadGroupData(), loadSharedBudgetsData(), loadGroupBudgets()])
            setLoading(false)
        }

        loadData()
    }, [groupId]);

    const handleDeleteSharedBudget = async (budgetId) => {
        try {
            await deleteSharedBudget(budgetId)
            const updatedBudgets = await fetchSharedBudgets(groupId)
            setSharedBudgets(updatedBudgets)
        } catch (error) {
            console.error("Error deleting budget:", error)
        }
    }    

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
            <Text style={styles.titleDark}>{group.name}</Text>

            <Text style={styles.subtitle}>Shared Budgets:</Text>
            {sharedBudgets.length === 0 ? (
                <Text style={styles.noBudgetsText}>No shared budgets available.</Text>
            ) : (
                <FlatList
                    data={sharedBudgets}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.listItem}>
                        <TouchableOpacity style={styles.buttonThree}
                            onPress={() => navigation.navigate('BudgetDetails', { budgetId: item.id })}>
                            <Text style={styles.buttonText}>View {item.userName}'s Budget</Text>
                            {item.userId === auth.currentUser?.uid && (
                                    <TouchableOpacity 
                                        onPress={() => handleDeleteSharedBudget(item.groupId)}
                                        style={styles.deleteIconForTouchable}>
                                        <Ionicons name="close-outline" size={24} color="white" />
                                    </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                        </View>
                    )}
                />
            )}

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
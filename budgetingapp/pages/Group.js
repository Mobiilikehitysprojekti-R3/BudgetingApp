import React, { useEffect, useState } from 'react';
import { View, Text, Button, Modal, FlatList, TouchableOpacity } from 'react-native';
import { fetchGroupById, fetchGroupBudgets, fetchSharedBudgets } from '../firebase/firestore';
import CreateBudgetModal from '../components/CreateBudgetModal.js';
import styles from "../styles.js"

export default function Group({ route, navigation }) {
    const { groupId } = route.params; // Gets the groupId from the route parameters
    const [group, setGroup] = useState(null);
    const [groupBudgets, setGroupBudgets] = useState([]); // State to hold group budgets
    const [sharedBudgets, setSharedBudgets] = useState([])
    const [openCreateBudgetModal, setOpenCreateBudgetModal] = useState(false)
    //const [isModalVisible, setModalVisible] = useState(false);

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

        loadData();
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

            <Text style={styles.subtitle}>Shared Budgets:</Text>
            {sharedBudgets.length === 0 ? (
                <Text style={styles.noBudgetsText}>No shared budgets available.</Text>
            ) : (
                <FlatList
                    data={sharedBudgets}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('BudgetDetails', { budgetId: item.id })}
                            style={styles.listItem}>
                            <Text style={styles.budgetName}>View Budget {item.id}</Text>
                        </TouchableOpacity>
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
import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, TouchableOpacity } from "react-native";
import { fetchGroupById, fetchSharedBudgets } from "../firebase/firestore.js";
import CreateBudgetModal from "../components/CreateBudgetModal.js";
import styles from "../styles.js";

export default function Group({ route, navigation }) {
    const { groupId } = route.params;
    const [group, setGroup] = useState(null);
    const [sharedBudgets, setSharedBudgets] = useState([]); // State for shared budgets
    const [openCreateBudgetModal, setOpenCreateBudgetModal] = useState(false);

    useEffect(() => {
        const loadGroup = async () => {
            try {
                const groupData = await fetchGroupById(groupId);
                setGroup(groupData);
            } catch (error) {
                console.error("Error fetching group:", error);
            }
        };

        const loadSharedBudgets = async () => {
            try {
                const budgets = await fetchSharedBudgets(groupId);
                setSharedBudgets(budgets);
            } catch (error) {
                console.error("Error fetching shared budgets:", error);
            }
        };

        loadGroup();
        loadSharedBudgets();
    }, [groupId]);

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
            
            <Button title="Create New Budget" onPress={() => setOpenCreateBudgetModal(true)} />

            <CreateBudgetModal 
                visible={openCreateBudgetModal}
                onClose={() => setOpenCreateBudgetModal(false)}
                groupId={groupId}
            />

            {/* Display shared budgets */}
            <Text style={styles.subtitle}>Shared Budgets:</Text>
            <FlatList
                data={sharedBudgets}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate("BudgetDetails", { budgetId: item.id })}>
                        <View style={styles.budgetItem}>
                            <Text style={styles.budgetTitle}>Budget: {item.budget}</Text>
                            <Text style={styles.budgetOwner}>Shared by: {item.userId}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

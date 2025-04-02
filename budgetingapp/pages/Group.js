import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { fetchGroupById, fetchSharedBudgets } from '../firebase/firestore';
import styles from "../styles.js";

export default function Group({ route, navigation }) {
    const { groupId } = route.params
    const [group, setGroup] = useState(null)
    const [sharedBudgets, setSharedBudgets] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadGroupData = async () => {
            try {
                const groupData = await fetchGroupById(groupId)
                setGroup(groupData)
            } catch (error) {
                console.error('Error fetching group:', error)
            }
        }

        const loadSharedBudgetsData = async () => {
            try {
                const budgets = await fetchSharedBudgets(groupId)
                setSharedBudgets(budgets)
            } catch (error) {
                console.error('Error fetching shared budgets:', error)
            }
        }

        const loadData = async () => {
            await Promise.all([loadGroupData(), loadSharedBudgetsData()])
            setLoading(false)
        }

        loadData();
    }, [groupId]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading group data...</Text>
            </View>
        )
    }

    if (!group) {
        return (
            <View style={styles.container}>
                <Text>Error loading group data.</Text>
            </View>
        )
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
        </View>
    )
}

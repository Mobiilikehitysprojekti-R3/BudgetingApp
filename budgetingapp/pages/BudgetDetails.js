import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { fetchBudgetById } from '../firebase/firestore'; 
import BudgetPieChart from '../components/BudgetPieChart.js';
import styles from "../styles.js";

/* 
    The BudgetDetails component displays information about a specific
    shared budget based on the provided budgetId. No onr can add or delete
    fields from this page.
*/

export default function BudgetDetails({ route }) {
    const { budgetId } = route.params
    const [budget, setBudget] = useState(null)

    useEffect(() => {
        const loadBudgetData = async () => {
            try {
                const budgetData = await fetchBudgetById(budgetId)
                setBudget(budgetData)
            } catch (error) {
                console.error('Error fetching budget:', error)
            }
        }

        loadBudgetData()
    }, [budgetId])

    if (!budget) {
        return (
            <View style={styles.container}>
                <Text>Error loading budget details.</Text>
            </View>
        )
    }

    return (
        <ScrollView style={styles.scrollView}>
        <View>
            <Text style={styles.title}>Budget Details</Text>
  
            {budget.budget && typeof budget.budget === 'object' ? (
                <>
                    <BudgetPieChart data={budget.budget} />
                    
                    {Object.entries(budget.budget).map(([category, amount]) => (
                        <View key={category} style={styles.budgetItem}>
                            <Text style={styles.budgetText}>
                                {category}: ${amount}
                            </Text>
                        </View>
                    ))}
                </>
        ) : (
            <Text style={styles.budgetAmount}>No budget data available.</Text>
        )}
        </View>
    </ScrollView>
    )
}

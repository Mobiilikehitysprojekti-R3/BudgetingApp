import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { fetchBudgetById } from '../firebase/firestore'; 
import styles from "../styles.js";

/* 
    The BudgetDetails component displays information abouta specific
    budget based on the provided budgetId.

    Currently used to display shared budgets for a group.
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
      <View style={styles.container}>
      <Text style={styles.title}>Budget Details</Text>
  
      {budget.budget && typeof budget.budget === 'object' ? (
          Object.entries(budget.budget).map(([category, amount]) => (
              <Text key={category} style={styles.budgetAmount}>
                  {category}: ${amount}
              </Text>
          ))
      ) : (
          <Text style={styles.budgetAmount}>No budget data available.</Text>
      )}
  </View>
  
    )
}

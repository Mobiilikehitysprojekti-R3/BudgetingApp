import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { fetchBudgetById } from '../firebase/firestore'; 
import styles from "../styles.js";

export default function BudgetDetails({ route }) {
    const { budgetId } = route.params
    const [budget, setBudget] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadBudgetData = async () => {
            try {
                const budgetData = await fetchBudgetById(budgetId)
                setBudget(budgetData)
            } catch (error) {
                console.error('Error fetching budget:', error)
            } finally {
                setLoading(false)
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

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { fetchGroupBudgetById, addGroupBudgetField, deleteGroupBudgetField } from '../firebase/firestore';
import BudgetPieChart from '../components/BudgetPieChart.js';
import styles from "../styles.js";

export default function GroupBudget({ route }) {
  const { budgetId } = route.params
  const [groupBudget, setGroupBudget] = useState(null)
  const [fieldName, setFieldName] = useState('')
  const [fieldValue, setFieldValue] = useState('')

  const loadGroupBudget = async () => {
    try {
      const data = await fetchGroupBudgetById(budgetId)
      setGroupBudget(data)
    } catch (error) {
      console.error('Error fetching group budget:', error)
    }
  }

  useEffect(() => {
    loadGroupBudget()
  }, [budgetId])

  const handleAddField = async () => {
    const value = parseFloat(fieldValue)
    if (!fieldName || isNaN(value) || value <= 0) {
      Alert.alert('Error', 'Please enter a valid name and amount.')
      return
    }

    const result = await addGroupBudgetField(budgetId, fieldName, value)
    if (result.error) {
      Alert.alert('Error', result.error)
    } else {
      setFieldName('')
      setFieldValue('')
      loadGroupBudget()
    }
  }

  const handleDeleteField = async (field) => {
    const confirm = await new Promise((resolve) =>
      Alert.alert('Delete Field', `Are you sure you want to delete "${field}"?`, [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
      ])
    )

    if (!confirm) return;

    const result = await deleteGroupBudgetField(budgetId, field)
    if (result.error) {
      Alert.alert('Error', result.error)
    } else {
      loadGroupBudget()
    }
  }

  if (!groupBudget) {
    return (
      <View style={styles.container}>
        <Text>Error loading group budget.</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.scrollView}>
      <Text style={styles.title}>Group Budget</Text>

      {groupBudget.remainingBudget !== undefined && (
        <Text style={styles.remaining}>Remaining: ${groupBudget.remainingBudget}</Text>
      )}

      <TextInput
        style={styles.inputActive}
        placeholder="New field name"
        value={fieldName}
        onChangeText={setFieldName}
      />

      <TextInput
        style={styles.inputActive}
        placeholder="Amount"
        value={fieldValue}
        onChangeText={setFieldValue}
        keyboardType="numeric"
      />

      <Button title="Add Group Expense" onPress={handleAddField} />

      <BudgetPieChart data={groupBudget.budget || {}} />

      <Text style={styles.title2}>Group Expenses:</Text>
      {groupBudget.budget && Object.entries(groupBudget.budget).map(([category, amount]) => (
        <View key={category} style={styles.budgetItem}>
          <Text style={styles.budgetText}>{category}: ${amount}</Text>
          <TouchableOpacity onPress={() => handleDeleteField(category)}>
            <Text style={styles.deleteButton}>❌</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  )
}

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TextInput, Button, Alert, TouchableOpacity, Modal } from 'react-native';
import { fetchGroupBudgetById, addGroupBudgetField, deleteGroupBudgetField, setGroupBudget, deleteBudget } from '../firebase/firestore';
import BudgetPieChart from '../components/BudgetPieChart.js';
import styles from "../styles.js";
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';

/*
  The GroupBudget component allows users to manage a group budget.
  Users can:
    - Set an initial group budget
    - View and edit the the budget
    - Add and delete expense categories
*/

export default function GroupBudget({ route, navigation }) {
  const categories = ['groceries', 'essentials', 'entertainment', 'other']

  const { budgetId } = route.params
  const [groupBudget, setGroupBudgetState] = useState(null)
  const [expenseName, setExpenseName] = useState('')
  const [fieldValue, setFieldValue] = useState('')
  const [initialBudget, setInitialBudget] = useState('')
  const [isEditingRemaining, setIsEditingRemaining] = useState(false)
  const [newRemainingValue, setNewRemainingValue] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [markedDates, setMarkedDates] = useState({})
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)

  // Load group budget data
  const loadGroupBudget = async () => {
    try {
      const data = await fetchGroupBudgetById(budgetId)
      setGroupBudgetState(data)
    } catch (error) {
      console.error('Error fetching group budget:', error)
    }
  }

  const updateRemainingBudget = async () => {
    const value = parseFloat(newRemainingValue)

    if (isNaN(value) || value < 0) {
      Alert.alert('Error', 'Please enter a valid remaining budget.')
      return
    }
  
    const result = await setGroupBudget(budgetId, value)
    if (result.error) {
      Alert.alert('Error', result.error)
    } else {
      setIsEditingRemaining(false)
      setNewRemainingValue('')
      loadGroupBudget()
    }
  }  

  // Handle setting the initial budget
  const handleSetInitialBudget = async () => {
    const budgetValue = parseFloat(initialBudget)
    if (isNaN(budgetValue) || budgetValue <= 0) {
      Alert.alert('Error', 'Please enter a valid initial budget amount.')
      return
    }

    const result = await setGroupBudget(budgetId, budgetValue)
    if (result.error) {
      Alert.alert('Error', result.error)
    } else {
      setInitialBudget('')
      loadGroupBudget()
    }
  }

  // Handle adding an expense field
  const handleAddField = async () => {
    const value = parseFloat(fieldValue)
    if (!expenseName || isNaN(value) || value <= 0) {
      Alert.alert('Error', 'Please enter a valid name and amount.')
      return
    }

    const result = await addGroupBudgetField(budgetId, selectedCategory, expenseName, value, selectedDate)
    if (result.error) {
      Alert.alert('Error', result.error)
    } else {
      setExpenseName('')
      setFieldValue('')
      loadGroupBudget()
    }
  }

  // Handle deleting an expense field
  const handleDeleteField = async (category, expense) => {
    const confirm = await new Promise((resolve) =>
      Alert.alert('Delete Field', `Are you sure you want to delete "${expense}" from "${category}"??`, [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
      ])
    )

    if (!confirm) return

    const result = await deleteGroupBudgetField(budgetId, category, expense)
    if (result.error) {
      Alert.alert('Error', result.error)
    } else {
      loadGroupBudget()
    }
  }

  const handleDeleteBudgetPress = async () => {
    //confirmation alert
    const confirm = await new Promise((resolve) =>
        Alert.alert('Delete Budget', `Are you sure you want to delete this budget?`, [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
        ])
    );

    // If the user confirmed the deletion, proceed with deleting the budget
    if (confirm) {
        try {
            await deleteBudget(budgetId); // Make sure budgetId is defined
            navigation.navigate('MyGroups');
        } catch (error) {
            console.error("Error deleting budget:", error);
            Alert.alert("Error", "Failed to delete budget.");
        }
    } else {
        console.log("Budget deletion canceled.");
    }
  };

  const handleSlicePress = (category) => {
    setActiveCategory(category)
    setDetailModalVisible(true)
  }


  useEffect(() => {
    loadGroupBudget()
  }, [budgetId])

  if (!groupBudget) {
    return (
      <View style={styles.container}>
        <Text>Error loading group budget.</Text>
      </View>
    )
  }

  const filteredBudget = {}
    Object.entries(groupBudget.budget || {}).forEach(([category, entries]) => {
      filteredBudget[category] = {}
      Object.entries(entries).forEach(([name, { amount, date }]) => {
        if (!startDate || !endDate || (date >= startDate && date <= endDate)) {
          filteredBudget[category][name] = amount
      }
    })
  })

  return (
    <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={100}
        >
    <ScrollView style={styles.scrollView}>

      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          ...markedDates,
          ...(selectedDate && {
            [selectedDate]: {
              selected: true,
              selectedColor: '#00adf5',
              marked: markedDates[selectedDate]?.marked,
              dotColor: markedDates[selectedDate]?.dotColor
            }
        })
      }}/>

      {groupBudget.remainingBudget === undefined ? (
        <View>
          <Text style={styles.title}>Set Budget</Text>
          <TextInput
            style={styles.inputActive}
            placeholder="Enter budget amount"
            value={initialBudget}
            onChangeText={setInitialBudget}
            keyboardType="numeric"
          />
          <Button title="Set Budget" onPress={handleSetInitialBudget} />
        </View>
      ) : (
        <>
          <View style={styles.rowContainer}>
            {isEditingRemaining ? (
              <View style={styles.editRow}>

              <TextInput
                style={[styles.editInput, styles.remainingInputInline]}
                value={newRemainingValue}
                onChangeText={setNewRemainingValue}
                keyboardType="numeric"
                placeholder="Remaining budget"
              />

              <Button title="Save" onPress={updateRemainingBudget} />
              <Button title="Cancel" onPress={() => {
                setIsEditingRemaining(false)
                setNewRemainingValue('')
              }}/>
          </View>
          ) : (
            <View style={styles.editRow}>
            <Text style={styles.remaining}>Remaining: ${groupBudget.remainingBudget}</Text>
              <Ionicons
              name="pencil"
              size={20}
              color="#4F4F4F"
              onPress={() => {
                setIsEditingRemaining(true)
                setNewRemainingValue(String(groupBudget.remainingBudget))
              }}/>
            </View>
              )}
          </View>

          <View style={{ marginVertical: 10 }}>
          <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.buttonForm}>
            <Text style={styles.buttonTextMiddle}>
              {startDate ? `Start: ${startDate}` : 'Select Start Date'}
            </Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate ? new Date(startDate) : new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowStartPicker(false);
                if (selectedDate) setStartDate(selectedDate.toISOString().split('T')[0]);
              }}
            />
          )}

          <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.buttonForm}>
            <Text style={styles.buttonTextMiddle}>
              {endDate ? `End: ${endDate}` : 'Select End Date'}
            </Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDate ? new Date(endDate) : new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowEndPicker(false);
                if (selectedDate) setEndDate(selectedDate.toISOString().split('T')[0]);
              }}
            />
          )}
        </View>

          <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            dropdownIconColor="#4F4F4F">

            {categories.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>

          <TextInput
            style={styles.inputActive}
            placeholder="New field name"
            value={expenseName}
            onChangeText={setExpenseName}
          />

          <TextInput
            style={styles.inputActive}
            placeholder="Amount"
            value={fieldValue}
            onChangeText={setFieldValue}
            keyboardType="numeric"
          />

          <Button title="Add Group Expense" onPress={handleAddField} />
        </>
      )}

      <BudgetPieChart data={filteredBudget} onSlicePress={handleSlicePress} />

      <Text style={styles.title2}>Group Expenses:</Text>
      {Object.entries(filteredBudget).map(([category, expenses]) => {
          const total = Object.values(expenses).reduce((sum, val) => sum + val, 0);
          return (
            <TouchableOpacity key={category} onPress={() => handleSlicePress(category)} style={styles.categorySummary}>
              <Text>{category.toUpperCase()}: ${total}</Text>
            </TouchableOpacity>
          );
        })}

      <Modal visible={detailModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.title2}>Details for {activeCategory?.toUpperCase()}</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {activeCategory && filteredBudget[activeCategory] && Object.entries(filteredBudget[activeCategory]).map(([name, value]) => (
                  <View key={name} style={styles.budgetItem}>
                    <Text>{name}: ${value}</Text>
                    <TouchableOpacity onPress={() => handleDeleteField(activeCategory, name)}>
                      <Text style={styles.deleteButton}>❌</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)} style={styles.buttonForm}>
                <Text style={styles.buttonTextMiddle}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TouchableOpacity style={styles.deleteContainer} onPress={handleDeleteBudgetPress}>
          <Text style={styles.deleteText}>Delete budget</Text>
            <Ionicons name="trash-outline" size={16} color="#4F4F4F" />
        </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  )
}

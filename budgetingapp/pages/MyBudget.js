import React, { useState, useEffect, useLayoutEffect } from 'react'; 
import {
  View, Text, TextInput, Button, Alert, ScrollView, TouchableOpacity,
  FlatList, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addBudgetField, deleteBudgetField, shareBudgetWithGroup, fetchUserGroups } from '../firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import BudgetPieChart from '../components/BudgetPieChart';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import styles from "../styles";
import { Picker } from '@react-native-picker/picker';
import { addRecurringEntry } from '../firebase/firestore';


/* 
    The MyBudget component allows users to manage and track their budget.
    
    Users can:
    - Add new budget fields with names and amounts (e.g. groceries, rent, etc.).
    - View their remaining budget.
    - Delete budget fields.
    - Share their budget details with groups they belong to.
*/

export default function MyBudget() {
  const categories = ['groceries', 'essentials', 'entertainment', 'other'];

  const navigation = useNavigation();
  const [expenseName, setExpenseName] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState('monthly');
  const [remainingBudget, setRemainingBudget] = useState(null);
  const [budgetTotal, setBudgetTotal] = useState(null);
  const [message, setMessage] = useState('');
  const [budgetFields, setBudgetFields] = useState({});
  const [groups, setGroups] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const [recurringItems, setRecurringItems] = useState([]);// State to hold recurring items


  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'My Budget',
      headerRight: () => (
        <TouchableOpacity onPress={() => setModalVisible(true)} style={{ marginRight: 15 }}>
          <Ionicons name="arrow-redo-outline" size={24} color="#4F4F4F" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleSlicePress = (category) => {
    setActiveCategory(category);
    setDetailModalVisible(true);
  };

  const fetchUserBudgetData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setRemainingBudget(data.remainingBudget ?? 0);

        const validBudget = {};
        const datesWithBudget = [];

        for (const [category, expenses] of Object.entries(data.budget || {})) {
          if (typeof expenses === 'object') {
            validBudget[category] = {};
            for (const [name, value] of Object.entries(expenses)) {
              if (typeof value === 'object' && typeof value.amount === 'number') {
                validBudget[category][name] = value;
                datesWithBudget.push(value.date ?? '2025-01-01');
              } else if (typeof value === 'number') {
                validBudget[category][name] = { amount: value, date: '2025-01-01' };
                datesWithBudget.push('2025-01-01');
              }
            }
          }
        }

        const marked = {};
        datesWithBudget.forEach(date => {
          marked[date] = { marked: true, dotColor: 'green' };
        });

        setBudgetFields(validBudget);
        setMarkedDates(marked);
      }
    } catch (error) {
      console.error('Error fetching budget data:', error);
    }
  };

  
  useEffect(() => {
    const calculateBudget = async () => {
      const recurring = await getExpandedBudget(new Date());
      const totalExpenses = recurring.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
      setRemainingBudget((budgetTotal ?? 0) - totalExpenses);
    };
    calculateBudget();
  }, [budgetTotal]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserBudgetData(user);
      }
    });
    return unsubscribe;
  }, []);

  
  useEffect(() => {
    const calculateBudget = async () => {
      const recurring = await getExpandedBudget(new Date());
      const totalExpenses = recurring.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
      setRemainingBudget((budgetTotal ?? 0) - totalExpenses);
    };
    calculateBudget();
  }, [budgetTotal]);


  useEffect(() => {
    const loadGroups = async () => {
      const userGroups = await fetchUserGroups();
      setGroups(userGroups);
    };
    loadGroups();
  }, []);
  /// Function to fetch and expand the budget data with recurring entries
  useEffect(() => {
    const fetchRecurring = async () => {
      const user = auth.currentUser;
      if (!user) return;
  
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setRecurringItems(data.recurringEntries || []);
      }
    };
    fetchRecurring();
  }, []);
  

  const handleAddField = async () => {
    const value = parseFloat(fieldValue);
    if (!expenseName || isNaN(value) || value <= 0) {
      Alert.alert('Please enter a valid name and amount');
      return;
    }

    if (isRecurring) {
      const today = new Date().toISOString().split('T')[0];
      const result = await addRecurringEntry(
        selectedCategory,
        expenseName,
        value,
        recurringInterval,
        today,
        null,
        'expense'
      );

      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        setExpenseName('');
        setFieldValue('');
        setMessage(`Recurring expense "${expenseName}" added.`);
        fetchUserBudgetData();
      }
      return;
    }

    const budgetDate = selectedDate || new Date().toISOString().split('T')[0];
    const result = await addBudgetField(selectedCategory, expenseName, value, budgetDate);
  
    if (result.error) {
      Alert.alert('Error', result.error);
    } else {
      setExpenseName('');
      setFieldValue('');
      setMessage(`Added "${expenseName}" to "${selectedCategory}" for $${value}`);
      fetchUserBudgetData();
    }
  
    if (result.error) {
      Alert.alert('Error', result.error);
    } else {
      setExpenseName('');
      setFieldValue('');
      setMessage(`Added "${expenseName}" to "${selectedCategory}" for $${value}`);
      fetchUserBudgetData();
    }
  };

  const handleDeleteField = async (category, expense) => {
    const confirm = await new Promise((resolve) =>
      Alert.alert('Delete Field', `Are you sure you want to delete "${expense}" from "${category}"?`, [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
      ])
    );

    if (!confirm) return;

    const result = await deleteBudgetField(category, expense);
    if (result.error) {
      Alert.alert('Error', result.error);
    } else {
      setMessage(`Deleted "${expense}" from "${category}"`);
      fetchUserBudgetData();
      setDetailModalVisible(false);
    }
  };

  const handleShareBudget = async (groupId) => {
    setModalVisible(false);
    if (!groupId) {
      Alert.alert('Error', 'Please select a group to share with.');
      return;
    }

    const result = await shareBudgetWithGroup(groupId);
    if (result.error) {
      Alert.alert('Error', result.error);
    } else {
      Alert.alert('Success', 'Budget shared successfully!');
    }
  };

  const filteredBudget = {};
  for (const [category, items] of Object.entries(budgetFields)) {
    filteredBudget[category] = {};
    for (const [name, entry] of Object.entries(items)) {
      const entryDate = entry.date ?? '2025-01-01';
      if (!startDate || !endDate || (entryDate >= startDate && entryDate <= endDate)) {
        filteredBudget[category][name] = entry.amount;
      }
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} style={styles.scrollView}>
        <Text style={styles.titleDark}>My Budget</Text>
        <TextInput
          style={styles.inputActive}
          placeholder="Set Monthly Budget (€)"
          value={budgetTotal?.toString() ?? ''}
          onChangeText={val => setBudgetTotal(Number(val))}
          keyboardType="numeric"
        />


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
          }}
          style={{ marginBottom: 20 }}
        />

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
            
            dropdownIconColor="#4F4F4F"
          >
            {categories.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>

        <TextInput
          style={styles.inputActive}
          placeholder="New field name (e.g. groceries)"
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

        
        <TouchableOpacity
          onPress={() => setIsRecurring(!isRecurring)}
          style={[styles.buttonForm, { backgroundColor: isRecurring ? '#66bb6a' : '#ccc' }]}
        >
          <Text style={styles.buttonTextMiddle}>
            {isRecurring ? 'Recurring Expense ✅' : 'One-time Expense'}
          </Text>
        </TouchableOpacity>

        {isRecurring && (
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={recurringInterval}
              onValueChange={(itemValue) => setRecurringInterval(itemValue)}
            >
              <Picker.Item label="Daily" value="daily" />
              <Picker.Item label="Weekly" value="weekly" />
              <Picker.Item label="Biweekly" value="biweekly" />
              <Picker.Item label="Monthly" value="monthly" />
              <Picker.Item label="Yearly" value="yearly" />
            </Picker>
          </View>
        )}

        <Button title="Add Budget Field" onPress={handleAddField} />

        {message ? <Text style={styles.message}>{message}</Text> : null}
        {remainingBudget !== null && (
          <Text style={styles.remaining}>Remaining Budget: ${remainingBudget}</Text>
        )}

        <BudgetPieChart data={filteredBudget} onSlicePress={handleSlicePress} />

        {Object.entries(filteredBudget).map(([category, expenses]) => {
          const total = Object.values(expenses).reduce((sum, val) => sum + val, 0);
          return (
            <TouchableOpacity key={category} onPress={() => handleSlicePress(category)} style={styles.categorySummary}>
              <Text>{category.toUpperCase()}: ${total}</Text>
            </TouchableOpacity>
          );
        })}

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text>Share Budget With</Text>
              <FlatList
                data={groups}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.groupItem} onPress={() => handleShareBudget(item.id)}>
                    <Text style={styles.groupText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.buttonForm}>
                <Text style={styles.buttonTextMiddle}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
        
        <Text style={styles.title2}>Recurring Expenses</Text>
          {recurringItems?.length === 0 ? (
            <Text>No recurring expenses yet.</Text>
          ) : (
            recurringItems
              .filter((item) => item.type === 'expense')
              .map((item, index) => (
                <View key={`${item.expense}-${index}`} style={styles.budgetItem}>
                  <Text>{item.expense}: €{item.amount} ({item.interval})</Text>
                  <TouchableOpacity
                    onPress={async () => {
                      const user = auth.currentUser;
                      const userRef = doc(db, 'users', user.uid);
                      const userSnap = await getDoc(userRef);
                      if (!userSnap.exists()) return;

                      const data = userSnap.data();
                      const updated = (data.recurringEntries || []).filter((_, i) => i !== index);
                      await updateDoc(userRef, { recurringEntries: updated });
                      setRecurringItems(updated);
                    }}
                  >
                    <Text style={styles.deleteButton}>❌</Text>
                  </TouchableOpacity>
                </View>
              ))
          )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
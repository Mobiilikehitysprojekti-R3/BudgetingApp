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
  const [remainingBudget, setRemainingBudget] = useState(null);
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserBudgetData(user);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadGroups = async () => {
      const userGroups = await fetchUserGroups();
      setGroups(userGroups);
    };
    loadGroups();
  }, []);

  const handleAddField = async () => {
    const value = parseFloat(fieldValue);
    if (!expenseName || isNaN(value) || value <= 0) {
      Alert.alert('Please enter a valid name and amount');
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

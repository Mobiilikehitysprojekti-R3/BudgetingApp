import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform
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

export default function MyBudget() {
  const navigation = useNavigation();
  const [fieldName, setFieldName] = useState('');
  const [fieldValue, setFieldValue] = useState('');
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

        for (const [key, value] of Object.entries(data.budget || {})) {
          if (
            typeof value === 'object' &&
            typeof value.amount === 'number' &&
            isFinite(value.amount) &&
            value.amount > 0 &&
            typeof value.date === 'string'
          ) {
            validBudget[key] = value;
            datesWithBudget.push(value.date);
          } else if (typeof value === 'number') {
            validBudget[key] = { amount: value, date: '2025-01-01' }; // fallback date
            datesWithBudget.push('2025-01-01');
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
      } else {
        console.warn('No user is logged in.');
      }
    });
    return unsubscribe;
  }, []);

  const handleAddField = async () => {
    const value = parseFloat(fieldValue);
    if (!fieldName || isNaN(value) || value <= 0) {
      Alert.alert('Please enter a valid name and amount');
      return;
    }

    const budgetDate = selectedDate || new Date().toISOString().split('T')[0];
    const result = await addBudgetField(fieldName, value, budgetDate);
    if (result.error) {
      Alert.alert('Error', result.error);
    } else {
      setFieldName('');
      setFieldValue('');
      setMessage(`Added "${fieldName}" with value $${value}`);
      fetchUserBudgetData();
    }
  };

  const handleDeleteField = async (field) => {
    const confirm = await new Promise((resolve) =>
      Alert.alert('Delete Field', `Are you sure you want to delete "${field}"?`, [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
      ])
    );

    if (!confirm) return;

    const result = await deleteBudgetField(field);
    if (result.error) {
      Alert.alert('Error', result.error);
    } else {
      setMessage(`Deleted "${field}"`);
      fetchUserBudgetData();
    }
  };

  useEffect(() => {
    const loadGroups = async () => {
      const userGroups = await fetchUserGroups();
      setGroups(userGroups);
    };
    loadGroups();
  }, []);

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} style={styles.scrollView}>
        <Text style={styles.titleDark}>My Budget</Text>

        <Calendar
          onDayPress={(day) => {
            setSelectedDate(day.dateString);
          }}
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

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.title2}>Share Budget With</Text>
              <FlatList
                data={groups}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.groupItem}
                    onPress={() => handleShareBudget(item.id)}>
                    <Text style={styles.groupText}>{item.name}</Text>
                  </TouchableOpacity>
                )}/>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.buttonForm}>
                <Text style={styles.buttonTextMiddle}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TextInput
          style={styles.inputActive}
          placeholder="New field name (e.g. groceries)"
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

        <Button title="Add Budget Field" onPress={handleAddField} />

        {message ? <Text style={styles.message}>{message}</Text> : null}
        {remainingBudget !== null && (
          <Text style={styles.remaining}>Remaining Budget: ${remainingBudget}</Text>
        )}

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

        <BudgetPieChart
          data={Object.fromEntries(
            Object.entries(budgetFields)
              .filter(([_, val]) => (!startDate || !endDate) || (val.date >= startDate && val.date <= endDate))
              .map(([key, val]) => [key, val.amount])
          )}
        />

        <Text style={styles.title2}>Your Budget Fields:</Text>
        {Object.entries(budgetFields)
          .filter(([_, val]) => {
            if (!startDate || !endDate) return true;
            return val.date >= startDate && val.date <= endDate;
          })
          .map(([field, value]) => (
            <View key={field} style={styles.budgetItem}>
              <Text style={styles.budgetText}>
                {field}: ${value.amount}
              </Text>
              <TouchableOpacity onPress={() => handleDeleteField(field)}>
                <Text style={styles.deleteButton}>❌</Text>
              </TouchableOpacity>
            </View>
          ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
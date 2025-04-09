import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
  TouchableOpacity, FlatList, Modal
} from 'react-native';
import { addBudgetField, deleteBudgetField, shareBudgetWithGroup, fetchUserGroups } from '../firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import BudgetPieChart from '../components/BudgetPieChart';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
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
  const categories = [
    'groceries', 'essentials', 'entertainment', 'other'
  ]

  const navigation = useNavigation()
  const [expenseName, setExpenseName] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const [remainingBudget, setRemainingBudget] = useState(null);
  const [message, setMessage] = useState('');
  const [budgetFields, setBudgetFields] = useState({});
  const [groups, setGroups] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
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
    })
  }, [navigation])

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
for (const [category, expenses] of Object.entries(data.budget || {})) {
  if (typeof expenses === 'object') {
    validBudget[category] = {};
    for (const [name, amount] of Object.entries(expenses)) {
      if (typeof amount === 'number' && isFinite(amount) && amount > 0) {
        validBudget[category][name] = amount;
      }
    }
  }
}
      setBudgetFields(validBudget);
    }
  } catch (error) {
    console.error('Error fetching budget data:', error);
  }
};

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User is logged in:', user.uid);
        fetchUserBudgetData(user);
      } else {
        console.warn('No user is logged in.');
      }
    });
    return unsubscribe;
  }, []);

  const handleAddField = async () => {
    const value = parseFloat(fieldValue);
    if (!expenseName || isNaN(value) || value <= 0) {
      Alert.alert('Please enter a valid name and amount');
      return;
    }
    
    const result = await addBudgetField(selectedCategory, expenseName, value);
    if (result.error) {
      Alert.alert('Error', result.error);
    } else {
      setExpenseName('');
      setFieldValue('');
      setMessage(`Added "${expenseName}" to "${selectedCategory}" for $${value}`);
      fetchUserBudgetData(); // Refresh list and budget
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
      fetchUserBudgetData(); // Refresh after deletion
    }
  };

  useEffect(() => {
    const loadGroups = async () => {
      const userGroups = await fetchUserGroups()
      setGroups(userGroups)
    }
    loadGroups()
  }, [])

  const handleShareBudget = async (groupId) => {
    setModalVisible(false)
    if (!groupId) {
      Alert.alert('Error', 'Please select a group to share with.')
      return
    }

    const result = await shareBudgetWithGroup(groupId)
    if (result.error) {
      Alert.alert('Error', result.error)
    } else {
      Alert.alert('Success', 'Budget shared successfully!')
    }
  }
  
  return (
    <ScrollView style={styles.scrollView}>

    <Text style={styles.titleDark}>My Budget</Text>

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

      <Text style={styles.label}>Select Category</Text>
      <View style={styles.pickerWrapper}>
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        style={styles.picker}
        dropdownIconColor="#4F4F4F"
      >
      {categories.map((cat) => (
        <Picker.Item key={cat} label={cat} value={cat} />
      ))}
      </Picker>
      </View>

      <TextInput
        style={styles.inputActive}
        placeholder="Expense name (e.g. chocolate)"
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

      <BudgetPieChart data={budgetFields} onSlicePress={handleSlicePress} />

      <Text style={styles.title2}>Your Budget Fields:</Text>
      {Object.entries(budgetFields).map(([category, expenses]) => {
        const total = Object.values(expenses).reduce((sum, val) => sum + val, 0);
        return (
      <TouchableOpacity key={category} onPress={() => handleSlicePress(category)} style={styles.categorySummary}>
        <Text style={styles.categoryHeading}>{category.toUpperCase()}: ${total}</Text>
      </TouchableOpacity>
      );
  })}

      <Modal visible={detailModalVisible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.title2}>Details for {activeCategory?.toUpperCase()}</Text>
          <ScrollView style={{ maxHeight: 300 }}>
            {activeCategory && budgetFields[activeCategory] && Object.entries(budgetFields[activeCategory]).map(([name, value]) => (
              <View key={name} style={styles.budgetItem}>
              <Text style={styles.budgetText}>{name}: ${value}</Text>
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
  );
}

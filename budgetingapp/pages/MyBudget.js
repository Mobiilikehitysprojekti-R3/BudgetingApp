import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
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

export default function MyBudget() {
  const [fieldName, setFieldName] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const [remainingBudget, setRemainingBudget] = useState(null);
  const [message, setMessage] = useState('');
  const [budgetFields, setBudgetFields] = useState({});
  //const [groupId, setGroupId] = useState('')
  const [groups, setGroups] = useState([])
  const [modalVisible, setModalVisible] = useState(false)

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
      for (const [key, value] of Object.entries(data.budget || {})) {
        if (typeof value === 'number' && isFinite(value) && value > 0) {
          validBudget[key] = value;
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
    if (!fieldName || isNaN(value) || value <= 0) {
      Alert.alert('Please enter a valid name and amount');
      return;
    }
    
    const result = await addBudgetField(fieldName, value);
    if (result.error) {
      Alert.alert('Error', result.error);
    } else {
      setFieldName('');
      setFieldValue('');
      setMessage(`Added "${fieldName}" with value $${value}`);
      fetchUserBudgetData(); // Refresh list and budget
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
    <ScrollView contentContainerStyle={styles.container}>
    
    <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Ionicons name="share-outline" size={24} color="#4F4F4F" />
    </TouchableOpacity>

      <Text style={styles.heading}>My Budget</Text>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Budget With</Text>
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
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <TextInput
        style={styles.input}
        placeholder="New field name (e.g. groceries)"
        value={fieldName}
        onChangeText={setFieldName}
      />

      <TextInput
        style={styles.input}
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

      <BudgetPieChart data={budgetFields} />

      <Text style={styles.subheading}>Your Budget Fields:</Text>
      {Object.entries(budgetFields).map(([field, value]) => (
        <View key={field} style={styles.budgetItem}>
          <Text style={styles.budgetText}>
            {field}: ${value}
          </Text>
          <TouchableOpacity onPress={() => handleDeleteField(field)}>
            <Text style={styles.deleteButton}>❌</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 22,
    marginBottom: 16,
    fontWeight: '600',
  },
  subheading: {
    fontSize: 18,
    marginTop: 24,
    marginBottom: 12,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: 'green',
  },
  remaining: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'blue',
  },
  budgetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  budgetText: {
    fontSize: 16,
  },
  deleteButton: {
    fontSize: 18,
    color: 'red',
    paddingHorizontal: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  groupItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  groupText: {
    fontSize: 16,
  },
});

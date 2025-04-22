import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { updateUserIncome, updateUserBudget } from '../firebase/firestore';
import { auth, db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import styles from "../styles";

export default function BudgetSettings() {
  const [income, setIncome] = useState('');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setIncome(data.income?.toString() ?? '');
        setBudget(data.budgetTotal?.toString() ?? '');
      }
    };

    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    const parsedIncome = parseFloat(income);
    const parsedBudget = parseFloat(budget);

    if (isNaN(parsedIncome) || isNaN(parsedBudget)) {
      Alert.alert('Error', 'Please enter valid numeric values.');
      return;
    }

    try {
      await updateUserIncome(parsedIncome);
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        budgetTotal: parsedBudget,
      });

      setMessage('Settings updated successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update settings.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={{ paddingTop: 40, paddingHorizontal: 25 }}>

        <TextInput
          style={styles.inputActive}
          placeholder="Monthly Income (€)"
          keyboardType="numeric"
          value={income}
          onChangeText={setIncome}
        />

        <TextInput
          style={styles.inputActive}
          placeholder="Planned Monthly Budget (€)"
          keyboardType="numeric"
          value={budget}
          onChangeText={setBudget}
        />

        <TouchableOpacity onPress={handleSaveSettings} style={styles.buttonForm}>
          <Text style={styles.buttonTextMiddle}>Save Settings</Text>
        </TouchableOpacity>

        {message ? <Text style={styles.message}>{message}</Text> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

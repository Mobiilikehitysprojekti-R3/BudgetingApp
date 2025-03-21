import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { getRemainingBudget, addBudgetField } from '../firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";
import  { auth } from '../firebase/config';

export default function MyBudget() {
  const [fieldName, setFieldName] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const [remainingBudget, setRemainingBudget] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchBudget = async () => {
      const budget = await getRemainingBudget();
      setRemainingBudget(budget);
    };
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log("User is logged in:", user.uid);
        } else {
          console.warn("No user is logged in.");
        }
      });
    fetchBudget();
    return unsubscribe;
  }, []);

  const handleAddField = async () => {
    if (!fieldName || !fieldValue) {
      Alert.alert("Please fill in both fields");
      return;
    }

    const value = parseFloat(fieldValue);
    if (isNaN(value) || value <= 0) {
      Alert.alert("Invalid amount");
      return;
    }

    console.log("Field:", fieldName, "Value:", fieldValue);

    const result = await addBudgetField(fieldName, value);

    if (result.error) {
      Alert.alert("Error", result.error);
    } else {
      setRemainingBudget( result.remainingBudget);
      console.log("Remaining budget:", result.remainingBudget);
      setMessage(`Added "${fieldName}" with value $${value}`);
      setFieldName('');
      setFieldValue('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Budget</Text>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 22,
    marginBottom: 16,
    fontWeight: '600',
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
});

import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { updateUserIncome, addRecurringEntry } from "../firebase/firestore"; // adjust path

const BudgetSettingsScreen = () => {
  const [income, setIncome] = useState("");
  const [recurringAmount, setRecurringAmount] = useState("");
  const [category, setCategory] = useState("");
  const [expenseName, setExpenseName] = useState("");
  const [interval, setInterval] = useState("monthly");
  const [type, setType] = useState("income");

  const handleIncomeUpdate = async () => {
    try {
      await updateUserIncome(Number(income));
      Alert.alert("Success", "Income updated.");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleAddRecurring = async () => {
    try {
      await addRecurringEntry(
        category,
        expenseName,
        Number(recurringAmount),
        interval,
        new Date().toISOString().split("T")[0],
        null,
        type
      );
      Alert.alert("Success", `Recurring ${type} added.`);
      setRecurringAmount("");
      setCategory("");
      setExpenseName("");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Update Income</Text>
      <TextInput
        style={styles.input}
        placeholder="Monthly income (€)"
        keyboardType="numeric"
        value={income}
        onChangeText={setIncome}
      />
      <Button title="Update Income" onPress={handleIncomeUpdate} />

      <Text style={styles.heading}>Add Recurring Entry</Text>
      <TextInput
        style={styles.input}
        placeholder="Category (e.g., Housing)"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="Expense/Income Name"
        value={expenseName}
        onChangeText={setExpenseName}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount (€)"
        keyboardType="numeric"
        value={recurringAmount}
        onChangeText={setRecurringAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Interval (daily, weekly, monthly...)"
        value={interval}
        onChangeText={setInterval}
      />
      <TextInput
        style={styles.input}
        placeholder="Type (income or expense)"
        value={type}
        onChangeText={setType}
      />
      <Button title="Add Recurring Entry" onPress={handleAddRecurring} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
  },
  heading: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
});

export default BudgetSettingsScreen;

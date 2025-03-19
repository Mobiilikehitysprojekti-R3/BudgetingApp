import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert } from "react-native";
import { updateUserName, updateUserPhone, updateUserEmail } from "../firebase/firestore";

export default function Settings() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleUpdateName = async () => {
    await updateUserName(name)
    setName("")
    Alert.alert("Name updated successfully!")
  }

  const handleUpdatePhone = async () => {
    await updateUserPhone(phone)
    setPhone("")
    Alert.alert("Phone number updated successfully!")
  }

  const handleUpdateEmail = async () => {
    if (!email || !password) {
      Alert.alert("Please enter both new email and current password.")
      return
    }

    setEmail("")
    setPassword("")

    await updateUserEmail(email, password)
    Alert.alert("Email updated successfully!")
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile settings</Text>

      <TextInput placeholder="New Name" value={name} onChangeText={setName} style={styles.input} />
      <Button title="Update" onPress={handleUpdateName} />

      <TextInput placeholder="New Phone" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
      <Button title="Update" onPress={handleUpdatePhone} />

      <TextInput placeholder="New Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Current Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <Button title="Update" onPress={handleUpdateEmail} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    marginBottom: 10,
    marginTop: 10,
    paddingHorizontal: 10,
  },
})

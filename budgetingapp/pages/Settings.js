import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet, TextInput } from 'react-native';
import { auth } from '../firebase/config';
import { deleteUser , signOut } from 'firebase/auth';
import { updateUserName, updateUserPhone, updateUserEmail, updateUserPassword, deleteAccount } from "../firebase/firestore";
import styles from "../styles";
/* 
    The Settings component allows logged-in users to update 
    their profile information, including name, phone number, 
    email, and password.

    Users can also log out or permanently delete their accounts.
*/

export default function Settings({ navigation }) {
  // State variables to store user input.
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [emailPassword, setEmailPassword] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const handleUpdateName = async () => {
    await updateUserName(name) // Calls function to update name in database.
    setName("") // Clears input field.
    Alert.alert("Name updated successfully!")
  }

  const handleUpdatePhone = async () => {
    await updateUserPhone(phone) // Calls function to update phone in database.
    setPhone("")
    Alert.alert("Phone number updated successfully!")
  }

  const handleUpdateEmail = async () => {
    if (!email || !emailPassword) {
      Alert.alert("Please enter both new email and current password.")
      return
    }
    await updateUserEmail(email, emailPassword) // Calls function to update email.

    setEmail("")
    setEmailPassword("")
    
    Alert.alert("Email updated successfully!")
  }

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Please enter both current and new password.")
      return
    }
    await updateUserPassword(currentPassword, newPassword) // Calls function to update password.

    setCurrentPassword("")
    setNewPassword("")
    
    Alert.alert("Password updated successfully!")
  }
  
  // Function to handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Logged out successfully");
      navigation.navigate("SignIn"); // Navigate back to SignIn screen
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Function to handle user account deletion
  const handleDeleteUser  = async () => {
    const user = auth.currentUser ;

    if (user) {
      try {
        await deleteAccount (user);
        Alert.alert("User  deleted successfully");
        navigation.navigate("SignIn"); // Navigate back to SignIn screen
      } catch (error) {
        Alert.alert("Error", error.message);
      }
    } else {
      Alert.alert("Error", "No user is currently signed in.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.form}>
      <Text style={styles.link}>Profile settings</Text>

      <TextInput placeholder="New Name" value={name} onChangeText={setName} style={styles.input} />
      <Button title="Update" onPress={handleUpdateName} />

      <TextInput placeholder="New Phone" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
      <Button title="Update" onPress={handleUpdatePhone} />

      <TextInput placeholder="New Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Current Password" value={emailPassword} onChangeText={setEmailPassword} style={styles.input} secureTextEntry />
      <Button title="Update" onPress={handleUpdateEmail} />

      <TextInput placeholder="Current Password" value={currentPassword} onChangeText={setCurrentPassword} style={styles.input} secureTextEntry />
      <TextInput placeholder="New Password" value={newPassword} onChangeText={setNewPassword} style={styles.input} secureTextEntry />
      <Button title="Update Password" onPress={handleUpdatePassword} />
    </View>
      <View>
        <Button title="Delete Account" onPress={handleDeleteUser } />
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </View>
  );
};
{/* 
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
  */}
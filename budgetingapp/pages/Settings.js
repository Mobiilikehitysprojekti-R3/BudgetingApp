import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { auth } from '../firebase/config';
import { deleteUser , signOut } from 'firebase/auth';

const Settings = ({ navigation }) => {
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
        await deleteUser (user);
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
    <View>
      <Text>Settings</Text>
      <View>
        <Button title="Delete Account" onPress={handleDeleteUser } />
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </View>
  );
};

export default Settings;
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, TextInput, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { auth, db } from '../firebase/config';
import { getDoc, doc } from "firebase/firestore";
import { signOut } from 'firebase/auth';
import { updateUserName, updateUserPhone, updateUserEmail, updateUserPassword, deleteAccount } from "../firebase/firestore";
import Ionicons from '@expo/vector-icons/Ionicons';
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
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false)

  //Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setName(userData.name || "");
          setPhone(userData.phone || "");
          setEmail(userData.email || "");
        }
      }
    };
    fetchUserData()
  }, [])

  const handleSave = async () => {
    // Edit profile details (requires password verification)
    if (!currentPassword) {
      Alert.alert("Please enter your current password to verify.")
      return
    }
    try {
      if (name) await updateUserName(name, currentPassword)
      if (phone) await updateUserPhone(phone, currentPassword)
      if (email) await updateUserEmail(email, currentPassword)
      if (newPassword) await updateUserPassword(currentPassword, newPassword)

      Alert.alert("Profile updated successfully!")
      setIsEditing(false)
      setIsPasswordModalVisible(false)
      setCurrentPassword("")

    } catch (error) {
      Alert.alert("Error", error.message)
      setCurrentPassword("")
    }
  }
  
  // Function to handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Logged out successfully");

      // Reset navigation after logout
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
      //navigation.navigate("SignIn"); // Navigate back to SignIn screen
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Function to handle user account deletion
  const handleDeleteUser  = async () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel" },
        { text: "Delete", onPress: async () => {
        const user = auth.currentUser ;
  
        if (user) {
          try {
            await deleteAccount (user);
            Alert.alert("Account  deleted successfully");
            // Reset navigation
            navigation.reset({
              index: 0,
              routes: [{ name: 'SignIn' }],
            })
          } catch (error) {
            Alert.alert("Error", error.message);
        }}
        }
        }
      ]
    )
  }
  //Style for "locked" fields
  const inputStyle = isEditing ? styles.inputActive : styles.inputInactive

  return (
  <ScrollView style={styles.scrollView}>
    <View style={styles.settingsContainer}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.settingsForm}>
        <Text style={styles.link}>Profile settings</Text>
        {!isEditing ? (
          <Ionicons 
            name="pencil" 
            size={20} 
            color="#4F4F4F" 
            onPress={() => setIsEditing(true)}
          />
        ) : (
          <Ionicons 
            name="save" 
            size={20} 
            color="#4F4F4F" 
            onPress={() => setIsPasswordModalVisible(true)}  
          />
        )}
      </View>
      <View style={styles.settingsFormTwo}>
        <TextInput 
          placeholder="Name" value={name} 
          onChangeText={setName} editable={isEditing} 
          style={inputStyle} 
        />
        <TextInput 
          placeholder="Phone" value={phone} 
          onChangeText={setPhone} editable={isEditing} 
          style={inputStyle} keyboardType="phone-pad" 
        />
        <TextInput 
          placeholder="Email" value={email} 
          onChangeText={setEmail} editable={isEditing} 
          style={inputStyle} keyboardType="email-address" 
        />
      </View>
      <View style={styles.settingsForm}>
        <Text style={styles.link}>Change Password</Text>
      </View>
      <View style={styles.settingsFormTwo}>
        <TextInput 
          placeholder="New Password" value={newPassword} 
          onChangeText={setNewPassword} editable={isEditing} 
          style={inputStyle} secureTextEntry 
        />
      </View>
        {/* Password verification pop-up */}
      <Modal visible={isPasswordModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}> 
            <Ionicons 
              name="close" 
              size={24} 
              color="#4F4F4F" 
              onPress={() => {
                setIsPasswordModalVisible(false)
                setCurrentPassword("")
              }}
            />        
            <Text style={{ fontSize: 16, marginBottom: 10}}>Enter current password to confirm changes:</Text>
            <TextInput 
              placeholder="Current Password" 
              value={currentPassword} 
              onChangeText={setCurrentPassword} 
              secureTextEntry 
              style={inputStyle} 
            />
            <TouchableOpacity style={styles.buttonForm} onPress={handleSave}>
              <Text style={styles.buttonTextMiddle}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/*Sign Out Button */}
      <TouchableOpacity style={styles.settingsButton} onPress={handleLogout}>
        <Text style={styles.buttonTextMiddle}>Sign Out</Text>
      </TouchableOpacity>
      {/*Delete Account Section */}
      <TouchableOpacity style={styles.deleteContainer} onPress={handleDeleteUser}>
        <Text style={styles.deleteText}>Delete Account</Text>
        <Ionicons name="trash-outline" size={16} color="#4F4F4F" />
      </TouchableOpacity>
      </View>
    </ScrollView> 
  );
};
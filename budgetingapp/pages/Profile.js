import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Text, Image, Alert } from "react-native";
import  Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import Feather from '@expo/vector-icons/Feather';
import styles from "../styles";
import { fetchUserGroups } from "../firebase/firestore";

export default function Profile({ navigation }) {
  const [image, setImage] = useState(null);
  const defaultAvatar = require("../assets/hacker.png");
  const [userGroups, setUserGroups] = useState([]);

  // Fetch the user's groups using the fetchUserGroups function from firestore.js
  const getUserGroups = async () => {
    const groups = await fetchUserGroups();
    setUserGroups(groups);
  };

  useEffect(() => {
    getUserGroups();
  }, []);

  // Function to handle pressing "My Groups"
  const handleMyGroupsPress = () => {
    console.log("User's Groups:", userGroups);

    if (!userGroups || userGroups.length === 0) {
      navigation.navigate("NoGroups");  // Navigate to NoGroups
    } else {
      navigation.navigate("MyGroups", { groups: userGroups });  // Navigate to MyGroups
    }
  };
    
    const pickImage = async () => {
        //Requesting permission to use gallery
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Permission to access gallery is required!")
            return
        }
        //Permission granted, open gallery
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        })
        if (!result.canceled) {
            setImage(result.assets[0].uri)
        }
    }

    const takePhoto = async () => {
        //Requesting permission to use camera
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== "granted") {
            alert("Permission to access camera is requires!")
            return
        }
        //Permission granted, take a photo :)
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        })
        if (!result.canceled) {
            setImage(result.assets[0].uri)
        }
    }

    const handleEditPhoto = () => {
        Alert.alert(
            "Profile Picture",
            "Choose an option",
            [
                {text: "Take Photo", onPress: takePhoto},
                {text: "Pick from Gallery", onPress: pickImage},
                {text: "Cancel", style: "cancel"}
            ]
        )
    }

    return (
        <View style={styles.container}>
            {/* Settings icon */}
            <Ionicons 
                name="settings-outline" 
                size={24} 
                color="#4F4F4F" 
                style={{ position: "absolute", top: 30, right: 25}}
                onPress={() => navigation.navigate("Settings")}
            />
            {/* Profile section */}
            <View style={styles.profile}>
                <Image 
                    source={image ? {uri: image} : defaultAvatar}
                    style={styles.avatar}
                />
                <Feather 
                    name="edit-2" 
                    size={20} 
                    color="#4F4F4F"
                    onPress={handleEditPhoto}
                />
            </View>
            <Text>"Username here"</Text>
            {/* Buttons */}
            <TouchableOpacity style={styles.buttonOne} onPress={() => navigation.navigate("MyBudget")}>
                <Text style={styles.buttonText}>
                   My Budget 
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonOne} onPress={handleMyGroupsPress}>
                <Text style={styles.buttonText}>
                   My Groups 
                </Text>
            </TouchableOpacity>
        </View>
    )
}
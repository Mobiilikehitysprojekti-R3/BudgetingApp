import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Text, Image, Alert } from "react-native";
import  Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import Feather from '@expo/vector-icons/Feather';
import styles from "../styles";
import { fetchUserGroups, getUserData } from "../firebase/firestore";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import * as ImageManipulator from "expo-image-manipulator";

export default function Profile({ navigation }) {
  const [userData, setUserData] = useState(null)
  const [image, setImage] = useState(null)
  const [name, setName] = useState("");
  const defaultAvatar = require("../assets/hacker.png")
  const [userGroups, setUserGroups] = useState([])

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setName(userData.name || "Username here");  // Default value if no name
          setImage(userData.profilePictureBase64 ? `data:image/jpeg;base64,${userData.profilePictureBase64}` : null); // Handle profile picture
        }
      }
    };

    fetchUserData();
  }, []);

  // Fetch the user's groups using the fetchUserGroups function from firestore.js
  const getUserGroups = async () => {
    const groups = await fetchUserGroups();
    setUserGroups(groups);
  };

  // Function to handle pressing "My Groups"
  const handleMyGroupsPress = () => {
    console.log("User's Groups:", userGroups);

    if (!userGroups || userGroups.length === 0) {
      navigation.navigate("NoGroups");  // Navigate to NoGroups
    } else {
      navigation.navigate("MyGroups", { groups: userGroups });  // Navigate to MyGroups
    }
  };

  // Function to convert image URI to Base64
  const getBase64 = async (uri) => {
    const base64String = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64
    })
    return base64String
  }

  // Resize the image before converting it to Base64
  const resizeImage = async (uri) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 300} }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      )
      return manipResult.uri
    } catch (error) {
      console.error("Error resizing image: ", error)
    }
  }

  const uploadProfilePicture = async (uri) => {
    try {
      console.log("Image URI before resizing:", uri)

      // Resize the image
      const resizedUri = await resizeImage(uri)
      console.log("Resized image URI:", resizedUri)

      // Convert image to Base64 string
      const base64String = await getBase64(resizedUri)

      // Get current user's UID
      const uid = auth.currentUser.uid

      // Store the Base64 string in Firestore
      const userDocRef = doc(db, "users", uid)
      await updateDoc(userDocRef, { profilePictureBase64: base64String })

      // Update local state to display image
      setImage(`data:image/jpeg;base64,${base64String}`)

      return base64String //Return the Base64 string
    } catch (error) {
      console.error("Error uploading profile picture (Base64): ", error) 
    }
  }

  const pickImage = async () => {
    //Requesting permission to use gallery
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
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
      const uri = result.assets[0].uri
      setImage(uri)
      try {
        await uploadProfilePicture(uri)
      } catch (error) {
        alert("Upload failed. Please try again.")
      }
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
      const uri = result.assets[0].uri
      setImage(uri)
      try {
        await uploadProfilePicture(uri)
      } catch (error) {
        alert("Upload failed. Please try again.")
      }
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

    
  useEffect(() => {
    getUserGroups();
    //loadUserProfilePicture()
  }, []);

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
                    source={image ? { uri: image } : defaultAvatar}
                    style={styles.avatar}
                />
                <Feather 
                    name="edit-2" 
                    size={20} 
                    color="#4F4F4F"
                    onPress={handleEditPhoto}
                />
            </View>
            <Text>{name}</Text>
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
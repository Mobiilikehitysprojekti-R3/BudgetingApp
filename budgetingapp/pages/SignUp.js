import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert } from "react-native";
import { auth, createUserWithEmailAndPassword, db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";

/* 
    The SignUp component allows users to register by providing
    their name, email, phone, and password.
    
    Firebase Authentication lets users sign up and sign in securely.

    Firestore is used to store additional user data such as name, phone number
    and other profile details that don't belong in Authentication.
*/

export default function SignUp({ navigation }) {
  // useState hooks to store input values from the user
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")

  // Function to handle user registration
  const handleRegister = async () => {
    // Check if all fields are filled
    if (!name || !email || !phone || !password) {
      Alert.alert("Error", "All fields are required.")
      return
    }
    
    try {
      // Create a new user in Firebase Authentication using email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Store additional user details in Firestore database
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        phone,
        uid: user.uid, // User ID
      })

      // Empty all input fields after a successful registration
      setName("")
      setEmail("")
      setPhone("")
      setPassword("")

      // Navigate the user to the SignIn screen
      Alert.alert("User registered successfully!")

      navigation.navigate("SignIn")
    } catch (error) {
      Alert.alert("Error", error.message)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Phone Number" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <Button title="Register" onPress={handleRegister} />
       <Text style={styles.link} onPress={() => navigation.navigate("SignIn")}>
              Already have an account? Sign in
            </Text>
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
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
})

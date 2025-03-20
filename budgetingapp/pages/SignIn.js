import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert } from "react-native";
import { auth, signInWithEmailAndPassword } from "../firebase/config";
import { updateUserBudget, updateUserIncome } from "../firebase/firestore";

/* 
    The SignIn allows users to log in by providing
    their email and password.
    Firebase Authentication lets users sign up and sign in securely.
*/

export default function SignIn({ navigation }) {
  // useState hooks to store input values from the user
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Function to handle user sign in
  const handleSignIn = async () => {
    // Checks if all fields are filled
    if (!email || !password) {
      Alert.alert("Error");
      return;
    }

    try {
      // Sign in the user with Firebase Authentication using email and password
      await signInWithEmailAndPassword(auth, email, password);

      // Empty all input fields after a successful sign in
      setEmail("");
      setPassword("");

      // Navigates the user to the profile screen
      Alert.alert("Signed in successfully");
      //navigation.navigate("Profile");
      navigation.navigate("CreateGroup");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Sign In" onPress={handleSignIn} />
      <Text style={styles.link} onPress={() => navigation.navigate("SignUp")}>
        Don't have an account? Sign Up
      </Text>
    </View>
  );
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
  link: {
    marginTop: 15,
    color: "blue",
    textDecorationLine: "underline",
  },
});
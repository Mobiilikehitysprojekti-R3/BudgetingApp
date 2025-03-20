import React, { useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import  Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import styles from "../styles";

export default function Profile({ navigation }) {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
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
                <MaterialCommunityIcons 
                    name="emoticon-wink-outline" 
                    size={55} 
                    color="#4F4F4F" 
                />
                <Text>"Name"</Text>

            </View>
            {/* Buttons */}
            <TouchableOpacity style={styles.buttonOne} onPress={() => navigation.navigate("MyBudget")}>
                <Text style={styles.buttonText}>
                   My Budget 
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonOne} onPress={() => navigation.navigate("MyGroups??")}>
                <Text style={styles.buttonText}>
                   My Groups 
                </Text>
            </TouchableOpacity>
        </View>
    )
}
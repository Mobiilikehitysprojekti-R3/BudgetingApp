import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import styles from '../styles';

export default function NoGroups({ navigation }) {
    const [groups] = useState([]); 
  
    const handleCreateGroup = () => {
        navigation.navigate('CreateGroup'); 
  
    return (
        <View style={styles.container}>
            <Text style={styles.title}>MY GROUPS</Text>
            <View >
                <Text >You're not in any group yet, start here</Text>
                <TouchableOpacity style={styles.buttonTwo} onPress={handleCreateGroup}>
                    <Text style={styles.buttonText}>Create Group</Text>
                </TouchableOpacity>
            </View>
        </View> 
    ); 
}}
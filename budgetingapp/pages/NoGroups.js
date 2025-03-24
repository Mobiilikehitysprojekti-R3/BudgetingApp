import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import styles from '../styles';

export default function NoGroups ({ navigation }) {
    const [groups] = useState([]); 
  
    const handleCreateGroup = () => {
      navigation.navigate('CreateGroup'); // Navigate to CreateGroup page
    };
  
    return (
      <View style={styles.container}>
          <Text style={styles.title}>MY GROUPS</Text>
        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>You're not in any group yet, start here</Text>
            <TouchableOpacity style={styles.buttonTwo} onPress={handleCreateGroup}>
              <Text style={styles.buttonText}>Create Group</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.groupItem}>
                <Text style={styles.groupName}>{item.name}</Text>
              </View>
            )}
          />
        )}
      </View>
    );
  };
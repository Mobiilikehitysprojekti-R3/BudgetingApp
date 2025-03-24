import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import styles from '../styles';

export default function MyGroups({ navigation }) {
    const [groups] = useState([]);

    const handleGroupPress = (groupId) => {
        navigation.navigate('Group', { groupId }); // Navigate to Group page
    };

    return (
      <View style={styles.container}> 
          <Text style={styles.title}>MY GROUPS</Text>
          <FlatList
              data={groups}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleGroupPress(item.id)} style={styles.buttonTwo}>
                      <Text style={styles.buttonText}>{item.name}</Text>
                  </TouchableOpacity>
              )}     //lists all existing groups that user belongs to      
            // navigate to NoGroups page to create new group
          />
            <TouchableOpacity style={styles.buttonOne} onPress={() => navigation.navigate("NoGroups")}> 
                <Text style={styles.buttonText}>Create Group</Text> 
            </TouchableOpacity>
      </View>
  );
}

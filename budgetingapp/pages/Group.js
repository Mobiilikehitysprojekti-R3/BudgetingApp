import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import styles from '../styles';

export default function Group({ navigation, uid }) {
    const [budgets] = useState([]);

    const handleBudgetPress = (groupId) => {
        navigation.navigate('SharedBudget', { groupId }); // Navigate to groups budget page
    };

    return (
      <View style={styles.container}> 
          <Text style={styles.title}>{item.name}</Text>
          <FlatList
              data={budgets}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleBudgetPress(item.id)} style={styles.buttonTwo}>
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

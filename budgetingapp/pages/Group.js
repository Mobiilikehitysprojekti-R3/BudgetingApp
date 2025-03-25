import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import styles from '../styles';

export default function Group({ navigation, uid }) {
    const [budgets] = useState([]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const userGroups = await getUsersGroups(userId); // Fetch groups for the user
                setGroups(userGroups); // Set the fetched groups in state
            } catch (error) {
                console.error("Failed to fetch groups: ", error);
            }
        };

        fetchGroups(); // Call the function to fetch groups
    }, [userId]); // Dependency array includes userId to refetch if it changes


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

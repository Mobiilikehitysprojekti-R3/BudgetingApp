// Group.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fetchGroupById } from '../firebase/firestore'; // Assume this function fetches group data by ID

const Group = ({ route }) => {
  const { groupId } = route.params; // Get the groupId from the route parameters
  const [group, setGroup] = useState(null);

  useEffect(() => {
    const loadGroup = async () => {
      const groupData = await fetchGroupById(groupId); // Fetch group data
      setGroup(groupData);
    };
    loadGroup();
  }, [groupId]);

  if (!group) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{group.name}</Text>
      <Text >{group.description}</Text>
    </View>
  );
};

export default Group;
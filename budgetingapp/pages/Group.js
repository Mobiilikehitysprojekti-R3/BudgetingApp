import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { fetchGroupById } from '../firebase/firestore';
import CreateBudgetModal from '../components/CreateBudgetModal'; 

const Group = ({ route }) => {
    const { groupId } = route.params; // Gets the groupId from the route parameters
    const [group, setGroup] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const loadGroup = async () => {
            const groupData = await fetchGroupById(groupId); // Fetches group data
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
            <Button title="Create New Budget" onPress={() => setModalVisible(true)} />
            <CreateBudgetModal 
                visible={isModalVisible} 
                onClose={() => setModalVisible(false)} 
                groupId={groupId} // Pass the groupId to the modal
            />
        </View>
    );
};

export default Group;
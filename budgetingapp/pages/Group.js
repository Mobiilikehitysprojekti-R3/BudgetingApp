import React, { useEffect, useState } from 'react';
import { View, Text, Button, Modal, FlatList, TouchableOpacity, Alert } from 'react-native';
import { fetchGroupById, fetchGroupBudgets, fetchSharedBudgets, deleteSharedBudget, deleteGroup } from '../firebase/firestore';
import CreateBudgetModal from '../components/CreateBudgetModal.js';
import styles from "../styles.js"
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../firebase/config.js';
import ChatModal from '../components/ChatModal.js';
import { sendMessage, listenToMessages, markMessagesAsRead } from '../firebase/firestore'
import { useFocusEffect } from '@react-navigation/native';

/* 
  The Group component allows users to view and manage budgets within a specific group.
    
  Users can:
  - See details of a group including its name and associated budgets.
  - View shared budgets by other group members and view details of those budgets.
  - Delete their own shared budgets from the group.
  - Create new budgets for the group.
*/

export default function Group({ route, navigation }) {
  const { groupId } = route.params; // Gets the groupId from the route parameters
  const [group, setGroup] = useState(null);
  const [groupBudgets, setGroupBudgets] = useState([]); // State to hold group budgets
  const [sharedBudgets, setSharedBudgets] = useState([])
  const [openCreateBudgetModal, setOpenCreateBudgetModal] = useState(false)
  const [chatVisible, setChatVisible] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [messages, setMessages] = useState([]);
    
  const loadGroupBudgets = async () => {
    console.log("Fetching budgets for groupId:", groupId);
    try {
      const budgets = await fetchGroupBudgets(groupId); // Fetches group budgets
      setGroupBudgets(budgets);
      console.log("Fetched budgets:", budgets);
    } catch (error) {
      console.error('Error fetching budgets:', error)
    }  
  };

  useEffect(() => {
    const loadGroupData = async () => {
      try {
        console.log("Fetching group data for groupId:", groupId);
        const groupData = await fetchGroupById(groupId); // Fetches group data
        console.log("Fetched group data:", groupData);
        setGroup(groupData);
      } catch (error) {
        console.error('Error fetching group:', error)
      }
    };

    const loadSharedBudgetsData = async () => {
      try {
        const budgets = await fetchSharedBudgets(groupId)
        setSharedBudgets(budgets)
      } catch (error) {
        console.error('Error fetching shared budgets:', error)
      }
    }

    const loadData = async () => {
      await Promise.all([loadGroupData(), loadSharedBudgetsData(), loadGroupBudgets()])
      setLoading(false)
    }

    loadData()
  }, [groupId]);

  useFocusEffect(
    React.useCallback(() => {
      loadGroupBudgets(); // for refreshing group budgets 

      // Clears the budgetDeleted parameter after using it
      if (route.params?.budgetDeleted) {
        navigation.setParams({ budgetDeleted: undefined });
      }
    }, [route.params?.budgetDeleted]) // Dependency array includes budgetDeleted
  );

  const handleDeleteSharedBudget = async (budgetId) => {
    try {
      await deleteSharedBudget(budgetId)
      const updatedBudgets = await fetchSharedBudgets(groupId)
      setSharedBudgets(updatedBudgets)
    } catch (error) {
      console.error("Error deleting budget:", error)
    }
  }   
  
const handleDeleteGroupPress = async () => {
    // Confirmation alert
    const confirm = await new Promise((resolve) =>
        Alert.alert('Delete group', `Are you sure you want to delete this group?`, [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
        ])
    );

    // Check if the user confirmed the deletion
    if (!confirm) return; // Exit if the user did not confirm

    try {
      await deleteGroup(groupId);
      navigation.navigate('MyGroups')
  } catch (error) {
      console.error("Error deleting group:", error);
      Alert.alert("Error", "Failed to delete group.");
  }
};


  const handleOpenCreateBudgetModal = () => {
    if (group?.owner === auth.currentUser?.uid) {
      setOpenCreateBudgetModal(true)
    } else {
      alert("Only the group owner can create a budget.")
    }
  }

  useEffect(() => {
    if (!groupId) return;
  
    const unsubscribe = listenToMessages(groupId, (msgs) => {
      setMessages(msgs);
      countUnreadMessages(msgs); // Count unread messages
    });
  
    return () => unsubscribe(); // Cleanup listener on unmount
  }, [groupId]);
  
  // Function to count unread messages
  const countUnreadMessages = (msgs) => {
    const unreadMessages = msgs.filter(msg => !msg.readBy.includes(auth.currentUser.uid));
    setUnreadCount(unreadMessages.length);
  };

  const handleCloseModal = () => {
    setOpenCreateBudgetModal(false);
    loadGroupBudgets(); // Refresh budgets after closing the modal
  };

  if (!group) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Settings icon */}
      <Ionicons 
        name="settings-outline" 
        size={24} 
        color="#4F4F4F" 
        style={{ position: "absolute", top: 30, right: 25}}
        onPress={() => navigation.navigate("GroupSettings", {groupId})}
      />
        <Text style={styles.title}>{group.name}</Text>
      
      <View style={styles.list}>
      <Text style={styles.link}>Shared Budgets:</Text>
      {sharedBudgets.length === 0 ? (
        <Text style={styles.noBudgetsText}>No shared budgets available.</Text>
      ) : (
        <FlatList
          data={sharedBudgets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <TouchableOpacity style={styles.buttonThree}
                onPress={() => navigation.navigate('BudgetDetails', { budgetId: item.id })}>
                <Text style={styles.buttonText}>View {item.userName}'s Budget</Text>
                {item.userId === auth.currentUser?.uid && (
                <TouchableOpacity 
                  onPress={() => handleDeleteSharedBudget(item.groupId)}
                  style={styles.deleteIconForTouchable}>
                <Ionicons name="close-outline" size={24} color="white" />
                </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      </View>

      <View style={styles.list}>
      <Text style={styles.link}>Group Budgets:</Text>
      {groupBudgets.length === 0 ? (
        <Text>No budgets available.</Text>
      ) : (
      <FlatList
        data={groupBudgets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
        <TouchableOpacity style={styles.buttonThree} onPress={() => navigation.navigate('GroupBudget', { budgetId: item.id })}>
          <Text style={styles.buttonText}>{item.name}</Text>
          <Ionicons name="chevron-forward" size={20} color="white" style={styles.iconStyle} />
        </TouchableOpacity>

        )}
       />
     )}
      </View>

      <Ionicons 
        name="add-circle-outline" 
        size={30} color="#A984BE" 
        onPress={handleOpenCreateBudgetModal}
      />
      
      <CreateBudgetModal 
        visible={openCreateBudgetModal}
        onClose={handleCloseModal}
        groupId={groupId}
      />

                  
      {group.owner === auth.currentUser?.uid && (
        <TouchableOpacity style={styles.deleteContainer} onPress={handleDeleteGroupPress}>
          <Text style={styles.deleteText}>Delete Group</Text>
            <Ionicons name="trash-outline" size={16} color="#4F4F4F" />
        </TouchableOpacity>
      )}

      {/* Chatbox */}
      <TouchableOpacity style={styles.chatContainer} onPress={() => setChatVisible(true)}>
        <Ionicons name="chatbox-ellipses-outline" size={40} color="#4F4F4F" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <ChatModal
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
        groupId={group.id} // Make sure `group.id` is passed correctly
      />
    </View>
    );
};
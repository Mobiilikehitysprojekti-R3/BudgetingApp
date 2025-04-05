import React, { useEffect, useRef, useState } from 'react'
import { Modal, View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { sendMessage, listenToMessages, markMessagesAsRead } from '../firebase/firestore'
import { auth } from '../firebase/config';
import Ionicons from '@expo/vector-icons/Ionicons';


export default function ChatModal({ visible, onClose, groupId }) {
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const flatListRef = useRef(null)

  const userId = auth.currentUser?.uid

  useEffect(() => {
    if (!groupId) return

    const unsubscribe = listenToMessages(groupId, (msgs) => setMessages(msgs))
    return () => unsubscribe()
  }, [groupId])

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true })
  }, [messages])

  useEffect(() => {
    if (visible && groupId) {
      markMessagesAsRead(groupId)
    }
  }, [visible, groupId])

  const handleSend = () => {
    if (messageText.trim()) {
      sendMessage(groupId, messageText.trim())
      setMessageText('')
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
        <View style={{ flex: 1, backgroundColor: '#fff', padding: 10 }}>
        <Ionicons name="close" size={24} color="black" onPress={onClose}/>
        {/* Message list */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isMine = item.senderId === userId
            const isRead = item.isRead
            return(
              <View
                style={{
                  alignSelf: isMine ? 'flex-end' : 'flex-start',
                  backgroundColor: isMine ? '#DCF8C6' : '#E5E5EA',
                  borderRadius: 15,
                  marginBottom: 6,
                  maxWidth: '75%',
                  padding: 10,
                }}
              >
                {!isMine && (
                  <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>
                    {item.senderName}
                  </Text>
                )}
                <Text>{item.text}</Text>
              {/* Green Checkmark if message is read */}
                {isRead && (
                  <Ionicons
                    name='checkmark-circle'
                    size={18}
                    color="green"
                    style={{ position: "absolute", right: -20, bottom: 0,}}
                  />
                )}
              </View>
            )
          }}
        />
        {/* Message input + send */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder='Type a message...'
            style={{
              flex: 1,
              borderColor: '#ccc',
              borderWidth: 1,
              borderRadius: 20,
              paddingHorizontal: 15,
              paddingVertical: 8,
            }}
          />
        <TouchableOpacity onPress={handleSend} style={{ marginLeft: 10 }}>
          <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Send</Text>
        </TouchableOpacity>
        </View>
        </View>
    </Modal>
  )
}

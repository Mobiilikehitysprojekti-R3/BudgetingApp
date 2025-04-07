import React, { useEffect, useState } from 'react'
import { FlatList, View, Text, } from 'react-native'
import { getUserByGroupId } from '../firebase/firestore'
import styles from '../styles'

export default function GroupSettings({ route }) {
  const { groupId } = route.params
  const [members, setmembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  if (!groupId) {
    return (
      <View style={styles.centered}>
        <Text>Error: No groupId provided</Text>
      </View>
    );
  }

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const fetchedMembers = await getUserByGroupId(groupId)
        if (fetchedMembers) {
          setmembers(fetchedMembers)
        } else {
          setError('Failed to load group members.')
        }
      } catch (error) {
        setError('Error fetching group members.')
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [groupId])

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Group Members</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => {
          return (item.id || item.uid || `${Math.random()}`).toString()
        }}
        renderItem={({ item }) => (
          <View style={styles.memberItem}>
            <Text>{item.name}</Text>
            <Text>{item.phone}</Text>
          </View>
        )}
      />
    </View>
  )
}

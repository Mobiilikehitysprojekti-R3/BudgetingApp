// Profile.js
import React from 'react';
import { View, Text, Button } from 'react-native';

const Profile = ({ navigation }) => {
  return (
    <View>
      <Text>My Profile</Text>
      <Button title="Go to Settings" onPress={() => navigation.navigate("Settings")} />
    </View>
  );
};

export default Profile;


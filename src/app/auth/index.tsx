import React from 'react';

import { Text, View } from 'react-native';

import { useAuth } from 'contexts/AuthContext';

export default () => {
    const { user, login, anonId } = useAuth();
    console.log('signin anonid', anonId?._commitment);
    
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text
          onPress={() => login({ username: 'a', password: 'b', email: 'blah@blah.blah '})}
        >
          Login
        </Text>
        <Text>
          Your anon ID :
          <Text style={{ fontWeight: 'bold' }}>
            {anonId?._commitment.toString()}
          </Text>
        </Text>
      </View>
    );
}
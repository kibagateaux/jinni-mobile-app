import { Text, View } from 'react-native';

import { useAuth } from 'contexts/AuthContext';
import { AppleAuth, OAuth } from 'components/auth'


const signin = () => {
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
      
      <AppleAuth />
      <OAuth provider={'spotify'} />
      <OAuth provider={'strava'} />
      <OAuth provider={'coinbase'} />
    </View>
  );
}

export default signin;
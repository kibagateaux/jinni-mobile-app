import React, { useEffect } from 'react';

import { Text, View } from 'react-native';

import { useAuth } from 'contexts/AuthContext';
import { getSteps } from 'utils/inventory/android-health-connect';
import { PORTAL_DAY } from 'utils/mayanese';

export default (props) => {
    console.log('oauth callback props', props);
    // So this works but not entirely sure what to do now?
    // think we've done first half of authorization code
    // now we do second half of exchanging code for access token
    // have to make a request to server to initiate? Dont necessarily need server can just do thru client
    // doing through server would let us expose your data to other users e.g. let us show them ur top 10 songs (right now we could only get ur top 10 for u on ur device)

    const { user, login, anonId } = useAuth();
    console.log('oauth callback', anonId?._commitment);
    useEffect(() => {
        // getSteps({
        //   startTime: PORTAL_DAY,
        //   endTime: '2023-10-10T23:53:15.405Z'
        // });
    });
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
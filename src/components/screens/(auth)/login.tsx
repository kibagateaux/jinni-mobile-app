import React, { useEffect } from 'react';

import { Text, View } from 'react-native';

import { useAuth } from 'contexts/AuthContext';
// import { getSteps } from 'utils/inventory/android-health-connect';
// import { PORTAL_DAY } from 'utils/mayanese';

export default () => {
    const { user, login, anonId } = useAuth();
    console.log('signin anonid', user, anonId?._commitment);
    useEffect(() => {
        // getSteps({
        //   startTime: PORTAL_DAY,
        //   endTime: '2023-10-10T23:53:15.405Z'
        // });
    });
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text onPress={() => login({ username: 'a', password: 'b', email: 'blah@blah.blah ' })}>
                Login
            </Text>
            <Text>
                Your anon ID :
                <Text style={{ fontWeight: 'bold' }}>{anonId?._commitment.toString()}</Text>
            </Text>
        </View>
    );
};

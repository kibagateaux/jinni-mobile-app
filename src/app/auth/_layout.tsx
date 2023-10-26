import React from 'react';
import { Stack } from 'expo-router';

export interface AuthStackProps {}

const AuthStack: React.FC<AuthStackProps> = () => {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="oauth-callback" options={{ title: 'Confirm Login' }} />
        </Stack>
    );
};

export default AuthStack;

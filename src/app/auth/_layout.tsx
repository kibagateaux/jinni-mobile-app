import React from 'react';
import { Stack, Slot } from 'expo-router';

import { useTheme } from 'contexts/ThemeContext';

export interface AuthStackProps {}

const AuthStack: React.FC<AuthStackProps> = () => {
  const theme = useTheme(); 
  return (
      <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.primaryBackgroundColor,
            },
            headerTintColor: theme.primaryTextColor,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
          >
        <Stack.Screen
          name="sign-in"
          options={{ title: 'Login' }}
          />
      {/* <Stack.Screen
          name="signup"
          options={{ title: 'signup' }}
        /> */}
        <Stack.Screen
          name="/auth/[provider]"
          // path="/auth/[provider]"
          options={{ title: '3rd Party Login' }}
          />
      </Stack>
  );
};

export default AuthStack;

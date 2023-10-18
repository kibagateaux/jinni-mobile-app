import React from 'react';
import { Stack, Slot } from 'expo-router';

import { useTheme } from 'contexts/ThemeContext';

export interface AuthStackProps {}

const AuthStack: React.FC<AuthStackProps> = () => {
  const theme = useTheme(); 
  return (
      <Stack
          screenOptions={{
            headerShown: false,
          }}
      >
      <Stack.Screen
          name="oauth-callback"
          options={{ title: 'Confirm Login' }}
        />
      </Stack>
  );
};

export default AuthStack;

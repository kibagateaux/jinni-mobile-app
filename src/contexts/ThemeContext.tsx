//theme.tsx
import React, { createContext } from 'react';
import {useColorScheme} from 'react-native';

type Theme = {
    colorScheme: 'light' | 'dark';
    primaryColor: string;
    secondaryColor: string;
    primaryBackgroundColor: string;
    secondaryBackgroundColor: string;
    primaryTextColor: string;
    secondaryTextColor: string;

};

const lightTheme: Theme = {
  colorScheme: 'light',
  primaryColor: '#fff',
  secondaryColor: '#fff',
  primaryBackgroundColor: '#EBEBEB',
  secondaryBackgroundColor: '#AA00FF',
  primaryTextColor: '#000',
  secondaryTextColor: '#1C0221',
};

const darkTheme: Theme = {
  colorScheme: 'dark',
  primaryColor: '#AA00FF',
  secondaryColor: '#1C0221',
  primaryBackgroundColor: '#000',
  secondaryBackgroundColor: '#1C0221',
  primaryTextColor: '#C0C0C0',
  secondaryTextColor: '#EBEBEB',
};

const ThemeContext = createContext<Theme>(lightTheme);


export const ThemeProvider: React.FC = ({ children })=> {
  const colorScheme = useColorScheme();
  return (
    <ThemeContext.Provider
      value={colorScheme === 'dark' ? darkTheme : lightTheme }>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => React.useContext(ThemeContext);
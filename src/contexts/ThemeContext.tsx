//theme.tsx
import React, { createContext } from 'react';
import { useColorScheme } from 'react-native';

// TODO delete and replace with REact-Navigation theming
// https://docs.expo.dev/routing/appearance/#react-navigation-themes
type Theme = {
    colorScheme: 'light' | 'dark';
    primaryColor: string;
    secondaryColor: string;
    primaryBackgroundColor: string;
    secondaryBackgroundColor: string;
    accentColor: string;
    primaryTextColor: string;
    secondaryTextColor: string;
    altTextColor: string;
    itemStatusColors: { [key: string]: string };
};

const itemStatusColors = {
    unequipped: 'purple',
    equipped: 'blue',
    equipping: 'yellow',
    destroyed: 'red',
};

const lightTheme: Theme = {
    colorScheme: 'light',
    primaryColor: '#fff',
    secondaryColor: '#fff',
    primaryBackgroundColor: '#EBEBEB',
    secondaryBackgroundColor: '#AA00FF',
    accentColor: '#131862',
    primaryTextColor: '#000',
    secondaryTextColor: '#1C0221',
    altTextColor: '#C0C0C0',
    itemStatusColors,
};

const darkTheme: Theme = {
    colorScheme: 'dark',
    primaryColor: '#AA00FF',
    secondaryColor: '#1C0221',
    primaryBackgroundColor: '#131862',
    secondaryBackgroundColor: '#1C0221',
    accentColor: '#ffcff9',
    primaryTextColor: '#C0C0C0',
    secondaryTextColor: '#EBEBEB',
    altTextColor: '#1C0221',
    itemStatusColors,
};

const ThemeContext = createContext<Theme>(lightTheme);

type Props = {
    children?: React.ReactNode;
};
export const ThemeProvider: React.FC<Props> = ({ children }) => {
    const colorScheme = useColorScheme();
    return (
        <ThemeContext.Provider value={colorScheme === 'dark' ? darkTheme : lightTheme}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => React.useContext(ThemeContext);

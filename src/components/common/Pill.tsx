import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

interface CardProps {
    size: 'sm' | 'md';
    text: string;
    theme?: 'primary' | 'secondary';
}

const Pill: React.FC<CardProps> = ({ size, text, theme = 'primary' }) => {
    const themeStyle = theme === 'primary' ? styles.primary : styles.secondary;
    return (
        <View key={text} style={[styles.pill, styles[size], themeStyle]}>
            <Text style={[styles.pillText, themeStyle]}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    sm: {
        padding: 7,
        height: 35,
        width: 70,
    },
    md: {
        padding: 25,
        height: 70,
        width: 140,
    },
    pill: {
        textAlign: 'center',
        // alignSelf: 'flex-start', // extend to text width
        borderRadius: 20,
    },
    primary: {
        backgroundColor: 'purple',
        color: 'white',
    },
    secondary: {
        backgroundColor: 'gold',
        color: 'black',
    },
    pillText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default Pill;

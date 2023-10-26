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
        minHeight: 35,
        minWidth: 70,
    },
    md: {
        minHeight: 70,
        minWidth: 140,
    },
    pill: {
        padding: 7,
        textAlign: 'center',
        alignSelf: 'flex-start', // extend to text width
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

import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import { Link, Pill } from 'components';

interface CardProps {
    image: string;
    title: string;
    subtitle: string;
    path?: string;
    styleOverride?: object;
    badges: string[];
}

const Card: React.FC<CardProps> = ({
    styleOverride = {},
    image,
    title,
    subtitle,
    path,
    badges,
}) => {
    const CardContent = () => (
        <View style={[styles.card, styleOverride]}>
            <Image source={{ uri: image }} style={styles.image} />
            <Text>{title}</Text>
            <Text>{subtitle}</Text>
            {!badges.length ? null : (
                <View style={styles.badgeContainer}>
                    {badges.map((badge) => (
                        <Pill size="sm" text={badge} />
                    ))}
                </View>
            )}
        </View>
    );

    return path ? (
        <Link to={path}>
            <CardContent />
        </Link>
    ) : (
        <CardContent />
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        margin: 10,
        height: 200,
        width: 200,
        alignItems: 'center',
        alignContent: 'center',
    },
    image: {
        alignSelf: 'center',
        width: 100,
        height: 100,
    },
    badgeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badge: {
        height: 35,
        width: 70,
        padding: 7,
        textAlign: 'center',
        backgroundColor: 'purple',
        borderRadius: 20,
    },
    badgeText: {
        color: 'white',
    },
});

export default Card;

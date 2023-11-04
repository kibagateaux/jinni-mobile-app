import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import Link from './Link';
import Pill from './Pill';

interface CardProps {
    image: string;
    title: string;
    subtitle: string;
    path?: string;
    styleOverride?: object;
    badges: string[];
    horizontal: boolean;
}

const Card: React.FC<CardProps> = ({
    styleOverride = {},
    image,
    title,
    subtitle,
    path,
    badges,
    horizontal,
}) => {
    const Wrapper = path ? ({ children }) => <Link to={path}>{children}</Link> : React.Fragment;
    return (
        <Wrapper>
            <View
                style={[
                    styles.card,
                    horizontal ? styles.cardRow : styles.cardColumn,
                    styleOverride,
                ]}
            >
                <View style={styles.contentContainer}>
                    <Image source={{ uri: image }} style={styles.image} />
                    <Text style={styles.cardContent}>{title}</Text>
                    <Text style={styles.cardContent}>{subtitle}</Text>
                </View>
                {!badges.length ? null : (
                    <View
                        style={[
                            styles.badgeContainer,
                            horizontal ? styles.badgeColumn : styles.badgeRow,
                        ]}
                    >
                        {badges.map((badge) => (
                            <Pill size="sm" text={badge} />
                        ))}
                    </View>
                )}
            </View>
        </Wrapper>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
    },
    cardColumn: {
        flexDirection: 'column',
    },
    cardRow: {
        flexDirection: 'row',
    },
    contentContainer: {
        flex: 1,
        margin: 10,
        width: 150,
        // alignContent: 'center',
        // textAlign: 'center',
    },
    cardContent: {},
    image: {
        width: 100,
        height: 100,
    },
    badgeContainer: {
        flex: 1,
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    badgeColumn: {
        flexDirection: 'column',
        // marginRight: 24,
    },
    badgeRow: {
        // justifyContent: 'center',
    },
});

export default Card;

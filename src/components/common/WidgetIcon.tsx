import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Link from './Link';

interface LinkProps {
    widgetId: string;
    text: string;
    icon?: string | React.FC | undefined;
    styleOverride?: object;
    to?: string;
    height?: number | string;
    width?: number | string;
}

const WidgetIcon = ({ widgetId, icon, text, to, styleOverride, ...diumensions }: LinkProps) => {
    const renderWidgetIcon = () => {
        if (!icon) return null;

        if (typeof icon === 'function') {
            const Icon = icon as React.FC;
            return <Icon {...styles.svg} {...diumensions} />;
        }

        if (typeof icon === 'string' && icon.startsWith('http'))
            return <Image source={{ uri: icon }} style={styles.svg} />;

        return <Text style={styles.symbol}> {icon} </Text>;
    };

    return (
        <Link to={to ?? ''} trackingId={widgetId}>
            <View style={[styles.container, styleOverride]}>
                <View style={styles.svg}>{renderWidgetIcon()}</View>
                <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
                    {text}
                </Text>
            </View>
        </Link>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    symbol: {
        // height: 30,
        // width: 30,
        fontStyle: 'italic',
    },
    svg: {
        // flex: 1,
        // height: 30,
        // width: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        textAlign: 'center',
        width: '100%',
        overflow: 'hidden',
    },
});

export default WidgetIcon;

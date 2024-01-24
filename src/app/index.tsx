import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { isEmpty } from 'lodash/fp';

import { useHomeConfig } from 'hooks';
import { useTheme, useAuth } from 'contexts';
import { WidgetConfig } from 'types/UserConfig';
import { getIconForWidget } from 'utils/rendering';
import { saveHomeConfig } from 'utils/config';
import { getActivityData } from 'inventory/android-health-connect';

import { AvatarViewer, WidgetIcon } from 'components/index';
import DefaultAvatar from 'assets/avatars/red-yellow-egg';
import WidgetContainer from 'components/home/WidgetContainer';

const HomeScreen = () => {
    const { player } = useAuth();
    const homeConfig = useHomeConfig();
    const eggRollAngle = useSharedValue(30);
    const eggAnimatedStyles = useAnimatedStyle(() => ({
        transform: [{ rotate: `${eggRollAngle.value}deg` }],
    }));
    const [widgetConfig, setWidgetConfig] = useState<WidgetConfig[]>([]);

    useMemo(() => {
        if (isEmpty(widgetConfig) && homeConfig?.widgets) {
            setWidgetConfig(homeConfig.widgets);
        }
    }, [homeConfig, widgetConfig]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const otherSide = eggRollAngle.value < 0 ? 30 : -30;
            eggRollAngle.value = withSpring(otherSide, {
                duration: 2000, // 4 sec side to side,
                dampingRatio: 0.4,
                stiffness: 33,
                overshootClamping: false,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 15.58,
            });
        }, 2500);
        return () => clearInterval(intervalId);
    });

    // console.log('Home:widgi', widgetConfig);

    const saveWidgets = useCallback(
        (widgets: WidgetConfig[]) => {
            setWidgetConfig(widgets);
        },
        [setWidgetConfig],
    );

    const finalizeRenovation = () =>
        saveHomeConfig({
            playerId: player?.name || 'sampleusername',
            widgets: widgetConfig,
            proof: '!believeme!',
        });

    const HomeWidget = ({ id, title, path }: WidgetConfig) => {
        return (
            <WidgetIcon
                key={id}
                widgetId={id}
                text={title}
                to={path}
                height={50}
                width={50}
                icon={getIconForWidget(id)}
            />
        );
    };

    const onIntentionPress = async () => {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const startTime = oneDayAgo.toISOString(); // TODO last activity time
        const endTime = now.toISOString();
        await getActivityData({ startTime, endTime });
    };

    console.log('eggroll ', eggRollAngle.value);

    return (
        <View style={{ flex: 1, ...useTheme() }}>
            <View style={styles.container}>
                <View style={styles.avatarContainer}>
                    <Animated.View style={[styles.avatar, eggAnimatedStyles]}>
                        <AvatarViewer uri={homeConfig?.jinniImage} SVG={DefaultAvatar} />
                    </Animated.View>
                    <Button color="purple" title="Speak Intention" onPress={onIntentionPress} />
                </View>
                <WidgetContainer
                    widgets={widgetConfig}
                    WidgetRenderer={HomeWidget}
                    saveWidgets={saveWidgets}
                    finalizeRenovation={finalizeRenovation}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'skyblue',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    avatarContainer: {
        flex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        margin: '10%',
    },
    avatar: {
        marginTop: 200,
    },
});

export default HomeScreen;

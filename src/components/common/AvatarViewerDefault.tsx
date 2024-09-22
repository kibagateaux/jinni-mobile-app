import React, { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { AvatarViewer } from 'components/index';
import DefaultAvatar from 'assets/avatars/red-yellow-egg';

const AvatarViewerDefault = () => {
    const eggRollAngle = useSharedValue(30);
    const eggAnimatedStyles = useAnimatedStyle(() => ({
        transform: [{ rotate: `${eggRollAngle.value}deg` }],
    }));

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

    return (
        <Animated.View style={[eggAnimatedStyles]}>
            <AvatarViewer SVG={DefaultAvatar} />
        </Animated.View>
    );
};

export default AvatarViewerDefault;

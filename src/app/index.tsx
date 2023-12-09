import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { saveHomeConfig } from 'utils/config';

import { useHomeConfig } from 'hooks';
import { useTheme, useAuth } from 'contexts';
import { WidgetConfig } from 'types/UserConfig';
import { getIconForWidget } from 'utils/rendering';

import { AvatarViewer, WidgetIcon } from 'components/index';
import DefaultAvatar from 'assets/avatars/happy-ghost';
import WidgetContainer from 'components/home/WidgetContainer';
import { getActivityData } from 'utils/inventory/android-health-connect';

const HomeScreen = () => {
    const { user } = useAuth();
    const homeConfig = useHomeConfig();
    const [widgetConfig, setWidgetConfig] = useState<WidgetConfig[]>([]);

    useEffect(() => {
        if (homeConfig && homeConfig.widgets !== widgetConfig) {
            setWidgetConfig(homeConfig.widgets);
        }
    }, [homeConfig]);

    // console.log('Home:widgi', widgetConfig);

    const saveWidgets = (widgets: WidgetConfig[]) => {
        console.log(
            'changing config',
            widgets.map(({ id }) => id),
            widgetConfig.map(({ id }) => id),
        );

        setWidgetConfig(widgets);
    };
    const finalizeRenovation = () =>
        saveHomeConfig({
            username: user?.name || 'sampleusername',
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
        const startTime = oneDayAgo.toISOString();
        const endTime = now.toISOString();
        await getActivityData({ startTime, endTime });
    };
    return (
        <View style={{ flex: 1, ...useTheme() }}>
            <View style={styles.container}>
                <View style={styles.avatar}>
                    <AvatarViewer uri={homeConfig?.jinniImage} SVG={DefaultAvatar} />
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
    avatar: {
        flex: 10,
    },
});

export default HomeScreen;

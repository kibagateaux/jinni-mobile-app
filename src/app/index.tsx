import React, { useEffect, useContext, useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { saveHomeConfig } from 'utils/config';

import { useHomeConfig } from 'hooks';
import {
    default as ContextProvider,
    useTheme,
    useAuth
} from 'contexts';
import { HomeConfig, RenovatingWidgetConfig, WidgetConfig } from 'types/UserConfig';
import { getIconForWidget } from 'utils/rendering';

import { AvatarViewer, WidgetIcon, Link } from 'components/index';
import DefaultAvatar from 'assets/avatars/happy-ghost';
import WidgetContainer from 'components/home/WidgetContainer';


const HomeScreen = () => {
    const { user, login } = useAuth();
    const homeConfig = useHomeConfig();
    const [widgetConfig, setWidgetConfig] = useState<WidgetConfig[]>([]);

    useEffect(() => {
        if (homeConfig && homeConfig.widgets !== widgetConfig) {
            setWidgetConfig(homeConfig.widgets);
        }
    }, [homeConfig]);

    console.log('Home:widgi', widgetConfig);

    const saveWidgets = (widgets: WidgetConfig[]) => {
        console.log('changing config',widgets.map(({id}) => id) , widgetConfig.map(({id}) => id));
        
        setWidgetConfig(widgets)
    };
    const finalizeRenovation = () => saveHomeConfig({
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
        )
    }
    return (
        <View style={{ flex: 1, ...useTheme() }}>
            <View style={styles.container}>
                <View style={styles.avatar}>
                    <AvatarViewer
                        uri={homeConfig?.jinniImage}
                        SVG={DefaultAvatar}
                    />
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    flex: 10,
  },
});

export default HomeScreen;

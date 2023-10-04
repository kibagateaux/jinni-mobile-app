import React, { useEffect, useContext, useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { defaultWidgetConfig } from 'utils/config';

import { useHomeConfig } from 'hooks';
import {
    default as ContextProvider,
    useTheme,
    useAuth
} from 'contexts';
import { HomeConfig, WidgetConfig } from 'types/UserConfig';
import { getIconForWidget } from 'utils/rendering';

import { AvatarViewer, WidgetIcon, Link } from 'components/index';
import DefaultAvatar from 'assets/avatars/happy-ghost';



const HomeScreen = () => {
    const { user, login } = useAuth();
    const homeConfig = useHomeConfig();
    const [widgetConfig, setWidgetConfig] = useState<WidgetConfig[]>(defaultWidgetConfig);

    useEffect(() => {
        if (homeConfig) {
            homeConfig.widgets !== widgetConfig && setWidgetConfig(homeConfig.widgets || defaultWidgetConfig);
        }
    }, [homeConfig]);

    const handleLogin = () =>{
        // navigate to login screen
    }

    console.log('home config', user, homeConfig, widgetConfig);

    return (
        // <ContextProvider>
                <View style={{ flex: 1, ...useTheme() }}>
                    {/* <Slot /> */}
                <View style={styles.container}>
                    { !user && (
                            <View
                                // blur overlay on avatar until authenticated
                                style={{
                                    flex: 1,
                                    backgroundColor: 'white',
                                    // position: 'absolute',
                                    // top: '0',
                                    // right: '0',
                                    height: 'auto',
                                    width: 'auto',
                                    // zIndex: 10,
                                    
                                }}
                            >
                            <Link to="/auth/sign-in"  styleOverride={{ zIndex: 10 }}>
                                {/* <Button title="Login" /> */}
                                <Text>Login</Text>
                            </Link> 
                        </View>
                    )}
                    <View style={styles.avatar}>
                        <AvatarViewer
                            uri={homeConfig?.jinniImage}
                            SVG={DefaultAvatar}
                        />
                    </View>
                    <View style={styles.widgets}>
                        {widgetConfig.map((widget) => (
                            <WidgetIcon
                                key={widget.widgetId}
                                widgetId={widget.widgetId} 
                                text={widget.name}
                                to={widget.path}
                                height={50}
                                width={50}
                                icon={getIconForWidget(widget.widgetId)}
                            />
                        ))}
                    </View>
                </View>
                </View>
            // </ContextProvider>
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
  widgets: {
    position: 'absolute',
    right: 0,
    flexDirection: 'column',
  },
  tabs: {
    flex: 0.2,
    flexDirection: 'row',
  },
});

export default HomeScreen;

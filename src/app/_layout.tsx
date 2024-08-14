// add React Native NodeJS polyfills
import 'utils/polyfills';

import { Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import * as Sentry from '@sentry/react-native';

import { useHomeConfig } from 'hooks';
import { ContextProvider } from 'contexts';

import { WidgetConfig } from 'types/UserConfig';
import { getIconForWidget } from 'utils/rendering';

import * as serviceWorkerRegistration from 'utils/serviceWorkerRegistration';

const HomeLayout = () => {
    const { config: homeConfig } = useHomeConfig();
    const [tabConfig, setTabConfig] = useState<WidgetConfig[]>([]);

    useEffect(() => {
        if (homeConfig?.tabs && homeConfig.tabs !== tabConfig) {
            setTabConfig(homeConfig.tabs);
        }
    }, [homeConfig, tabConfig]);

    return (
        <ContextProvider>
            <Tabs
                screenOptions={{
                    headerShown: false,
                }}
            >
                {tabConfig.map((tab) => (
                    <Tabs.Screen
                        key={tab.title}
                        name={tab.routeName}
                        options={{
                            title: tab.title.toUpperCase(),
                            href: tab.path,
                            tabBarIcon: () => getIconForWidget(tab.id),
                        }}
                    />
                ))}
            </Tabs>
        </ContextProvider>
    );
};

if (Platform.OS === 'web') {
    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: https://cra.link/PWA
    serviceWorkerRegistration.register();
}

// https://docs.expo.dev/guides/using-sentry/
export default Sentry.wrap(HomeLayout);

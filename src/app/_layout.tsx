// add React Native NodeJS polyfills
import "utils/polyfills";

/**
 * Normal RN imports
*/
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import {  Slot, Stack, Tabs } from 'expo-router';

import { useHomeConfig } from 'hooks';
import { ContextProvider } from 'contexts';

import { WidgetConfig } from 'types/UserConfig';

const defaultTabConfig: WidgetConfig[] = [
    {
        name: 'index',
        widgetId: 'home',
        path: '/',
    },
    {
        name: 'inventory',
        widgetId: 'inventory',
        path: '/inventory',
    },
    {
        name: '/auth/sign-in',
        widgetId: 'sign-in',
        path: '/auth/sign-in',
        // path: null, // dont display login
    },
    // {
    //     name: 'incantations',
    //     widgetId: 'Incantations',
    //     path: '/incantations',
    // },
    // {
    //     name: 'quests',
    //     widgetId: 'Quests',
    //     path: '/quests',
    // },
    // {
    //     name: 'transmissions',
    //     widgetId: 'Transmissions',
    //     path: '/transmissions',
    // },
];

export default function HomeLayout() {
    const homeConfig = useHomeConfig();
    const [tabConfig, setTabConfig] = useState<WidgetConfig[]>(defaultTabConfig);

    useEffect(() => {
        if (homeConfig?.tabs && homeConfig.tabs !== tabConfig) {
            setTabConfig(homeConfig.tabs);
        }
    }, [homeConfig]);

    console.log("user tab config", tabConfig)
    return (
        <ContextProvider>
            <Tabs>
                    {tabConfig.map((tab) => (
                        <Tabs.Screen
                            key={tab.name}
                            name={tab.name}
                            options={{ title: tab.widgetId.toUpperCase(), href: tab.path }}
                        />
                    ))}
            </Tabs>
        </ContextProvider>
    );
}

// export default Stack;

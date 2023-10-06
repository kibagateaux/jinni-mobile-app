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

export default function HomeLayout() {
    const homeConfig = useHomeConfig();
    const [tabConfig, setTabConfig] = useState<WidgetConfig[]>([]);

    useEffect(() => {
        if (homeConfig?.tabs && homeConfig.tabs !== tabConfig) {
            setTabConfig(homeConfig.tabs);
        }
    }, [homeConfig]);

    // console.log("Home:tabs", tabConfig)
    return (
        <ContextProvider>
            <Tabs>
                {tabConfig.map((tab) => (
                    <Tabs.Screen
                        key={tab.title}
                        name={tab.title}
                        options={{ title: tab.id.toUpperCase(), href: tab.path }}
                    />
                ))}
            </Tabs>
        </ContextProvider>
    );
}

// export default Stack;

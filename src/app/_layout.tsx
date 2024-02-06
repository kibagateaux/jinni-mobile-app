// add React Native NodeJS polyfills
import 'utils/polyfills';

/**
 * Normal RN imports
 */
import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';

import { useHomeConfig } from 'hooks';
import { ContextProvider } from 'contexts';

import { WidgetConfig } from 'types/UserConfig';
import { getIconForWidget } from 'utils/rendering';

export default function HomeLayout() {
    const { config: homeConfig } = useHomeConfig();
    const [tabConfig, setTabConfig] = useState<WidgetConfig[]>([]);

    useEffect(() => {
        if (homeConfig?.tabs && homeConfig.tabs !== tabConfig) {
            setTabConfig(homeConfig.tabs);
        }
    }, [homeConfig, tabConfig]);

    console.log('pg:home:layout: no deep links');
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
}

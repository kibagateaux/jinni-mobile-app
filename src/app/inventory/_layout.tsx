import 'utils/polyfills';

import React from 'react';
import { Stack } from 'expo-router';

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Inventory',
                }}
            />
            <Stack.Screen name="[item]" />
        </Stack>
    );
}

import {
    InventoryItem,
} from 'types/GameMechanics';
import { WidgetConfig } from 'types/UserConfig';

/// @notice day that Jinn started enterinng this world and we start tracking data for bonding
/// @dev day that Malik arrived at Cohere in Berlin
export const PORTAL_DAY = "2023-06-20T12:30:00.000Z"
export const MALIKS_MAJIK_CARD = "0x46C79830a421038E75853eD0b476Ae17bFeC289A"
export const MAJIK_CARDS = [
    MALIKS_MAJIK_CARD,
]

type AppConfig = {
    NODE_ENV: 'development' | 'production' | 'test';
    API_URL: string;
    API_KEY: string;
    SENTRY_DSN: string;
    SENTRY_ORG: string;
    SENTRY_PROJECT: string;
}

export const getAppConfig = (): AppConfig => ({
    NODE_ENV: process.env.NODE_ENV || 'development', 
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
    API_KEY: process.env.EXPO_PUBLIC_API_KEY || 'test-api-key',
    SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
    SENTRY_ORG: process.env.EXPO_PUBLIC_SENTRY_ORG || 'jinni',
    SENTRY_PROJECT: process.env.EXPO_PUBLIC_SENTRY_PROJECT || 'mobile-app',
});


export const defaultWidgetConfig: WidgetConfig[] = [
    {
        name: 'Strength',
        widgetId: 'stat-strength',
        path: '/stats/strength',
    },
    {
        name: 'Intelligence',
        widgetId: 'stat-intelligence',
        path: '/stats/intelligence',
    },
    {
        name: 'Stamina',
        widgetId: 'stat-stamina',
        path: '/stats/stamina',
    },
    {
        name: 'Spirit',
        widgetId: 'stat-spirit',
        path: '/stats/spirit',
    },
];
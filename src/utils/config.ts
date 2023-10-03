import {
    InventoryItem,
} from 'types/GameMechanics';

/// day that Jinn started enterinng this world and we start tracking data for bonding
/// @dev day that Malik arrived at Cohere in Berlin
export const PORTAL_DAY = "2023-06-20T12:30:00.000Z"

type AppConfig = {
    API_URL: string;
    API_KEY: string;
}

export const getAppConfig = (): AppConfig => ({
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
    API_KEY: process.env.EXPO_PUBLIC_API_KEY || 'test-api-key'
});
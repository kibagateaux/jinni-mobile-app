import axios from 'axios';

import {
    InventoryItem,
} from 'types/GameMechanics';
import { HomeConfig, WidgetConfig } from 'types/UserConfig';
import { UpdateWidgetConfigParams } from 'types/api';

export const MALIKS_MAJIK_CARD = "0x46C79830a421038E75853eD0b476Ae17bFeC289A"
export const MAJIK_CARDS = [
    MALIKS_MAJIK_CARD,
]

type AppConfig = {
    NODE_ENV: 'development' | 'production' | 'test';
    API_URL: string;
    API_KEY: string;

    SENTRY_DSN: string | undefined;
    SENTRY_ORG: string | undefined;
    SENTRY_PROJECT: string | undefined;
    SEGMENT_API_KEY: string | undefined;
}

console.log("Config:env", process.env);

export const getAppConfig = (): AppConfig => ({
    NODE_ENV: process.env.NODE_ENV || 'development', 
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
    API_KEY: process.env.EXPO_PUBLIC_API_KEY || 'test-api-key',

    SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
    SENTRY_ORG: process.env.EXPO_PUBLIC_SENTRY_ORG || 'jinni',
    SENTRY_PROJECT: process.env.EXPO_PUBLIC_SENTRY_PROJECT || 'mobile-app',
    SEGMENT_API_KEY: process.env.EXPO_PUBLIC_SEGMENT_API_KEY || 'aaaaaaa',
});

export const getHomeConfig = async (username?: string): Promise<HomeConfig> => {
    if(!username) return defaultHomeConfig;
    return axios.get(`${getAppConfig().API_URL}/scry/${username}/home-config/`)
        .then(response => {
            // console.log("Home:config:get: SUCC", response)
            return response.data as HomeConfig;
        })
        .catch(error => {
            // console.error("Home:config:get: ERR ", error)
            return defaultHomeConfig;
        });
}


export const saveHomeConfig = async ({ username, widgets, proof }: UpdateWidgetConfigParams): Promise<HomeConfig> => {
    if(!username) return defaultHomeConfig;
    return axios.post(`${getAppConfig().API_URL}/scry/${username}/home-config/`, { widgets, proof })
        .then(response => {
            console.log("Home:config:save: SUCC", response)
            return response.data as HomeConfig;
        })
        .catch(error => {
            console.error("Home:config:save: ERR", error)
            return defaultHomeConfig;
        });
}


const defaultWidgetConfig: WidgetConfig[] = [
    {
        title: 'Strength',
        id: 'stat-strength',
        path: '/stats/strength',
    },
    {
        title: 'Intelligence',
        id: 'stat-intelligence',
        path: '/stats/intelligence',
    },
    {
        title: 'Stamina',
        id: 'stat-stamina',
        path: '/stats/stamina',
    },
    {
        title: 'Spirit',
        id: 'stat-spirit',
        path: '/stats/spirit',
    },
];


const defaultTabConfig: WidgetConfig[] = [
    {
        title: 'index',
        id: 'home',
        path: '/',
    },
    {
        title: 'inventory',
        id: 'inventory',
        path: '/inventory',
    },
    {
        title: 'tzolkin',
        id: 'tzolkin',
        path: '/tzolkin',
    },
    {
        title: '/auth',
        id: 'auth-main',
        path: '/auth',
        // path: null, // dont display login
    },
    // {
    //     title: 'incantations',
    //     id: 'Incantations',
    //     path: '/incantations',
    // },
    // {
    //     title: 'quests',
    //     id: 'Quests',
    //     path: '/quests',
    // },
    // {
    //     title: 'transmissions',
    //     id: 'Transmissions',
    //     path: '/transmissions',
    // },
];


const defaultHomeConfig: HomeConfig = {
    jinniImage: '',
    widgets: defaultWidgetConfig,
    tabs: defaultTabConfig
};
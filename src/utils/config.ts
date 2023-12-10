import AsyncStorage from '@react-native-async-storage/async-storage';
import { setItemAsync, getItemAsync } from 'expo-secure-store';

import axios from 'axios';
import { getNetworkStateAsync, NetworkState, NetworkStateType } from 'expo-network';
import { merge, concat } from 'lodash/fp';
import { isEmpty } from 'lodash';

import { CurrentConnection } from 'types/SpiritWorld';
import { HomeConfig, WidgetConfig } from 'types/UserConfig';
import { UpdateWidgetConfigParams } from 'types/api';
import { debug } from './logging';
import { ID_PLAYER_SLOT } from './zkpid';

// Storage slots for different config items
export const HOME_CONFIG_STORAGE_SLOT = 'home.widgets';

export const MALIKS_MAJIK_CARD = '0x46C79830a421038E75853eD0b476Ae17bFeC289A';
export const MAJIK_CARDS = [MALIKS_MAJIK_CARD];

type AppConfig = {
    NODE_ENV: 'development' | 'production' | 'test';
    API_URL: string;
    API_KEY: string;
    ETH_NETWORK: string;
    ETH_API_PROVIDER_URI: string;
    ETH_API_PROVIDER_API_KEY: string;

    SENTRY_DSN: string | undefined;
    SENTRY_ORG: string | undefined;
    SENTRY_PROJECT: string | undefined;
    SEGMENT_API_KEY: string | undefined;
};

// console.log('Config:env', process.env);

export const getAppConfig = (): AppConfig => ({
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
    API_KEY: process.env.EXPO_PUBLIC_API_KEY || 'test-api-key',

    ETH_NETWORK: process.env.EXPO_PUBLIC_ETH_NETWORK || 'optimism',
    ETH_API_PROVIDER_URI: process.env.EXPO_PUBLIC_ETH_API_PROVIDER_URI || 'test-api-key',
    ETH_API_PROVIDER_API_KEY: process.env.EXPO_PUBLIC_ETH_API_PROVIDER_API_KEY || 'test-api-key',

    SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
    SENTRY_ORG: process.env.EXPO_PUBLIC_SENTRY_ORG || 'jinni',
    SENTRY_PROJECT: process.env.EXPO_PUBLIC_SENTRY_PROJECT || 'mobile-app',
    SEGMENT_API_KEY: process.env.EXPO_PUBLIC_SEGMENT_API_KEY || 'aaaaaaa',
});

export const getHomeConfig = async (username?: string): Promise<HomeConfig> => {
    // await saveStorage<HomeConfig>(HOME_CONFIG_STORAGE_SLOT, '', false);
    const customConfig = await getStorage<HomeConfig>(HOME_CONFIG_STORAGE_SLOT);
    // console.log("custom config ", customConfig)
    // can only login from app so all changes MUST be saved locally if they exist on db
    if (!isEmpty(customConfig)) return customConfig!;
    // if not logged in then no reason to fetch custom config
    if (!username) return defaultHomeConfig;
    // if no internet connection, return default config
    if (!(await getNetworkState()).isNoosphere) return defaultHomeConfig;

    return axios
        .get(`${getAppConfig().API_URL}/scry/${username}/home-config/`)
        .then((response) => {
            AsyncStorage.setItem(HOME_CONFIG_STORAGE_SLOT, JSON.stringify(response.data));
            // console.log("Home:config:get: SUCC", response)
            return response.data as HomeConfig;
        })
        .catch((error) => {
            console.error('Home:config:get: ERR ', error);
            return defaultHomeConfig;
        });
};

export const saveHomeConfig = async ({
    username,
    widgets,
}: UpdateWidgetConfigParams): Promise<boolean> => {
    // save locally first
    const newHomeConfig = await saveStorage<HomeConfig>(
        HOME_CONFIG_STORAGE_SLOT,
        { widgets },
        true,
        defaultHomeConfig,
    );

    if (!username) return true;

    // TODO figure out how to stub NetworkState in testing so we can test api calls/logic paths properly
    // if (!(await getNetworkState()).isNoosphere) {
    //     return true;
    // }

    const proof = 'TODO'; // sign Mutation with user address for API verification
    return axios
        .post(`${getAppConfig().API_URL}/scry/${username}/home-config/`, {
            config: newHomeConfig,
            proof,
        })
        .then((response) => {
            console.log('Home:config:save: SUCC', response);
            return true;
        })
        .catch((error) => {
            console.error('Home:config:save: ERR', error);
            return false;
        });
};

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
    // {
    //     title: 'tzolkin',
    //     id: 'tzolkin',
    //     path: '/tzolkin',
    // },
    // {
    //     title: '/auth',
    //     id: 'auth-main',
    //     path: '/auth',
    //     // path: null, // dont display login
    // },
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

export const defaultHomeConfig: HomeConfig = {
    jinniImage: '',
    widgets: defaultWidgetConfig,
    tabs: defaultTabConfig,
};

export const noConnection = {
    type: NetworkStateType.NONE,
    isLocal: false,
    isNoosphere: false,
};

export const getNetworkState = async (): Promise<CurrentConnection> => {
    try {
        const info = await getNetworkStateAsync();
        // console.log('network state info', info);
        return parseNetworkState(info);
    } catch (e) {
        // console.log('Config:network:ERR', e);
        return noConnection;
    }
};

export const parseNetworkState = (networkState: NetworkState) => {
    const { type, isInternetReachable } = networkState;
    const isNoosphere = isInternetReachable ?? false;
    switch (type) {
        case NetworkStateType.WIFI:
            return {
                type,
                isLocal: true,
                isNoosphere,
            };
        case NetworkStateType.CELLULAR:
            return {
                type,
                isLocal: false,
                isNoosphere,
            };
        case NetworkStateType.BLUETOOTH:
            return {
                type,
                isLocal: true,
                isNoosphere,
            };
        case NetworkStateType.VPN:
            return {
                type,
                isLocal: false,
                isNoosphere,
            };
        default:
            return noConnection;
    }
};

export const getStorage: <T>(key: string, mysticCrypt?: boolean) => Promise<T | null> = async (
    key,
    mysticCrypt,
) => {
    try {
        const val = mysticCrypt ? await getItemAsync(key) : await AsyncStorage.getItem(key);
        return val ? JSON.parse(val) : null; // TODO add try/catch block on parse?
    } catch (e: unknown) {
        debug(e, {
            user: { id: (await getStorage(ID_PLAYER_SLOT)) ?? '' },
            tags: { storage: true },
            extra: { key },
        });
        return null;
    }
};
/**
 * @function
 * @name saveMysticCrypt
 * @description save to phones secure storage for recovery on lost phone/app deletion
 * @dev separate secure vs unsecure saving because we dont allow merging and more complex logic on secure stuff
 *      if you write, ensure that what you write is what will be stored
 *
 *
 */
export const saveMysticCrypt = async (key: string, value: string | object): Promise<boolean> => {
    try {
        await setItemAsync(key, JSON.stringify(value));
        return true;
    } catch (e: unknown) {
        debug(e, {
            user: { id: (await getStorage(ID_PLAYER_SLOT)) ?? '' },
            tags: { storage: true },
            extra: { key },
        });
        return false;
    }
};

/**
 * @dev can pass in type that you want to be saved in storage slot with saveStorage<MyType>
 *      shouldMerge only works on objects and arrays, not strings and numbers
 * @param key - storage key to write to
 * @param value  - new value to save
 * @param shouldMerge  - if should merge `value` into existing storage value
 * @param defaultVal - if merging, the default value to merge into if existing storage is isEmpty
 * @returns new item that can be found in storage
 */
export const saveStorage: <T>(
    key: string,
    value: string | number | object,
    shouldMerge?: boolean,
    defaultVal?: string | number | object,
) => Promise<T | null> = async (key, value, shouldMerge = false, defaultVal) => {
    const existingVal = await getStorage<unknown>(key);

    // do not merge if not requested or primitive types
    if (!shouldMerge || typeof value === 'string' || typeof value === 'number') {
        await AsyncStorage.setItem(key, JSON.stringify(value));
        return value;
    }

    try {
        if (shouldMerge) {
            console.log(
                'Config:saveStorage:shouldMerge?',
                Array.isArray(existingVal),
                Array.isArray(defaultVal) || defaultVal === undefined,
            );

            if (
                Array.isArray(value) &&
                (Array.isArray(existingVal) ||
                    Array.isArray(defaultVal) ||
                    defaultVal === undefined)
            ) {
                const newVal = existingVal
                    ? concat(existingVal, value)
                    : concat(defaultVal ?? [], value);
                console.log('Config:saveStorage:array', newVal);
                await AsyncStorage.setItem(key, JSON.stringify(newVal));
                return newVal;
            } else {
                // assume its an object. technically could be a function but thats an object too
                const newVal = existingVal
                    ? merge(existingVal, value)
                    : merge(defaultVal ?? {}, value);

                console.log('Config:saveStorage:object', newVal);
                await AsyncStorage.setItem(key, JSON.stringify(newVal));
                return newVal;
            }
        }
    } catch (e) {
        console.log('Failed to save locally k/v : ', key, value);
        return existingVal; // TODO return bool but this ensures that newVal conforms to dynamic type <T> after merge
    }
};

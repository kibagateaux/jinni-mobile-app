import AsyncStorage from '@react-native-async-storage/async-storage';
import { setItemAsync, getItemAsync } from 'expo-secure-store';

import axios from 'axios';
import { getNetworkStateAsync, NetworkState, NetworkStateType } from 'expo-network';
import { merge, concat } from 'lodash/fp';
import { capitalize, isEmpty, memoize } from 'lodash';

import { CurrentConnection } from 'types/SpiritWorld';
import {
    HomeConfig,
    WidgetConfig,
    LogDataQueryProps,
    StorageKey,
    StorageValue,
    WidgetIds,
} from 'types/UserConfig';
import { debug, track } from './logging';
import { ItemAbility, ItemIds } from 'types/GameMechanics';

// import { qu } from './api';

// Storage slots for different config items
export const HOME_CONFIG_STORAGE_SLOT = 'home.widgets';

export const MALIKS_MAJIK_CARD = '0x46C79830a421038E75853eD0b476Ae17bFeC289A';
export const MAJIK_CARDS = [MALIKS_MAJIK_CARD];

// cross provider analytics eventrs
export const TRACK_PERMS_REQUESTED = 'PERMISSIONS_REQUESTED';
export const TRACK_DATA_QUERIED = 'DATA_QUERIED';
export const TRACK_SHARE_CONTENT = 'SHARE_CONTENT';
export const TRACK_ONBOARDING_STAGE = 'ONBOARDING_STAGE';
export const STAGE_AVATAR_CONFIG = '0_ONBOARDING_STAGE_AVATAR_CONFIG';

// local + secure storage slots
export const LAST_QUERIED_SLOT = 'LAST_TIME_QUERIED';
export const ID_ANON_SLOT = '_anon_id';
export const ID_PLAYER_SLOT = '_address_id';
export const ID_PKEY_SLOT = '_private_key_uwu_';
export const ID_JINNI_SLOT = '_jinni_uuid';
export const ID_PROVIDER_IDS_SLOT = '_provider_ids';
export const ID_OAUTH_NONCE_SLOT = '_oauth_nonces';
export const PROOF_MALIKS_MAJIK_SLOT = 'MaliksMajik';

export const getCached = memoize(
    <T>({ slot, secure }: StorageKey) => getStorage<StorageValue & T>(slot, secure),
    JSON.stringify,
);

const updateCache = (key: StorageKey, val: StorageValue) =>
    getCached.cache.set(JSON.stringify(key), val);

/**
 * This is the description of the interface
 *
 * @interface AppConfig
 * @member {string} label is used for whatever reason
 * @field {string} prop is used for other reason
 * @member {string} NODE_ENV -
 * @member {string} API_URL - jinni api to call for functionality
 * @member {string} REDIRECT_URL - oauth redirect uri. Could be API_URL or other approved url
 * @member {string} ETH_NETWORK - which Ethereum network to use for attestations and contract interactions
 * @member {string} ETH_API_PROVIDER_URI - Ethereum RPC provider for Network
 * @member {string} ETH_API_PROVIDER_API_KEY - API key for RPC provider
 * @member {string} SENTRY_DSN - Sentry.io project id
 * @member {string} SENTRY_ORG - Sentry.io project id
 * @member {string} SENTRY_PROJECT - Sentry.io project id
 * @member {string} SEGMENT_API_KEY - Segment.io API key for sending analytics
 */
interface AppConfig {
    NODE_ENV: 'development' | 'production' | 'test';
    API_URL: string;
    REDIRECT_URL: string;

    ETH_NETWORK: string;
    ETH_API_PROVIDER_URI: string;
    ETH_API_PROVIDER_API_KEY: string;

    SENTRY_DSN: string | undefined;
    SENTRY_ORG: string | undefined;
    SENTRY_PROJECT: string | undefined;
    SEGMENT_API_KEY: string | undefined;
}

// console.log('Config:env', process.env);

export const getAppConfig = (): AppConfig => ({
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8888',
    REDIRECT_URL:
        process.env.EXPO_PUBLIC_REDIRECT_URL ||
        process.env.EXPO_PUBLIC_API_URL ||
        'http://localhost:8888',

    ETH_NETWORK: process.env.EXPO_PUBLIC_ETH_NETWORK || 'optimism',
    ETH_API_PROVIDER_URI: process.env.EXPO_PUBLIC_ETH_API_PROVIDER_URI || 'test-api-key',
    ETH_API_PROVIDER_API_KEY: process.env.EXPO_PUBLIC_ETH_API_PROVIDER_API_KEY || 'test-api-key',

    SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
    SENTRY_ORG: process.env.EXPO_PUBLIC_SENTRY_ORG || 'jinni',
    SENTRY_PROJECT: process.env.EXPO_PUBLIC_SENTRY_PROJECT || 'mobile-app',
    SEGMENT_API_KEY: process.env.EXPO_PUBLIC_SEGMENT_API_KEY || 'aaaaaaa',
});

// TODO deprecate for utils/api.getHomeConfig
export const getHomeConfig = async (username?: string): Promise<HomeConfig> => {
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

export const filterOutDefaultWidgets = (widgets: WidgetConfig[] | ItemAbility[]) =>
    widgets.filter(
        (w) => w.id !== 'maliksmajik-avatar-viewer' && w.id !== 'maliksmajik-speak-intention',
    );

export const itemAbilityToWidgetConfig = (
    provider: ItemIds,
    widgetId: WidgetIds,
): WidgetConfig => ({
    id: widgetId,
    provider,
    routeName: `/inventory/${provider}?widget=${widgetId}`,
    path: `/inventory/${provider}?widget=${widgetId}`,
    displayType: 'home', // TODO i think assuming widget not ability is right here but might need to refactor. Wdigrets are getting sloppy af
    title:
        widgetId.split('-').length === 1
            ? widgetId
            : widgetId.split('-').slice(1).map(capitalize).join(' '), // slice removes provider prefix from widget id
});

// causes circular dependency with inventory item
// const defaultWidgetConfig = maliksMajik.item.widgets?.map((w) =>
//     itemAbilityToWidgetConfig(w.provider, w.id as WidgetIds),
// );
const defaultWidgetConfig: WidgetConfig[] = [
    {
        id: 'stat-strength',
        provider: 'MaliksMajik',
        title: 'Strength',
        routeName: '/stats/strength',
        path: '/stats/strength',
        displayType: 'home',
    },
    {
        id: 'stat-intelligence',
        provider: 'MaliksMajik',
        title: 'Intelligence',
        routeName: '/stats/intelligence',
        path: '/stats/intelligence',
        displayType: 'home',
    },
    {
        id: 'stat-stamina',
        provider: 'MaliksMajik',
        title: 'Stamina',
        routeName: '/stats/stamina',
        path: '/stats/stamina',
        displayType: 'home',
    },
    {
        id: 'stat-spirit',
        provider: 'MaliksMajik',
        title: 'Spirit',
        routeName: '/stats/spirit',
        path: '/stats/spirit',
        displayType: 'home',
    },
];

const defaultTabConfig: WidgetConfig[] = [
    {
        id: 'home',
        provider: 'MaliksMajik',
        routeName: 'index',
        title: 'Home',
        path: '/',
        displayType: 'nav',
    },
    {
        id: 'inventory',
        provider: 'MaliksMajik',
        routeName: 'inventory',
        title: 'inventory',
        path: '/inventory',
        displayType: 'nav',
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

export const getStorage: <T>(slot: string, useMysticCrypt?: boolean) => Promise<T | null> = async (
    slot,
    useMysticCrypt,
) => {
    try {
        if (!slot) return null;
        const cached = await getCached.cache.get(JSON.stringify({ slot, secure: useMysticCrypt }));
        console.log(
            'get storage 1 - {slot, useCrypt} + cached',
            JSON.stringify({ slot, secure: useMysticCrypt }),
            cached,
        );
        if (cached) return cached;
        const val = useMysticCrypt
            ? await getItemAsync(slot, { requireAuthentication: !__DEV__ })
            : await AsyncStorage.getItem(slot);

        console.log('get storage 2 - slot + val', slot, val);
        return val ? JSON.parse(val) : null;
    } catch (e: unknown) {
        debug(e, {
            tags: { storage: true },
            extra: { slot },
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
 * @retuns bool if value saved or not
 */
export const saveMysticCrypt = async (key: string, value: StorageValue): Promise<boolean> => {
    try {
        console.log('Store:MystCrypt: ', key, value);
        await setItemAsync(key, JSON.stringify(value), { requireAuthentication: true });
        updateCache({ slot: key, secure: true }, value);
        return true;
    } catch (e: unknown) {
        console.log('Store:MystCrypt:ERROR', key, e);
        debug(e, {
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
    value: StorageValue,
    shouldMerge?: boolean,
    defaultVal?: StorageValue,
) => Promise<T | null> = async (key, value, shouldMerge = false, defaultVal) => {
    // console.log('save store', key, value, shouldMerge);
    // eslint-ignore-next-line
    const existingVal = await getStorage<StorageValue>(key);

    // do not merge if not requested or primitive types
    if (!shouldMerge || typeof value === 'string' || typeof value === 'number') {
        await AsyncStorage.setItem(key, JSON.stringify(value));
        updateCache({ slot: key }, value);
        return value;
    }

    try {
        if (shouldMerge) {
            console.log(
                'Config:saveStorage:shouldMerge isArray?',
                Array.isArray(existingVal),
                Array.isArray(defaultVal) || defaultVal === undefined,
            );

            if (
                Array.isArray(value) && // check saved type
                (Array.isArray(existingVal) || // ensure merging vals are same type
                    Array.isArray(defaultVal) ||
                    defaultVal === undefined)
            ) {
                const newVal = existingVal
                    ? concat(existingVal, value)
                    : concat(defaultVal ?? [], value);
                await AsyncStorage.setItem(key, JSON.stringify(newVal));
                updateCache({ slot: key }, value);
                return newVal;
            } else {
                console.log(
                    'Config:saveStorage:shouldMerge isObj?',
                    existingVal ? merge(existingVal, value) : merge(defaultVal ?? {}, value),
                );
                // assume its an object. technically could be a function but thats an object too
                const newVal = existingVal
                    ? merge(existingVal, value)
                    : merge(defaultVal ?? {}, value);

                await AsyncStorage.setItem(key, JSON.stringify(newVal));
                updateCache({ slot: key }, value);
                return newVal;
            }
        }
    } catch (e) {
        console.log('Failed to save locally k/v : ', key, value);
        return existingVal; // TODO return bool but this ensures that newVal conforms to dynamic type <T> after merge
    }
};

export const logLastDataQuery = ({
    itemId,
    activities,
    time,
}: LogDataQueryProps): Promise<boolean> => {
    const ts = time ? time : new Date().toISOString();
    const acts = activities.reduce((agg, act) => ({ ...agg, [act]: ts }), {});
    // .any bc local storage will always be first, want to ensure it succeeds, but not block thread with await
    return Promise.any([
        saveStorage<object>(`${LAST_QUERIED_SLOT}_${itemId}`, acts, true),
        track(TRACK_DATA_QUERIED, {
            itemId,
            activities: acts,
        }),
    ])
        .then((success) => success)
        .catch((errs) =>
            errs.map(async (err: unknown) =>
                debug(err, {
                    tags: { analytics: true },
                }),
            ),
        );
};

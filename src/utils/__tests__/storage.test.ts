import { NetworkStateType } from 'expo-network';
import * as mockMysticCrypt from 'expo-secure-store';
import mockAsyncStorage from '@react-native-async-storage/async-storage';
import {
    getCached,
    getStorage,
    saveStorage,
    saveMysticCrypt,
    HOME_CONFIG_STORAGE_SLOT,
    getNetworkState,
    parseNetworkState,
    noConnection,
    logLastDataQuery,
    LAST_QUERIED_SLOT,
} from 'utils/config';

import { getHomeConfig } from 'utils/api';
import { ItemCollectionLog } from 'types/GameData';

jest.mock('expo-secure-store');

const weirdHomeConfig = {
    jinniImage: 'ipfs://QmHEeHOo',
    widgets: [{ title: 'Fake Widgy', id: 'fake-widgy' }],
    tabs: [{ title: 'Fake Tab', id: 'fake-tab' }],
};

beforeEach(() => {
    mockAsyncStorage.getItem.mockClear();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockMysticCrypt.getItemAsync.mockClear();
    mockMysticCrypt.getItemAsync.mockResolvedValue(null);
    getCached.cache.set(JSON.stringify({ slot: 'test' }), null);
    getCached.cache.set(JSON.stringify({ slot: 'test', secure: true }), null);
    getCached.cache.set(JSON.stringify({ slot: 'test', secure: false }), null);
});

// failing tests are because of mcoking getStorage but it hits the cache
// create test that mockStorage will cause cahce to be out of sync
// + update tests to set cache instead of mock storage (acutally reduces external dependencies on native systems so good thing

// TODO add .ios and .android to file name. Create storage.test.web.ts, copy tests, and check against cookies not local storage
describe('Storage caching', () => {
    it('returns null for non-existent cache entries', async () => {
        expect(await getCached({ slot: 'nonexistent' })).toBe(null);
    });

    it('updates cache on local storage save', async () => {
        expect(await getCached({ slot: 'test' })).toEqual(null);
        await saveStorage('test', 'cacheVal');
        expect(await getCached({ slot: 'test' })).toEqual('cacheVal');
    });

    it('updates cache on secure storage save', async () => {
        expect(await getCached({ slot: 'test', secure: true })).toEqual(null);
        await saveMysticCrypt('test', 'cacheVal');
        expect(await getCached({ slot: 'test', secure: true })).toEqual('cacheVal');
    });

    it('cache equals local storage', async () => {
        expect(await getCached({ slot: 'test' })).toEqual(null);
        await saveStorage('test', 'cacheVal');
        mockAsyncStorage.getItem.mockResolvedValueOnce('cacheVal');
        expect(await getCached({ slot: 'test' })).toEqual(await getStorage('test'));
    });

    it('cache equals secure storage', async () => {
        expect(await getCached({ slot: 'test', secure: true })).toEqual(null);
        await saveMysticCrypt('test', 'cacheVal');
        mockMysticCrypt.getItemAsync.mockResolvedValueOnce('cacheVal');
        expect(await getCached({ slot: 'test', secure: true })).toEqual(
            await getStorage('test', true),
        );
    });

    it('secure = false vs undefined are different cache keys', async () => {
        expect(await getCached({ slot: 'test' })).toEqual(null);
        await saveStorage('test', 'cacheVal');
        expect(await getCached({ slot: 'test' })).toEqual('cacheVal');
        expect(await getCached({ slot: 'test', secure: false })).toEqual(null);
    });

    it('differentiates between secure and non-secure cache entries', async () => {
        getCached.cache.set(JSON.stringify({ slot: 'test', secure: true }), 'secureValue');
        getCached.cache.set(JSON.stringify({ slot: 'test', secure: false }), 'nonSecureValue');
        expect(await getCached({ slot: 'test', secure: true })).toBe('secureValue');
        expect(await getCached({ slot: 'test', secure: false })).toBe('nonSecureValue');
    });
});

describe('Offline first functionality', () => {
    describe('Retrieving player config', () => {
        beforeEach(async () => {
            await saveStorage(HOME_CONFIG_STORAGE_SLOT, '');
        });

        it('returns default if not logged in', () => {
            return getHomeConfig().then((config) => {
                expect(config).toStrictEqual({});
            });
        });

        it('returns default if no internet connection', async () => {
            // TODO idk how to stub no network connection
            expect(await getNetworkState()).toEqual(noConnection);
            return getHomeConfig().then((config) => {
                expect(config).toEqual({});
            });
        });

        it('returns default if no player logged in', async () => {
            await saveStorage(HOME_CONFIG_STORAGE_SLOT, weirdHomeConfig);
            expect(await getHomeConfig()).toEqual({});
        });

        it('returns local custom config if stored with player registered', async () => {
            await saveStorage(HOME_CONFIG_STORAGE_SLOT, weirdHomeConfig);
            expect(await getHomeConfig('myplayer')).toEqual(weirdHomeConfig);
        });

        it('returns remote config if logged in and no local save', async () => {
            // Should be impossible scenario. If sent to api then saved locally already
            // TODO stub API call. Figure out how to do that
            // const mock = jest.spyOn(api, "get");
            // mock.mockImplementation(() => Promise.resolve({ data: {} }));
            // expect(await getHomeConfig('myuser')).toEqual(weirdHomeConfig);
        });

        it('retrieving remote config replaces local save', async () => {
            console.log('Network STate in test', await getNetworkState());
            // TODO should be impossible scenario. If sent to api then saved already
        });
    });

    describe('Transmuting network state config to game settings', () => {
        it('returns default if no internet connection', async () => {
            expect(
                parseNetworkState({
                    type: NetworkStateType.NONE,
                    isConnected: false,
                    isInternetReachable: false,
                }),
            ).toEqual(noConnection);
        });

        it('WIFI and BLUETOOTH are local networks', async () => {
            const local = [NetworkStateType.WIFI, NetworkStateType.BLUETOOTH];
            local.map((type) =>
                expect(
                    parseNetworkState({
                        type,
                        isConnected: false,
                        isInternetReachable: false,
                    }),
                ).toEqual({ type, isLocal: true, isNoosphere: false }),
            );
        });
        it('CELLULAR and VPN are non-local networks', async () => {
            const local = [NetworkStateType.VPN, NetworkStateType.CELLULAR];
            local.map((type) =>
                expect(
                    parseNetworkState({
                        type,
                        isConnected: false,
                        isInternetReachable: false,
                    }),
                ).toEqual({ type, isLocal: false, isNoosphere: false }),
            );
        });
    });

    describe('Local storage utility functions', () => {
        describe('getStorage', () => {
            it('allows retrieving any key from storage', async () => {
                expect(await getStorage('test')).toEqual(null);
                expect(await saveStorage('test2', 'test2')).toEqual('test2');
                expect(await getStorage('test2')).toEqual('test2');
            });

            it('parses json from storage automatically', async () => {
                expect(await saveStorage('test', ['test'])).toEqual(['test']);
                expect(await getStorage('test')).toEqual(['test']);
            });

            it('returns null for empty slot', async () => {
                expect(await getStorage('')).toBe(null);
            });

            it('returns cached value if available', async () => {
                getCached.cache.set(JSON.stringify({ slot: 'cachedSlot' }), 'cachedValue');
                expect(await getStorage('cachedSlot')).toBe('cachedValue');
            });

            it('retrieves value from AsyncStorage for non-secure storage on mobile', async () => {
                mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify('mobileValue'));
                expect(await getStorage('mobileSlot')).toBe('mobileValue');
            });

            it('retrieves value from expo-secure-store for secure storage on mobile', async () => {
                mockMysticCrypt.getItemAsync.mockResolvedValueOnce(JSON.stringify('secureValue'));
                // mockMysticCrypt.getItemAsync.mockResolvedValueOnce('secureValue');
                await saveMysticCrypt('secureSlot', 'secureValue');
                expect(await getStorage('secureSlot', true)).toBe('secureValue');
            });
        });

        describe('save storage', () => {
            beforeEach(async () => {
                await saveStorage('test', '');
            });

            it('stringifies objects and arrays to storage', async () => {
                expect(await getStorage('test')).toEqual(null);
                expect(await saveStorage('test', 'test')).toEqual('test');
            });

            it('saves to local storage', async () => {
                expect(await getStorage('test')).toEqual(null);
                expect(await saveStorage('test', 'test')).toEqual('test');
            });

            it('can save to different keys in storage', async () => {
                await Promise.all([saveStorage('test', 'test'), saveStorage('test2', 'test2')]);
                expect(await getStorage('test')).toEqual('test');
                expect(await getStorage('test2')).toEqual('test2');
            });

            it('overwrite primitive types even if merge requested', async () => {
                expect(await saveStorage('test', 'test')).toEqual('test');
                expect(await saveStorage('test', 'test2', true)).toEqual('test2');

                expect(await saveStorage('test', 1)).toEqual(1);
                expect(await saveStorage('test', 2, true)).toEqual(2);
            });

            it('merges arrays if one exists already', async () => {
                expect(await saveStorage('test', ['test'])).toEqual(['test']);
                expect(await saveStorage('test', ['test2'], true)).toEqual(['test', 'test2']);
            });

            it('merges existing array if one exists already even if default value passed in', async () => {
                expect(await saveStorage('test', ['test'])).toEqual(['test']);
                expect(await saveStorage('test', ['test2'], true, ['badtest'])).toEqual([
                    'test',
                    'test2',
                ]);
            });

            it('uses defaultVal when merging with empty existing value', async () => {
                expect(await saveStorage('defaultKey', ['new'], true, ['default'])).toEqual([
                    'default',
                    'new',
                ]);
            });

            it('overwrites existing array value if requested', async () => {
                expect(await saveStorage('test', ['test'])).toEqual(['test']);
                expect(await saveStorage('test', ['test2'], false, ['badtest'])).toEqual(['test2']);
            });

            it('overwrites object if not merging', async () => {
                expect(await saveStorage('test', { test: 1 })).toEqual({ test: 1 });
                expect(await saveStorage('test', { test2: 1 })).toEqual({ test2: 1 });
            });

            it('merges objects if one exists already', async () => {
                expect(await saveStorage('test', { test: 1 })).toEqual({ test: 1 });
                expect(await saveStorage('test', { test2: 1 }, true)).toEqual({
                    test: 1,
                    test2: 1,
                });
            });

            it('merges existing object if one exists already even if default value passed in', async () => {
                expect(await saveStorage('test', { test: 1 })).toEqual({ test: 1 });
                expect(await saveStorage('test', { test2: 1 }, true, { badtest: 1 })).toEqual({
                    test: 1,
                    test2: 1,
                });
            });

            it('overwrites existing object if one exists already even if default value passed in', async () => {
                expect(await saveStorage('test', { test: 1 })).toEqual({ test: 1 });
                expect(await saveStorage('test', { test2: 1 }, false, { badtest: 1 })).toEqual({
                    test2: 1,
                });
            });

            it('handles errors during save operation', async () => {
                // mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Save failed'));
                console.log = jest.fn();
                await saveStorage(']*', '{[{[]}]}');
                expect(await getStorage(']*')).toEqual('{[{[]}]}');
            });
        });
    });

    describe('Secure cloud storage functionality', () => {
        // TODO mockResolvedValue isnt returning value submitted but def being called

        describe('Reading from secure storage', () => {
            it('getStorage querys mystic crypt if requested', async () => {
                await getStorage('test', true);
                expect(mockAsyncStorage.getItem).toBeCalledTimes(0);
                expect(mockMysticCrypt.getItemAsync).toBeCalledTimes(1);
                expect(mockMysticCrypt.getItemAsync).toBeCalledWith('test', {
                    requireAuthentication: false,
                }); // require auth is false onlyin dev
            });

            it('returns proper value', async () => {
                await saveMysticCrypt('test', 'test');
                mockMysticCrypt.getItemAsync.mockResolvedValueOnce('test');
                expect(await getStorage('test', true)).toEqual('test');
            });
        });
    });
});

describe('Saving to secure storage', () => {
    it('returns success bool on save because no merging so deterministic value', async () => {
        expect(await saveMysticCrypt('test', ['test'])).toEqual(true);
    });

    it('does not write to local storage', async () => {
        mockAsyncStorage.getItem.mockResolvedValueOnce(null);
        expect(await saveMysticCrypt('test', ['test'])).toEqual(true);
        mockMysticCrypt.getItemAsync.mockResolvedValueOnce("['test']");
        expect(await getStorage('test')).toEqual(null);
    });

    it('using mystic crypt properly writes to secure storage', async () => {
        expect(await saveMysticCrypt('test', ['test'])).toEqual(true);
        mockMysticCrypt.getItemAsync.mockResolvedValueOnce("['test']");
        expect(await getStorage('test', true)).toEqual(['test']);
    });

    it('cannot merge existing items on save', async () => {
        expect(await saveMysticCrypt('test', ['test'])).toEqual(true);
        mockMysticCrypt.getItemAsync.mockResolvedValueOnce("['test']");
        expect(await getStorage('test', true)).toEqual(['test']);

        expect(await saveMysticCrypt('test', ['test2'])).toEqual(true);
        mockMysticCrypt.getItemAsync.mockResolvedValueOnce("['test2']");
        expect(await getStorage('test', true)).toEqual(['test2']);
    });

    it('can save different values on same key to secure storage and local storage', async () => {
        expect(await saveStorage('test', ['test'])).toEqual(['test']);
        expect(await saveMysticCrypt('test', 'test2')).toEqual(true);
        expect(await getStorage('test')).toEqual(['test']);
        mockMysticCrypt.getItemAsync.mockResolvedValueOnce('test2');
        expect(await getStorage('test', true)).toEqual('test2');
    });
});

describe('logLastDataQuery', () => {
    beforeEach(async () => {
        jest.useFakeTimers().setSystemTime(new Date('2023-01-01T12:00:00Z'));
        await saveStorage<ItemCollectionLog>(LAST_QUERIED_SLOT, {}, false);
    });

    it('returned all providers lastQueried storage value', async () => {
        const result = await logLastDataQuery({
            itemId: 'testItem',
            playerId: 'test',
            activities: ['act1', 'act2'],
            time: '2023-01-01T00:00:00Z',
        });

        expect(result).toStrictEqual({
            testItem: '2023-01-01T00:00:00Z',
        });

        console.log('result ', result);

        const result2 = await logLastDataQuery({
            itemId: 'testItem2',
            playerId: 'test2',
            activities: ['act1', 'act2'],
            time: '2023-01-01T00:00:00Z',
        });

        expect(result2).toStrictEqual({
            testItem: '2023-01-01T00:00:00Z',
            testItem2: '2023-01-01T00:00:00Z',
        });

        const updated = await getStorage<ItemCollectionLog>(LAST_QUERIED_SLOT);
        expect(updated).toStrictEqual({
            testItem: '2023-01-01T00:00:00Z',
            testItem2: '2023-01-01T00:00:00Z',
        });
        expect(updated!['testItem']).toStrictEqual('2023-01-01T00:00:00Z');
        expect(updated!['testItem2']).toStrictEqual('2023-01-01T00:00:00Z');
    });

    it('saves query data and returns true on success', async () => {
        const result = await logLastDataQuery({
            itemId: 'testItem',
            playerId: 'test',
            activities: ['act1', 'act2'],
            time: '2023-01-01T00:00:00Z',
        });

        expect(result).toStrictEqual({
            testItem: '2023-01-01T00:00:00Z',
        });
        expect((await getStorage<ItemCollectionLog>(LAST_QUERIED_SLOT))!['testItem']).toStrictEqual(
            '2023-01-01T00:00:00Z',
        );
    });

    it('uses current time if not provided', async () => {
        const result = await logLastDataQuery({
            itemId: 'testItem2',
            playerId: 'test',
            activities: ['act3'],
        });

        expect(result).toStrictEqual({
            testItem2: '2023-01-01T12:00:00.000Z',
        });
        expect(
            (await getStorage<ItemCollectionLog>(LAST_QUERIED_SLOT))!['testItem2'],
        ).toStrictEqual('2023-01-01T12:00:00.000Z');
    });

    it('merges new activities with existing ones', async () => {
        await saveStorage<ItemCollectionLog>(
            LAST_QUERIED_SLOT,
            { existingAct: '2023-01-01T00:00:00Z' },
            false,
        );
        await logLastDataQuery({
            itemId: 'mergeItem',
            playerId: 'test',
            activities: ['newAct'],
            time: '2023-01-02T00:00:00Z',
        });

        const updated = await getStorage<ItemCollectionLog>(LAST_QUERIED_SLOT);

        expect(updated!['mergeItem']).toStrictEqual('2023-01-02T00:00:00Z');
        expect(updated).toStrictEqual({
            existingAct: '2023-01-01T00:00:00Z',
            mergeItem: '2023-01-02T00:00:00Z',
        });
    });

    it('handles errors and logs them', async () => {
        mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Save failed'));
        console.log = jest.fn();
        await logLastDataQuery({
            itemId: 'errorItem',
            playerId: 'test',
            activities: ['errorAct'],
        });
        expect(console.log).toHaveBeenCalledWith('storage:save:err: ', expect.any(Error));
    });
});

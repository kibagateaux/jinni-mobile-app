import { NetworkStateType } from 'expo-network';
import {
    getHomeConfig,
    getStorage,
    saveStorage,
    defaultHomeConfig,
    HOME_CONFIG_STORAGE_SLOT,
    getNetworkState,
    parseNetworkState,
    noConnection,
} from 'utils/config';

const weirdConfig = {
    jinniImage: 'ipfs://QmHEeHOo',
    widgets: [{ title: 'Fake Widgy', id: 'fake-widgy' }],
    tabs: [{ title: 'Fake Tab', id: 'fake-tab' }],
};

describe('Offline first functionality', () => {
    describe('Retrieving player config', () => {
        beforeEach(async () => {
            await saveStorage(HOME_CONFIG_STORAGE_SLOT, '');
        });

        test('returns default if not logged in', () => {
            return getHomeConfig().then((config) => {
                expect(config).toEqual(defaultHomeConfig);
            });
        });

        test('returns default if no internet connection', async () => {
            // TODO idk how to stub no network connection
            expect(await getNetworkState()).toEqual(noConnection);
            return getHomeConfig().then((config) => {
                expect(config).toEqual(defaultHomeConfig);
            });
        });

        test('returns local custom config if stored', async () => {
            await saveStorage(HOME_CONFIG_STORAGE_SLOT, weirdConfig);
            expect(await getHomeConfig()).toEqual(weirdConfig);
        });

        test('returns remote config if logged in and no local save', async () => {
            // Should be impossible scenario. If sent to api then saved locally already
            // TODO stub API call. Figure out how to do that
            expect(await getHomeConfig('myuser')).toEqual(weirdConfig);
        });

        test('retrieving remote config replaces local save', async () => {
            console.log('Network STate in test', await getNetworkState());
            // TODO should be impossible scenario. If sent to api then saved already
        });
    });

    describe('Transmuting network state config to game settings', () => {
        test('returns default if no internet connection', async () => {
            expect(
                parseNetworkState({
                    type: NetworkStateType.NONE,
                    isConnected: false,
                    isInternetReachable: false,
                }),
            ).toEqual(noConnection);
        });

        test('WIFI and BLUETOOTH are local networks', async () => {
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
        test('CELLULAR and VPN are non-local networks', async () => {
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
        describe('get storage', () => {
            beforeEach(async () => {
                await saveStorage('test', '');
            });

            test('allows retrieving any key from storage', async () => {
                expect(await getStorage('test')).toEqual('');
                expect(await saveStorage('test2', 'test2')).toEqual('test2');
            });

            test('parses json from storage automatically', async () => {
                expect(await saveStorage('test', ['test'])).toEqual(['test']);
                expect(await getStorage('test')).toEqual(['test']); // we dont have to call JSON.parse(getStorage('test')'))
            });
        });

        describe('save storage', () => {
            beforeEach(async () => {
                await saveStorage('test', '');
            });

            test('stringifies objects and arrays to storage', async () => {
                expect(await getStorage('test')).toEqual('');
                expect(await saveStorage('test', 'test')).toEqual('test');
            });

            test('saves to local storage', async () => {
                expect(await getStorage('test')).toEqual('');
                expect(await saveStorage('test', 'test')).toEqual('test');
            });

            test('can save to different keys in storage', async () => {
                await Promise.all([saveStorage('test', 'test'), saveStorage('test2', 'test2')]);
                expect(await getStorage('test')).toEqual('test');
                expect(await getStorage('test2')).toEqual('test2');
            });

            test('overwrite primitive types even if merge requested', async () => {
                expect(await saveStorage('test', 'test')).toEqual('test');
                expect(await saveStorage('test', 'test2', true)).toEqual('test2');

                expect(await saveStorage('test', 1)).toEqual(1);
                expect(await saveStorage('test', 2, true)).toEqual(2);
            });

            test('merges arrays if one exists already', async () => {
                expect(await saveStorage('test', ['test'])).toEqual(['test']);
                expect(await saveStorage('test', ['test2'], true)).toEqual(['test', 'test2']);
            });

            test('merges existing array if one exists already even if default value passed in', async () => {
                expect(await saveStorage('test', ['test'])).toEqual(['test']);
                expect(await saveStorage('test', ['test2'], true, ['badtest'])).toEqual([
                    'test',
                    'test2',
                ]);
            });

            test('overwrites existing array value if requested', async () => {
                expect(await saveStorage('test', ['test'])).toEqual(['test']);
                expect(await saveStorage('test', ['test2'], false, ['badtest'])).toEqual(['test2']);
            });

            test('overwrites object if not merging', async () => {
                expect(await saveStorage('test', { test: 1 })).toEqual({ test: 1 });
                expect(await saveStorage('test', { test2: 1 })).toEqual({ test2: 1 });
            });

            test('merges objects if one exists already', async () => {
                expect(await saveStorage('test', { test: 1 })).toEqual({ test: 1 });
                expect(await saveStorage('test', { test2: 1 }, true)).toEqual({
                    test: 1,
                    test2: 1,
                });
            });

            test('merges existing object if one exists already even if default value passed in', async () => {
                expect(await saveStorage('test', { test: 1 })).toEqual({ test: 1 });
                expect(await saveStorage('test', { test2: 1 }, true, { badtest: 1 })).toEqual({
                    test: 1,
                    test2: 1,
                });
            });

            test('overwrites existing object if one exists already even if default value passed in', async () => {
                expect(await saveStorage('test', { test: 1 })).toEqual({ test: 1 });
                expect(await saveStorage('test', { test2: 1 }, false, { badtest: 1 })).toEqual({
                    test2: 1,
                });
            });
        });
    });
});

import {
    // getHomeConfig,
    getCached,
    // getStorage,
    // saveStorage,
    // defaultHomeConfig,
    // HOME_CONFIG_STORAGE_SLOT,
    // getCookie,
} from 'utils/config';

// const weirdHomeConfig = {
//     jinniImage: 'ipfs://QmHEeHOo',
//     widgets: [{ title: 'Fake Widgy', id: 'fake-widgy' }],
//     tabs: [{ title: 'Fake Tab', id: 'fake-tab' }],
// };

beforeEach(() => {
    getCached.cache.set(JSON.stringify({ slot: 'test' }), null);
    getCached.cache.set(JSON.stringify({ slot: 'test', secure: true }), null);
    getCached.cache.set(JSON.stringify({ slot: 'test', secure: false }), null);
});

// failing tests are because of mcoking getStorage but it hits the cache
// create test that mockStorage will cause cahce to be out of sync
// + update tests to set cache instead of mock storage (acutally reduces external dependencies on native systems so good thing

describe('Storage caching', () => {
    describe('Web local first functionality', () => {
        describe('uses cookies instead of local storage', () => {});

        describe('saves value to correct slot in cookies', () => {});

        describe('access correct cookie for slot requested', () => {});

        describe('getStorage matches getCookie', () => {});
    });
});

import { getCookie, getStorage, saveStorage } from 'utils/config';
import mockAsyncStorage from '@react-native-async-storage/async-storage';

// mock document.cookie so saveStorage can set values for testing properly
Object.defineProperty(document, 'cookie', {
    writable: true,
    value: '',
});

beforeEach(() => {
    // getCached.cache.set(JSON.stringify({ slot: 'test' }), null);
    // getCached.cache.set(JSON.stringify({ slot: 'test', secure: true }), null);
    // getCached.cache.set(JSON.stringify({ slot: 'test', secure: false }), null);
});

// failing tests are because of mcoking getStorage but it hits the cache
// create test that mockStorage will cause cahce to be out of sync
// + update tests to set cache instead of mock storage (acutally reduces external dependencies on native systems so good thing

describe('Storage caching', () => {
    const expirationDate = new Date(2100, 0, 1).toUTCString();
    const valueMetadata = `;expires=${expirationDate};path=/;secure;samesite=strict`;

    beforeEach(() => {
        document.cookie = '';
    });

    describe('local first functionality', () => {
        describe('saveStorage = setCookie', () => {
            it('uses secure, immutable cookies', async () => {
                await saveStorage('test_slot_1', 'true');
                // check raw cookie val
                expect(document.cookie).toEqual('test_slot_1="true"' + valueMetadata);
            });

            it('uses cookies instead of local storage', async () => {
                await saveStorage('test_slot_1', 'true');
                const localStorage = await mockAsyncStorage.getItem('test_slot_1');
                expect(localStorage).toEqual(null);
                expect(JSON.parse(getCookie('test_slot_1')!)).toEqual('true');
                expect(document.cookie).toEqual('test_slot_1="true"' + valueMetadata);
            });

            it('saves object as stringified value to cookie', async () => {
                const testObj = { key: 'value' };
                await saveStorage('testObjSlot', testObj);
                expect(JSON.parse(getCookie('testObjSlot')!)).toEqual(testObj);
            });

            it('overwrites existing cookie value', async () => {
                await saveStorage('overwriteSlot', 'initialValue');
                await saveStorage('overwriteSlot', 'newValue');
                expect(JSON.parse(getCookie('overwriteSlot')!)).toEqual('newValue');
            });
        });

        describe('getCookie', () => {
            it('getCookie raw JSON value still', async () => {
                await saveStorage('overwriteSlot', 'newValue');
                expect(getCookie('overwriteSlot')).toEqual('"newValue"');
                expect(JSON.parse(getCookie('overwriteSlot')!)).toEqual('newValue');
            });

            it('retrieves correct cookie value correct slot', async () => {
                document.cookie = 'testCookie=testValue';
                await saveStorage('testCookie', 'testValue');
                expect(JSON.parse(getCookie('testCookie')!)).toEqual('testValue');
            });

            it('retrieves correct value for given slot', async () => {
                // document.cookie = 'slot2=value2';
                await saveStorage('slot2', 'value2');

                saveStorage('slot2', 'value2');
                expect(JSON.parse(getCookie('slot2')!)).toEqual('value2');

                document.cookie = document.cookie + ';slot10=value20;';
                // await saveStorage('slot10', 'value20')
                expect(JSON.parse(getCookie('slot2')!)).toEqual('value2');
                expect(JSON.parse(getCookie('slot10')!)).toEqual('value20');
            });

            it('returns null for non-existent slot', () => {
                expect(JSON.parse(getCookie('nonExistentSlot')!)).toEqual(null);
            });

            it('handles slots with special characters', async () => {
                await saveStorage('complex@Slot', 'complexValue');
                expect(JSON.parse(getCookie('complex@S)lot')!)).toEqual('complexValue');
            });

            it('returns null for non-existent cookie', () => {
                expect(JSON.parse(getCookie('nonexistentCookie')!)).toEqual(null);
            });

            it('handles cookies with = in the value', async () => {
                await saveStorage('complexCookie', 'co-mp_lex=#val%ue');
                expect(JSON.parse(getCookie('complexCookie')!)).toEqual('co-mp_lex=#val%ue');
            });

            describe('getStorage = getCookie', () => {
                it('getStorage returns same value as getCookie for string', async () => {
                    await saveStorage('matchSlot', 'matchValue');
                    const storageValue = await getStorage('matchSlot');
                    expect(storageValue).toEqual(getCookie('matchSlot'));
                });

                it('getStorage returns parsed object matching getCookie', async () => {
                    const testObj = { test: 'object' };
                    await saveStorage('objSlot', testObj);
                    const storageValue = await getStorage('objSlot');
                    expect(storageValue).toEqual(JSON.parse(getCookie('objSlot')!));
                });

                it('getStorage and getCookie both return null for non-existent slot', async () => {
                    const storageValue = await getStorage('nonExistentSlot');
                    expect(storageValue).toEqual(null);
                    expect(JSON.parse(getCookie('nonExistentSlot')!)).toEqual(null);
                });
            });
        });
    });
});

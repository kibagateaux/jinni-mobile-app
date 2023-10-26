import { Platform } from 'react-native';
import {
    getInventoryItems,
    getPlatformItems,
    coreInventory,
    mobileInventory,
    iosInventory,
    androidInventory,
    // allInventoryItems,
} from 'utils/inventory';
import maliksMajik from '../maliks-majik';

// TODO figure out how to make generalized mock for NFC
const mockNfcManager = jest.fn();
jest.mock('react-native-nfc-manager', () => ({
    // https://github.com/revtel/react-native-nfc-manager/__mocks__
    NfcManagerModule: { start: mockNfcManager },
    // NfcTech: { IsoDep: 'IsoDep' },
    // Ndef: { uriRecord: jest.fn() },
    // requestTechnology: jest.fn(),
    // getTag: jest.fn(),
    // setEventListener: jest.fn(),
    // registerTagEventEx: jest.fn(),
    // unregisterTagEventEx: jest.fn(),
    // unregisterTagEvent: jest.fn(),
    // registerTagEvent: jest.fn(),
    // writeNdefMessage: jest.fn(),
    // requestNdefWrite: jest.fn(),
}));

describe('Game inventory system', () => {
    describe('Android inventory', () => {
        test('must contain all core and mobile inventory items', () => {
            expect(getPlatformItems('android')).toEqual(expect.arrayContaining(coreInventory));
            expect(getPlatformItems('android')).toEqual(expect.arrayContaining(mobileInventory));
        });
        test('Platform.select should return android', async () => {
            // TODO figure out proper way to mock platform. jest AWLAYS returns ios
            // expect(Platform.OS).toEqual('android');
        });

        test('mobile inventory contains core inventory', async () => {
            expect(getPlatformItems('android')).toEqual(expect.arrayContaining(coreInventory));
        });

        test('returns correct inventory for android', async () => {
            expect(getPlatformItems('android')).toEqual(androidInventory);
        });
    });

    describe('iOS inventory', () => {
        test('Platform.select should return ios', async () => {
            // TODO figure out proper way to mock platform. jest AWLAYS returns ios
            expect(Platform.OS).toEqual('ios');
        });
        test('must contain all core and mobile inventory items', () => {
            expect(getPlatformItems('ios')).toEqual(expect.arrayContaining(coreInventory));
            expect(getPlatformItems('ios')).toEqual(expect.arrayContaining(mobileInventory));
        });

        test('returns correct inventory for iOS', async () => {
            expect(getPlatformItems('ios')).toEqual(iosInventory);
        });
    });

    describe('Fetching users inventory items', () => {
        describe('while not logged in', () => {
            test('returns default platform inventory', async () => {
                // jest defaults to ios so use that
                expect(getPlatformItems('ios')).toEqual(iosInventory);
            });
        });

        describe('while logged in', () => {
            test('player must have maliks majik to have remote inventory', async () => {
                // TODO stub API
                expect(await getInventoryItems('myname')).toEqual(
                    expect.arrayContaining([maliksMajik]),
                );
            });

            test('returns inventory settings stored in db', async () => {
                // TODO stub API
                const personalItems = await getInventoryItems('myname');
                // jest only uses ios.
                expect(iosInventory).toEqual(expect.arrayContaining(personalItems));
            });

            test('filters inventory for curent platform', async () => {
                // TODO stub API
                // TODO stub platform to return android
                expect(await getInventoryItems('myname')).toEqual(
                    expect.arrayContaining(iosInventory),
                );
            });
        });
    });
});

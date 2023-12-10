// if equip succeeds then must have
// must be unequipped if nothing in storage slot
// must return equipped if storage slot filled
// storage slot must start with 0x
// unequip must delete storage slot

import { getStorage, saveStorage, PROOF_MALIKS_MAJIK_SLOT } from 'utils/config';
import maliksMajik from '../maliks-majik';

// TODO figure out how to stub NFC manager

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

describe('item inventory', () => {
    describe('Item Status', () => {
        test('is unequipped if no proof in local storage', async () => {
            const hasProof = await getStorage(PROOF_MALIKS_MAJIK_SLOT);
            expect(hasProof).toBeFalsy();
            expect(await maliksMajik.item.checkStatus()).toEqual('unequipped');
        });
        test('is equipped if anything stored in proof local storage', async () => {
            const hasProof = await saveStorage(PROOF_MALIKS_MAJIK_SLOT, 'meythingy');
            expect(hasProof).toBeTruthy();
            expect(await maliksMajik.item.checkStatus()).toEqual('equipped');
        });
    });
});

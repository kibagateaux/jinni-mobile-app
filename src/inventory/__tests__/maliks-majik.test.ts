// if equip succeeds then must have
// must be unequipped if nothing in storage slot
// must return equipped if storage slot filled
// storage slot must start with 0x
// unequip must delete storage slot

import { getStorage, saveStorage, PROOF_MALIKS_MAJIK_SLOT } from 'utils/config';
import maliksMajik from '../maliks-majik';

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

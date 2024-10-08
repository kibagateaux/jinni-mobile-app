// if equip succeeds then must have
// must be unequipped if nothing in storage slot
// must return equipped if storage slot filled
// storage slot must start with 0x
// unequip must delete storage slot

import { getStorage, saveStorage, PROOF_MALIKS_MAJIK_SLOT, MALIKS_MAJIK_CARD } from 'utils/config';
import maliksMajik from '../maliks-majik';

describe('item inventory', () => {
    describe('Item Status', () => {
        test('is unequipped if no proof in local storage', async () => {
            const hasProof = await getStorage(PROOF_MALIKS_MAJIK_SLOT);
            expect(hasProof).toBeFalsy();
            expect(await maliksMajik.item.checkStatus()).toEqual('unequipped');
        });
        test('is equipped only if MALIKS_MAJIK whitelisted id stored in proof local storage', async () => {
            const hasProof = await saveStorage(PROOF_MALIKS_MAJIK_SLOT, {
                [MALIKS_MAJIK_CARD]: 'heythingy',
            });
            expect(hasProof).toBeTruthy();
            expect(await maliksMajik.item.checkStatus()).toEqual('equipped');
        });

        test('can store proof for any majik card', async () => {
            const testCard = 'jusnuais';
            const hasProof = await saveStorage(PROOF_MALIKS_MAJIK_SLOT, {
                [testCard]: 'heythingy',
            });
            expect(hasProof).toBeTruthy();
            expect(hasProof[testCard]).toEqual('heythingy');
        });

        test('can store multiple card proofs in majik storage slot', async () => {
            const testCard = 'jusnuais';
            const hasProof = await saveStorage(
                PROOF_MALIKS_MAJIK_SLOT,
                { [testCard]: 'heythingy' },
                true,
            );
            const hasProof2 = await saveStorage(
                PROOF_MALIKS_MAJIK_SLOT,
                { [MALIKS_MAJIK_CARD]: 'heythingy2' },
                true,
            );

            expect(hasProof).toBeTruthy();
            expect(hasProof2).toBeTruthy();
            expect(hasProof2).not.toEqual(hasProof);
            expect(hasProof2).not.toEqual(hasProof);
            expect(hasProof2[testCard]).toEqual('heythingy');
            expect(hasProof2[MALIKS_MAJIK_CARD]).toEqual('heythingy2');
        });
    });

    describe('equip', () => {
        // returns error messages on invalid
        // returns error message if api returns no jid
        // returns
    });

    describe('ability joinCircle', () => {
        // only need two tests
        // one prove equivalence of equip and joinCircle
        // one show any signer works for circle jubmoji. doesnt have to be master jinnn
    });

    describe('ability activateJinni', () => {});
});

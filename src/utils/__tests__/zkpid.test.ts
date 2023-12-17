import { getStorage, saveStorage } from 'utils/config';
import { generateIdentity, saveId, _delete_id } from 'utils/zkpid';

describe('Anonymous Authentication and Zero-Knowledge Proofs', () => {
    beforeEach(async () => {
        _delete_id('test'); // only works in dev
    });

    test('cannot manually delete IDs in production', async () => {
        process.env = { ...process.env, NODE_ENV: 'production' };
        try {
            _delete_id('test');
        } catch (error) {
            expect(error).toBeTruthy();
        }
        // reset to not pollute other tests
        process.env = { ...process.env, NODE_ENV: 'test' };
    });

    test('properly serializes Identity object', async () => {
        const ogId = generateIdentity();

        try {
            await saveStorage('test', ogId);
        } catch (error) {
            expect(error).toBeTruthy();
        }

        await saveId('test', ogId);
    });

    test('saves to local storage', async () => {
        const ogId = generateIdentity();
        await saveId('test', ogId);
        expect(await getStorage('test')).toEqual({
            _commitment: ogId._commitment.toString(),
            _secret: ogId._secret.toString(),
            _trapdoor: ogId._trapdoor.toString(),
            _nullifier: ogId._nullifier.toString(),
        });
    });

    test('never overwrites an ID if it already exists', async () => {
        const ogId = generateIdentity();
        await saveId('test', ogId);
        await saveId('test', generateIdentity());
        expect(await getStorage('test')).toEqual({
            _commitment: ogId._commitment.toString(),
            _secret: ogId._secret.toString(),
            _trapdoor: ogId._trapdoor.toString(),
            _nullifier: ogId._nullifier.toString(),
        });
    });
});

// TODO test getSpellbook
// if playerId exists then private key must exists too
// does not generate new wallet if playerId already exists
// only called one time bc of memoize
//

import { getStorage, saveStorage } from 'utils/config';
import {
    generateIdentity,
    generateIdentityWithSecret,
    getSpellBook,
    saveId,
    toObject,
    _delete_id,
    magicRug,
} from 'utils/zkpid';
import ethers from 'ethers';

describe('zkpid, Anonymous Authentication and Zero-Knowledge Proofs', () => {
    beforeEach(async () => {
        _delete_id('test'); // only works in dev
    });

    describe('Basic ID functionality', () => {
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
        describe('toObject function', () => {
            const createIdentityMock = (
                commitment: bigint,
                secret: bigint,
                trapdoor: bigint,
                nullifier: bigint,
            ): Identity => ({
                _commitment: commitment,
                _secret: secret,
                _trapdoor: trapdoor,
                _nullifier: nullifier,
            });

            test('converts Identity with BigInts to serializable object', () => {
                const identity = createIdentityMock(
                    BigInt('123456789'),
                    BigInt('987654321'),
                    BigInt('112233445566'),
                    BigInt('998877665544'),
                );
                const result = toObject(identity);
                expect(result).toEqual({
                    _commitment: '123456789',
                    _secret: '987654321',
                    _trapdoor: '112233445566',
                    _nullifier: '998877665544',
                });
            });

            test('handles nested objects with BigInts', () => {
                const nestedObject = {
                    id: createIdentityMock(
                        BigInt('11111'),
                        BigInt('22222'),
                        BigInt('33333'),
                        BigInt('44444'),
                    ),
                    metadata: {
                        createdAt: BigInt('1234567890'),
                    },
                };
                const result = toObject(nestedObject);
                expect(result).toEqual({
                    id: {
                        _commitment: '11111',
                        _secret: '22222',
                        _trapdoor: '33333',
                        _nullifier: '44444',
                    },
                    metadata: {
                        createdAt: '1234567890',
                    },
                });
            });

            test('handles arrays with BigInts', () => {
                const arrayWithBigInts = [
                    BigInt('11111'),
                    BigInt('22222'),
                    createIdentityMock(
                        BigInt('33333'),
                        BigInt('44444'),
                        BigInt('55555'),
                        BigInt('66666'),
                    ),
                ];
                const result = toObject(arrayWithBigInts);
                expect(result).toEqual([
                    '11111',
                    '22222',
                    {
                        _commitment: '33333',
                        _secret: '44444',
                        _trapdoor: '55555',
                        _nullifier: '66666',
                    },
                ]);
            });

            test('leaves non-BigInt values unchanged', () => {
                const mixedObject = {
                    string: 'hello',
                    number: 42,
                    boolean: true,
                    null: null,
                    undefined: undefined,
                    bigint: BigInt('9007199254740991'),
                };
                const result = toObject(mixedObject);
                expect(result).toEqual({
                    string: 'hello',
                    number: 42,
                    boolean: true,
                    null: null,
                    undefined: undefined,
                    bigint: '9007199254740991',
                });
            });
        });

        describe('saveId', () => {
            test('properly serializes Identity object', async () => {
                // trying to save directly to storage causes errors with bigint type
                const ogId = generateIdentity();
                try {
                    await saveStorage('test', ogId);
                } catch (error) {
                    expect(error).toBeTruthy();
                }

                // we implement toObject in saveId to get serializable types
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
    });

    describe('getSpellBook', () => {
        // TODO test getSpellbook
        // if playerId exists then private key must exists too
        // does not generate new wallet if playerId already exists
        // only called one time bc of memoize
        //
        beforeEach(() => {
            jest.clearAllMocks();
            global.saveStorage = jest.fn();
            global.getStorage = jest.fn();
        });

        test('creates new wallet if no private key exists', async () => {
            global.getStorage.mockResolvedValue(null);
            const spellbook = await getSpellBook();

            expect(spellbook).toBeInstanceOf(Wallet);
            expect(global.saveStorage).toHaveBeenCalledTimes(2);
            expect(global.saveStorage).toHaveBeenCalledWith(ID_PLAYER_SLOT, expect.any(String));
            expect(global.saveStorage).toHaveBeenCalledWith(ID_PKEY_SLOT, expect.any(Object));
        });

        test('retrieves existing wallet if private key exists', async () => {
            const mockMnemonic = ethers.Wallet.createRandom()._mnemonic();
            global.getStorage.mockResolvedValue(mockMnemonic);

            const spellbook = await getSpellBook();

            expect(spellbook).toBeInstanceOf(Wallet);
            expect(global.saveStorage).not.toHaveBeenCalled();
        });

        test('returns same instance on subsequent calls', async () => {
            global.getStorage.mockResolvedValue(null);

            const spellbook1 = await getSpellBook();
            const spellbook2 = await getSpellBook();

            expect(spellbook1).toBe(spellbook2);
        });

        test('connects wallet to provider', async () => {
            global.getStorage.mockResolvedValue(null);

            const spellbook = await getSpellBook();

            expect(spellbook.provider).toBeInstanceOf(providers.Provider);
        });
    });

    describe('Semaphore', () => {
        describe('generateIdentity', () => {
            test('generates a new Identity instance', () => {
                const identity = generateIdentity();
                expect(identity).toBeInstanceOf(Identity);
            });

            test('generates unique identities', () => {
                const id1 = generateIdentity();
                const id2 = generateIdentity();
                expect(id1).not.toEqual(id2);
            });
        });

        describe('generateIdentityWithSecret', () => {
            test('generates an Identity instance with a given secret', () => {
                const secret = 'test_secret';
                const identity = generateIdentityWithSecret(secret);
                expect(identity).toBeInstanceOf(Identity);
            });

            test('generates consistent identities for the same secret', () => {
                const secret = 'consistent_secret';
                const id1 = generateIdentityWithSecret(secret);
                const id2 = generateIdentityWithSecret(secret);
                expect(id1).toEqual(id2);
            });

            test('generates different identities for different secrets', () => {
                const id1 = generateIdentityWithSecret('secret1');
                const id2 = generateIdentityWithSecret('secret2');
                expect(id1).not.toEqual(id2);
            });
        });

        describe('saveId', () => {
            test('saves a new identity', async () => {
                const idType = 'newId';
                const identity = generateIdentity();
                await saveId(idType, identity);
                const savedId = await getStorage(idType);
                expect(savedId).toEqual(toObject(identity));
            });

            test('does not overwrite existing identity', async () => {
                const idType = 'existingId';
                const originalId = generateIdentity();
                await saveId(idType, originalId);

                const newId = generateIdentity();
                await saveId(idType, newId);

                const savedId = await getStorage(idType);
                expect(savedId).toEqual(toObject(originalId));
            });

            test('handles errors gracefully', async () => {
                jest.spyOn(console, 'log').mockImplementation(() => {});
                const mockError = new Error('Storage error');
                jest.spyOn(global, 'saveStorage').mockRejectedValue(mockError);

                await saveId('errorId', generateIdentity());
                expect(console.log).toHaveBeenCalledWith('Store Err: ', mockError);
            });
        });
    });

    // describe('getId', () => {
    //     test('retrieves a saved identity', async () => {
    //         const idType = 'retrieveId';
    //         const identity = generateIdentity();
    //         await saveId(idType, identity);
    //         const retrievedId = await getId(idType);
    //         expect(retrievedId).toEqual(toObject(identity));
    //     });

    //     test('returns null for non-existent identity', async () => {
    //         const retrievedId = await getId('nonExistentId');
    //         expect(retrievedId).toBeNull();
    //     });

    //     test('memoizes results', async () => {
    //         const idType = 'memoizeId';
    //         const identity = generateIdentity();
    //         await saveId(idType, identity);

    //         const firstCall = await getId(idType);
    //         const secondCall = await getId(idType);
    //         expect(firstCall).toBe(secondCall);
    //     });
    // });

    describe('_delete_id', () => {
        test('deletes an identity in development', async () => {
            const idType = 'deleteId';
            const identity = generateIdentity();
            await saveId(idType, identity);
            await _delete_id(idType);
            const deletedId = await getStorage(idType);
            expect(deletedId).toBe('');
        });

        test('throws error when trying to delete in production', async () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            await expect(_delete_id('prodId')).rejects.toThrow('CANNOT DELETE ZK IDs');

            process.env.NODE_ENV = originalEnv;
        });
    });

    describe('magicRug', () => {
        test('deletes all user data in development', async () => {
            const mockSaveStorage = jest.fn();
            global.saveStorage = mockSaveStorage;

            magicRug();

            expect(mockSaveStorage).toHaveBeenCalledTimes(6);
            expect(mockSaveStorage).toHaveBeenCalledWith(ID_PLAYER_SLOT, '', false);
            expect(mockSaveStorage).toHaveBeenCalledWith(ID_PKEY_SLOT, '', false);
            expect(mockSaveStorage).toHaveBeenCalledWith(ID_JINNI_SLOT, '', false);
            expect(mockSaveStorage).toHaveBeenCalledWith(ID_ANON_SLOT, '', false);
            expect(mockSaveStorage).toHaveBeenCalledWith(PROOF_MALIKS_MAJIK_SLOT, '', false);
            expect(mockSaveStorage).toHaveBeenCalledWith(TRACK_ONBOARDING_STAGE, '', false);
        });

        test('throws error when called in production', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            expect(() => magicRug()).toThrow('CANNOT DELETE ZK IDs');

            process.env.NODE_ENV = originalEnv;
        });
    });
});

import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';

import {
    getAppConfig,
    getStorage,
    saveStorage,
    ID_PLAYER_SLOT,
    ID_PKEY_SLOT,
    ID_JINNI_SLOT,
    ID_ANON_SLOT,
    PROOF_MALIKS_MAJIK_SLOT,
    TRACK_ONBOARDING_STAGE,
} from './config';
import { ethers, Wallet, providers } from 'ethers';
import { memoize } from 'lodash';

const defaultProvider = (): providers.Provider =>
    new ethers.providers.AlchemyProvider(
        getAppConfig().ETH_NETWORK,
        getAppConfig().ETH_API_PROVIDER_API_KEY,
    );

const connectProvider = (wallet: Wallet): Wallet => wallet.connect(defaultProvider());

let spellbook: Wallet | undefined;
export const getSpellBook = memoize(async (): Promise<Wallet> => {
    if (spellbook) return spellbook;
    // TODO
    // if(Platform.OS === 'web' && getAppConfig().NODE_ENV === 'development') {
    //     // try connecting to wallet for manually signing api requests and putt
    //     // can use this as first integration point for passkeys
    // }

    const pk = await getStorage(ID_PKEY_SLOT);
    if (!pk) {
        // no spellbook yet. generate random seed and save to storage
        const newSpellbook = ethers.Wallet.createRandom();
        console.log('spellbook pk save', newSpellbook.address);
        console.log('spellbook pk save', newSpellbook._mnemonic());
        await Promise.all([
            saveStorage(ID_PLAYER_SLOT, newSpellbook.address),
            saveStorage(ID_PKEY_SLOT, newSpellbook._mnemonic()),
        ]);
        spellbook = connectProvider(newSpellbook);
        return spellbook;
    } else {
        // retrieved seedphrase from storage and recreating spellbook
        console.log('hydrate spellbook from pk', pk);
        const newSpellbook: Wallet = ethers.Wallet.fromMnemonic(pk.phrase, pk.path);
        console.log('spellbook from pk', newSpellbook);
        console.log('spellbook signer', connectProvider(newSpellbook));
        spellbook = connectProvider(newSpellbook);
        return spellbook;
    }
});

export const generateIdentity = (): Identity => new Identity();
export const generateIdentityWithSecret = (secret: string): Identity => new Identity(secret);

export const saveId = async (idType: string, id: Identity): Promise<void> => {
    try {
        console.log(
            'saveId cached val 1',
            await getStorage(idType),
            typeof (await getStorage(idType)),
        );
        const value = await getStorage(idType);

        console.log('saveId cached val 2', idType, value);
        // console.log("save id existing value?", value, !value, id)

        // @dev INVARIANT: MUST NOT OVERWRITE OR DELTE ZK IDs
        if (!value) {
            console.log('SAVE ID TO STORAGE', toObject(id));
            await saveStorage(idType, toObject(id));
            // console.log("anon id saved to storage!", idType, id)
        }
    } catch (error) {
        console.log('Store Err: ', error);
    }
};

export const getId = memoize(
    async (idType: string): Promise<Identity | null> => (await getStorage(idType)) as Identity,
);

export const _delete_id = async (idType: string): Promise<void> => {
    console.log(
        '\n\n\nZK: DELETING ID!!!! ONLY AVAILABKLE IN DEVELOPMENT!!!! ENSURE THIS IS INTENDED BEHAVIOUR!!!!!\n\n\n',
    );
    if (!__DEV__) throw Error('CANNOT DELETE ZK IDs');
    await saveStorage(idType, '');
};

export const magicRug = () => {
    console.log('DELETING USER DATA FOR TESTING', __DEV__);
    if (!__DEV__) throw Error('CANNOT DELETE ZK IDs');
    Promise.all([
        saveStorage(ID_PLAYER_SLOT, '', false),
        saveStorage(ID_PKEY_SLOT, '', false),
        saveStorage(ID_JINNI_SLOT, '', false),
        saveStorage(ID_ANON_SLOT, '', false),

        saveStorage(PROOF_MALIKS_MAJIK_SLOT, '', false),
        saveStorage(TRACK_ONBOARDING_STAGE, '', false),
    ]);
};

// Semaphore Groups have max 1048576 members (20^²).
// TODO randomer numbers for groupIds
const groupIds = {
    MaliksMajikGroup: 0,
    MayaneseGroup: 1,
    CoordiNationGroup: 2,
    BioHackingGroup: 3,
};

const groupMaliksMajik = new Group(groupIds['MaliksMajikGroup'], 18);
// Mastrer Djinn group is all players blessed with Malik's Majik to play the game, traverse portal and bond to jinn

// helper func to format BigInts from Idenity for JSON
export const toObject = (thing: Identity) => {
    groupMaliksMajik;
    return JSON.parse(
        JSON.stringify(
            thing,
            (key, value) =>
                typeof value === 'bigint' // || 'bignumber'
                    ? value.toString()
                    : value, // return everything else unchanged
        ),
    );
};

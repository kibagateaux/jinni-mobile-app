import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { execHaloCmdRN } from '@arx-research/libhalo/api/react-native.js';
import { getAppConfig, getStorage, saveStorage } from './config';
import { ethers, Wallet, providers } from 'ethers';

export const ID_ANON_SLOT = '_anon_id';
export const ID_ADDRESS_SLOT = '_address_id';
export const ID_PKEY_SLOT = '_private_key*uwu*';
export const ID_JINNI_SLOT = '_jinni_uuid';

export const PROOF_MALIKS_MAJIK_SLOT = 'MaliksMajik';

const defaultProvider = (): providers.Provider =>
    new ethers.providers.AlchemyProvider(
        getAppConfig().ETH_NETWORK,
        getAppConfig().ETH_API_PROVIDER_API_KEY,
    );

const connectProvider = (wallet: Wallet): Wallet => wallet.connect(defaultProvider());

export const hydrateWallet = () =>
    getStorage(ID_PKEY_SLOT).then((pk) => {
        console.log('wallet lookup', pk);
        if (!pk) {
            // no wallet yet. generate random seed and save to storage
            const wallet = ethers.Wallet.createRandom();
            console.log('wallet pk save', wallet.address);
            console.log('wallet pk save', wallet._mnemonic());
            saveStorage(ID_ADDRESS_SLOT, wallet.address);
            saveStorage(ID_PKEY_SLOT, wallet._mnemonic());
            return connectProvider(wallet);
        } else {
            // retrieved seedphrase from storage and recreating wallet
            const wallet: Wallet = ethers.Wallet.fromMnemonic(pk.phrase, pk.path);
            console.log('wallet from pk', wallet);
            console.log('wallet signer', connectProvider(wallet));
            return connectProvider(wallet);
        }
    });

export const generateIdentity = (): Identity => new Identity();
export const generateIdentityWithSecret = (secret: string): Identity => new Identity(secret);

export const saveId = async (idType: string, id: Identity): Promise<void> => {
    try {
        const value = await getStorage(idType);
        // console.log("save id existing value?", value, !value, id)

        // @dev INVARIANT: MUST NOT OVERWRITE OR DELTE ZK IDs
        if (!value) {
            // console.log("SAVE ID TO STORAGE", toObject(id))
            await saveStorage(idType, toObject(id));
            // console.log("anon id saved to storage!", idType, id)
        }
    } catch (error) {
        console.error('Store Err: ', error);
    }
};

export const getId = async (idType: string): Promise<Identity | null> =>
    await getStorage<Identity>(idType);

export const _delete_id = async (idType: string): Promise<void> => {
    console.log('node env', process.env.NODE_ENV);
    console.log(
        '\n\n\nZK: DELETING ID!!!! ONLY AVAILABKLE IN DEVELOPMENT!!!! ENSURE THIS IS INTENDED BEHAVIOUR!!!!!\n\n\n',
    );
    if (!__DEV__) throw Error('CANNOT DELETE ZK IDs');
    await saveStorage(idType, '');
};

/** TODO figure out return types from HaLo lib  */
export const signWithId = async (id: string | Identity): Promise<object | null> => {
    // if (!id) throw new Error(`ZK:HaLo: No id found for ${idType}`);
    console.log('sign anon id with majik', id, typeof id);

    try {
        const msg = typeof id === 'string' ? id : id._commitment;
        await NfcManager.requestTechnology(NfcTech.IsoDep);
        const tag = await NfcManager.getTag();
        console.log('ZK:HaLo: NFC tag reader: ', tag);
        console.log('ZK:HaLo: Id to sign with card: ', msg);
        const result = await execHaloCmdRN(NfcManager, {
            name: 'sign',
            message: msg,
            format: 'text',
            keyNo: 1, // TODO do we want to use primary wallet for signing?
        });
        console.log('ZK:HaLo: signature response: ', result);
        return !result ? null : result;
    } catch (err) {
        console.warn('ZK:HaLo: signing error', err);
        return null;
    } finally {
        // stop the nfc scanning
        NfcManager.cancelTechnologyRequest();
    }
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
console.log('semaphore group - core majik : ', groupMaliksMajik);

// helper func to format BigInts from Idenity for JSON
const toObject = (thing: Identity) => {
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

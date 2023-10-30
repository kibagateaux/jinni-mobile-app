import { HoF } from 'types/GameMechanics';

import {
    ID_ADDRESS_SLOT,
    PROOF_MALIKS_MAJIK_SLOT,
    _delete_id,
    getId,
    hydrateWallet,
    signWithId,
} from 'utils/zkpid';
import { MALIKS_MAJIK_CARD, getStorage, saveStorage } from 'utils/config';

import { InventoryIntegration, DjinnStat, CommunityStat, InventoryItem } from 'types/GameMechanics';

const equip: HoF = async () => {
    console.log("receiving Malik's Majik!!!");
    try {
        const address = await getStorage<string>(ID_ADDRESS_SLOT);
        console.log('address to get verified: ', address);
        const result = address ? await signWithId(address) : null;
        console.log('verified address signature: ', result);
        if (result && result.etherAddress === MALIKS_MAJIK_CARD) {
            console.log('Inv:MaliksMajik:equip:SUCC', result.signature);
            // ensure result is valid ?
            // send to our server for storage or some
            // save result to local storage for later authentication
            await saveStorage(PROOF_MALIKS_MAJIK_SLOT, result.signature);
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.log('Inv:MaliksMajik:equip:ERR', e);
        return false;
    }
};

const unequip: HoF = async () => {
    console.log("receiving Malik's Majik!!!");
    try {
        _delete_id(PROOF_MALIKS_MAJIK_SLOT);
        return true;
    } catch (e) {
        console.log('Inv:MaliksMajik:equip:ERR', e);
        return false;
    }
};

const item: InventoryItem = {
    id: 'MaliksMajik',
    name: "Malik's Majik",
    datasource: 'MaliksMajik-card',
    image: 'https://cdn.drawception.com/drawings/3yyv096cK5.png',
    attributes: [
        { ...DjinnStat, value: 10 },
        { ...CommunityStat, value: 10 },
    ],
    checkStatus: async () => {
        const proof = await getId(PROOF_MALIKS_MAJIK_SLOT);
        console.log('maliks majik check status', proof);

        if (proof) return 'equipped';
        return 'unequipped';
    },
    canEquip: async () => true,
    equip,
    unequip: process.env.NODE_ENV === 'development' ? unequip : undefined,
    abilities: [
        {
            id: 'activate-jinni-game',
            name: 'Activate Jinni',
            symbol: '🧞‍♂️',
            description: 'Get access to the full game',
            canDo: async (status: ItemStatus) => (status === 'equipped' ? true : false),
            do: async () => {
                try {
                    // retrieve player address from storage
                    // retrieve proof from storage
                    // sign raw api query
                    // add all variables to graphql api query
                    // send request
                    const signer = await hydrateWallet();
                    const myId = signer.address;
                    const myProof = await getStorage(PROOF_MALIKS_MAJIK_SLOT);
                    const q = `gql`;
                    const signedQ = signer.signMessage(q);
                    console.log('my jinni activation', myId, myProof, signedQ);

                    return async () => true;
                } catch (e) {
                    return async () => false;
                }
            },
        },
    ],
};

// TODO should we abstract NFC Manager out of SignWithID so we can request permissions separately?
const initPermissions = () => {};
const getPermissions = () => {};

export default {
    item,
    checkEligibility: async () => true,
    equip,
    unequip,
    getPermissions,
    initPermissions,
} as InventoryIntegration;

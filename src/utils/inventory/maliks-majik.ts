import { MALIKS_MAJIK_CARD } from 'utils/config';
import { HoF } from 'types/GameMechanics';

import {
    ID_ANON_SLOT,
    PROOF_MALIKS_MAJIK_SLOT,
    _delete_id,
    getId,
    saveId,
    signWithId,
} from 'utils/zkpid';

import { InventoryIntegration, DjinnStat, CommunityStat, InventoryItem } from 'types/GameMechanics';

const equip: HoF = async () => {
    console.log("receiving Malik's Majik!!!");
    try {
        const result = await signWithId(ID_ANON_SLOT);
        if (result && result.etherAddress === MALIKS_MAJIK_CARD) {
            console.log('Inv:MaliksMajik:equip:SUCC', result);
            // ensure result is valid ?
            // send to our server for storage or some
            // save result to local storage for later authentication
            await saveId(PROOF_MALIKS_MAJIK_SLOT, result.signature);
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
        if (proof) return 'equipped';
        return 'unequipped';
    },
    canEquip: async () => true,
    equip,
    unequip: process.env.NODE_ENV === 'development' ? unequip : undefined,
    // actions: [],
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

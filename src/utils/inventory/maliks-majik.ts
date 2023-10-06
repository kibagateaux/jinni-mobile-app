import { MALIKS_MAJIK_CARD } from "utils/config";

import {
    ID_ANON_SLOT,
    PROOF_MALIKS_MAJIK_SLOT,
    _delete_id,
    getId,
    saveId,
    signWithId,
} from 'utils/zkpid';

import {
    InventoryIntegration,
    DjinnStat,
    CommunityStat,
    InventoryItem,
} from 'types/GameMechanics';

const equip = async () => {
    console.log("receiving Malik's Majik!!!");
    try {
        const result = await signWithId(ID_ANON_SLOT);
        if(result && result.etherAddress === MALIKS_MAJIK_CARD) {
            console.log("Inv:maliks-majik:equip:SUCC", result);
            // ensure result is valid ?
            // send to our server for storage or some
            // save result to local storage for later authentication
            await saveId(PROOF_MALIKS_MAJIK_SLOT, result.signature);
            return true;
        } else {
            return false;
        }
    } catch(e) {
        console.log("Inv:maliks-majik:equip:ERR", e);
        return false;
    }
}

const unequip = async () => {
    console.log("receiving Malik's Majik!!!");
    try {
        _delete_id(PROOF_MALIKS_MAJIK_SLOT);
    } catch(e) {
        console.log("Inv:maliks-majik:equip:ERR", e);
        return false;
    }
}


const item = {
    id: "maliks-majik",
    name: "Malik's Majik",
    dataSourceProvider: "maliks-majik-card",
    image: "https://cdn.drawception.com/drawings/3yyv096cK5.png",
    attributes: [
        { ...DjinnStat, value: 10 },
        { ...CommunityStat, value: 10 },
    ],
    checkStatus: async () => {
        const proof = await getId(PROOF_MALIKS_MAJIK_SLOT);
        if(proof) return 'equipped';
        return 'unequipped';
    },
    canEquip: async () => true,
    equip,
    unequip: process.env.NODE_ENV === 'development' ? unequip : null,
    // actions: [],
}

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
} as InventoryIntegration
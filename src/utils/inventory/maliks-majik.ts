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
    JinniStat,
    CommunityStat,
    InventoryItem,
} from 'types/GameMechanics';

const equip = async () => {
    console.log("receiving Malik's Majik!!!");
    try {
        const signature = await signWithId(ID_ANON_SLOT);
        console.log("Inv:maliks-majik:equip:SUCC", signature);
        // ensure signature is valid ?
        // send to our server for storage or some
        // save signature to local storage for later authentication
        signature && await saveId(PROOF_MALIKS_MAJIK_SLOT, signature);
        return true;
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
        { ...JinniStat, value: 10 },
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
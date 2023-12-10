import { HoF, ItemStatus } from 'types/GameMechanics';

import { _delete_id, getId, getSpellBook, signWithId } from 'utils/zkpid';
import {
    ID_PLAYER_SLOT,
    ID_JINNI_SLOT,
    PROOF_MALIKS_MAJIK_SLOT,
    ID_PKEY_SLOT,
    MALIKS_MAJIK_CARD,
    getStorage,
    saveMysticCrypt,
    saveStorage,
} from 'utils/config';

import { InventoryIntegration, DjinnStat, CommunityStat, InventoryItem } from 'types/GameMechanics';
import { MU_ACTIVATE_JINNI, qu } from 'utils/api';
import { debug, track } from 'utils/logging';

export const ABILITY_ACTIVATE_JINNI = 'activate-jinni';
export const ABILITY_MYSTIC_CRYPT = 'create-mystic-crypt';

const equip: HoF = async () => {
    console.log("receiving Malik's Majik!!!");
    try {
        const address = await getStorage<string>(ID_PLAYER_SLOT);
        console.log('address to get verified: ', address);
        const result = address
            ? await signWithId(address)
            : await signWithId((await getSpellBook()).address);

        console.log('verified address signature: ', result);
        if (result && result.etherAddress === MALIKS_MAJIK_CARD) {
            console.log('Inv:MaliksMajik:equip:SUCC', result.signature);
            // ensure result is valid ?
            // send to our server for storage or some
            // save result to local storage for later authentication
            await saveStorage(PROOF_MALIKS_MAJIK_SLOT, result.signature);
            return true;
        } else {
            // TODO return error message. "Wrong maji for ritual"
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
            id: ABILITY_ACTIVATE_JINNI,
            name: 'Activate Jinni',
            symbol: '🧞‍♂️',
            description: 'Get access to the full game',
            canDo: async (status: ItemStatus) => {
                const isBonded = await getStorage(ID_JINNI_SLOT);
                if (isBonded) return false;
                if (status === 'equipped') return true;
                return false; // if not curated then cant save
            },
            do: async () => {
                const myProof = await getStorage(PROOF_MALIKS_MAJIK_SLOT);
                const myId = await getStorage<string>(ID_PLAYER_SLOT);
                try {
                    track(ABILITY_ACTIVATE_JINNI, { ability: ABILITY_ACTIVATE_JINNI });
                    if (!myId) throw Error('You need to create an magic ID first');
                    if (!myProof)
                        throw Error(
                            'You must to meet the Master Djinn before you can activate your jinni',
                        );
                    const m = MU_ACTIVATE_JINNI;
                    console.log('my jinni activation mutation', m);
                    console.log('my jinni activation ID', myId, myProof.ether);

                    const uuid = await qu<string>({ mutation: m })({
                        majik_msg: myProof,
                        player_id: myId,
                    });
                    // server shouldnt allow multiple jinnis yet. Just in case dont overwrite existing uuid
                    const result = await saveStorage<string>(ID_JINNI_SLOT, uuid, false);
                    return async () => (result === uuid ? true : false);
                } catch (e) {
                    console.error('Mani:Jinni:ActivateJinn:ERROR - ', e);
                    debug(e, {
                        user: { id: myId ?? '' },
                        tags: { api: true },
                        extra: { ability: ABILITY_ACTIVATE_JINNI },
                    });
                    return async () => false;
                }
            },
        },
        {
            id: ABILITY_MYSTIC_CRYPT,
            name: 'Create Mystic Crypt',
            symbol: '🏦',
            description:
                "Save game progress to your phone'scloud storage to restore account if you lose your phone",
            canDo: async (status: ItemStatus) => {
                const pk = await getStorage(ID_PKEY_SLOT, true);
                if (!pk) return false;
                if (status === 'equipped') return true;
                return false; // if not curated then cant save
            },
            do: async () => {
                try {
                    const pk = await getStorage(ID_PKEY_SLOT);
                    if (!pk) throw Error('No account to backup');

                    const success = await saveMysticCrypt(ID_PKEY_SLOT, pk);
                    track(ABILITY_MYSTIC_CRYPT, { ability: ABILITY_MYSTIC_CRYPT });
                    return async () => success;
                } catch (e) {
                    console.error('Mani:Jinni:MysticCrypt:ERROR --', e);
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

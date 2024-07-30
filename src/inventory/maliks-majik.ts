import { HoF, ItemAbility, ItemStatus } from 'types/GameMechanics';

import { _delete_id, getSpellBook, signWithId } from 'utils/zkpid';
import {
    ID_PLAYER_SLOT,
    ID_JINNI_SLOT,
    PROOF_MALIKS_MAJIK_SLOT,
    ID_PKEY_SLOT,
    MALIKS_MAJIK_CARD,
    saveMysticCrypt,
    saveStorage,
    getStorage,
} from 'utils/config';

import {
    InventoryIntegration,
    DjinnStat,
    CommunityStat,
    InventoryItem,
    StatsConfig,
} from 'types/GameMechanics';
import { MU_ACTIVATE_JINNI, qu } from 'utils/api';
import { debug, track } from 'utils/logging';
import { obj } from 'types/UserConfig';

export const ITEM_ID = 'MaliksMajik';
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
            throw Error('Enchanter is not a Master Djinn');
        }
    } catch (e) {
        console.log('Inv:MaliksMajik:equip:ERR', e);
        throw e;
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
    id: ITEM_ID,
    name: "Malik's Majik",
    dataProvider: 'MaliksMajikCard',
    image: 'https://cdn.drawception.com/drawings/3yyv096cK5.png',
    attributes: [
        { ...DjinnStat, value: 10 },
        { ...CommunityStat, value: 10 },
    ],
    checkStatus: async () => {
        const proof = await getStorage(PROOF_MALIKS_MAJIK_SLOT);
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
            provider: ITEM_ID,
            symbol: '🧞‍♂️',
            description: 'Get access to the full game',
            displayType: 'none',
            canDo: async (status: ItemStatus) => {
                // @dev implicit check for PROOF_MAJIK
                if (status !== 'equipped') return 'unequipped';

                const isBonded = await getStorage(ID_JINNI_SLOT);
                // written on activate_jinni success
                if (isBonded) return 'equipped';

                const myProof = await getStorage(PROOF_MALIKS_MAJIK_SLOT);
                if (!myProof) return 'unequipped';

                return 'ethereal';
            },
            do: async () => {
                track(ABILITY_ACTIVATE_JINNI, {
                    spell: ABILITY_ACTIVATE_JINNI,
                    activityType: 'initiated',
                });
                const myProof = await getStorage(PROOF_MALIKS_MAJIK_SLOT);
                const myId = await getStorage(ID_PLAYER_SLOT);
                try {
                    if (!myId) {
                        track(ABILITY_ACTIVATE_JINNI, {
                            spell: ABILITY_ACTIVATE_JINNI,
                            activityType: 'unauthenticated',
                        });
                        throw Error('You need to create an magic ID first');
                    }
                    if (!myProof) {
                        track(ABILITY_ACTIVATE_JINNI, {
                            spell: ABILITY_ACTIVATE_JINNI,
                            activityType: 'unequipped',
                        });
                        throw Error(
                            'You must to meet the Master Djinn before you can activate your jinni',
                        );
                    }
                    console.log('Mani:Jinni:ActivateJinn:proof', myProof);
                    console.log('Mani:Jinni:ActivateJinn:ID', myId);

                    const response = await qu({ mutation: MU_ACTIVATE_JINNI })({
                        majik_msg: myProof.ether,
                        player_id: myId,
                    });

                    console.log('Mani:Jinni:ActivateJinn:Response', response);
                    const uuid = response?.data ? response.data.activate_jinni : null;
                    // server shouldnt allow multiple jinnis yet. Just in case dont overwrite existing uuid
                    const result = uuid && (await saveStorage<string>(ID_JINNI_SLOT, uuid, false));
                    console.log('Mani:Jinni:ActivateJinn:Result', result);
                    track(ABILITY_ACTIVATE_JINNI, {
                        spell: ABILITY_ACTIVATE_JINNI,
                        activityType: 'success',
                    });
                    return async () => (uuid ? true : false);
                } catch (e) {
                    console.error('Mani:Jinni:ActivateJinn:ERROR - ', e);
                    debug(e, {
                        tags: { api: true },
                        extra: { spell: ABILITY_ACTIVATE_JINNI },
                    });
                    return async () => false;
                }
            },
        },
        {
            id: ABILITY_MYSTIC_CRYPT,
            name: 'Create Mystic Crypt',
            provider: ITEM_ID,
            symbol: '🏦',
            displayType: 'none',
            description:
                "Save game progress to your phone'scloud storage to restore account if you lose your phone",
            canDo: async (status: ItemStatus) => {
                const pk = await getStorage(ID_PKEY_SLOT);
                if (!pk) return 'ethereal';
                if (status === 'equipped') return 'unequipped';
                return 'ethereal';
            },
            do: async () => {
                try {
                    const pk = await getStorage<obj>(ID_PKEY_SLOT);
                    console.log('save pk mystic crypt', pk);
                    if (!pk) throw Error('No account to backup');

                    const success = await saveMysticCrypt(ID_PKEY_SLOT, pk);
                    track(ABILITY_MYSTIC_CRYPT, { spell: ABILITY_MYSTIC_CRYPT });
                    return async () => success;
                } catch (e) {
                    console.error('Mani:Jinni:MysticCrypt:ERROR --', e);
                    return async () => false;
                }
            },
        },
    ],
    widgets: StatsConfig.map(
        (stat): ItemAbility => ({
            ...stat,
            id: 'stat-' + stat.name.toLowerCase(),
            displayType: 'home',
            provider: ITEM_ID,
            description: `Display your stat points for ${stat.name} so other jinn can see`,
            canDo: async () => 'unequipped',
            do: async () => async () => true,
        }),
    ),
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

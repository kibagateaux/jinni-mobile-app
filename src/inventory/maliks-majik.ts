import { HoF, ItemAbility, ItemStatus } from 'types/GameMechanics';

import { _delete_id } from 'utils/zkpid';
import {
    ID_PLAYER_SLOT,
    ID_JINNI_SLOT,
    PROOF_MALIKS_MAJIK_SLOT,
    ID_PKEY_SLOT,
    MALIKS_MAJIK_CARD,
    saveMysticCrypt,
    saveStorage,
    getStorage,
    MAJIK_CARDS,
} from 'utils/config';

import {
    InventoryIntegration,
    DjinnStat,
    CommunityStat,
    InventoryItem,
    StatsConfig,
    SummoningProofs,
} from 'types/GameMechanics';
import { joinCircle, MU_ACTIVATE_JINNI, qu, JoinParams } from 'utils/api';
import { debug, track } from 'utils/logging';
import { obj } from 'types/UserConfig';

export const ITEM_ID = 'MaliksMajik';
export const ABILITY_EQUIP_MAJIK = 'equip-maliks-majik';
export const ABILITY_ACTIVATE_JINNI = 'activate-jinni';
export const ABILITY_MYSTIC_CRYPT = 'create-mystic-crypt';
export const ABILITY_JOIN_CIRCLE = 'join-summoning-circle';

const joinMasterDjinnCircle = joinCircle(ABILITY_EQUIP_MAJIK, async ({ signature }) => {
    if (MAJIK_CARDS.find((mjq: string) => mjq === signature.etherAddress))
        return {
            isValid: false,
            message: 'Jubmoji is not a Master Djinn',
        };

    return {
        isValid: true,
        message: 'The Master Djinn approves you to play his Jinni game',
    };
});

const joinNpcCircle = joinCircle(ABILITY_JOIN_CIRCLE, async () => {
    return {
        isValid: true,
        message: 'Attested by Jinni to join their Summoning Circle!',
    };
});

const equip: HoF = async () =>
    joinMasterDjinnCircle({ playerId: (await getStorage<string>(ID_PLAYER_SLOT))! });
const doJoinCircle = async (params?: JoinParams) =>
    joinNpcCircle({ playerId: params?.playerId ?? (await getStorage<string>(ID_PLAYER_SLOT))! });

/// @notice DELETES ALL SUMMONING CIRCLES
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
        const proofs = await getStorage<SummoningProofs>(PROOF_MALIKS_MAJIK_SLOT);
        console.log('maliks majik check status', proofs);

        if (proofs?.[MALIKS_MAJIK_CARD]) return 'equipped';
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

                const myCircles = await getStorage<SummoningProofs>(PROOF_MALIKS_MAJIK_SLOT);
                // This means people can have Identity and contribute to communal jinn but not have personal jinn. Interesting
                if (!myCircles?.[MALIKS_MAJIK_CARD]) return 'unequipped';

                return 'ethereal';
            },
            do: async () => {
                track(ABILITY_ACTIVATE_JINNI, {
                    spell: ABILITY_ACTIVATE_JINNI,
                    activityType: 'initiated',
                });
                const myProof = await getStorage<SummoningProofs>(PROOF_MALIKS_MAJIK_SLOT);
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
                        throw Error('You have not been jumped into any Jinni gangs yet');
                    }

                    if (!myProof[MALIKS_MAJIK_CARD]) {
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
                        majik_msg: myProof[MALIKS_MAJIK_CARD].ether,
                        player_id: myId,
                    });

                    console.log('Mani:Jinni:ActivateJinn:Response', response);
                    const uuid = response?.data ? response.data.activate_jinni : null;
                    // server shouldnt allow multiple jinnis yet. Just in case dont overwrite existing uuid
                    const result = uuid && (await saveStorage<string>(ID_JINNI_SLOT, uuid, false));
                    console.log('Mani:Jinni:ActivateJinn:Result', result);

                    // TODO also upload settings again. just incase didnt work during onboarding for whatever reason

                    track(ABILITY_ACTIVATE_JINNI, {
                        spell: ABILITY_ACTIVATE_JINNI,
                        activityType: 'success',
                    });
                    return uuid ? true : false;
                } catch (e) {
                    console.log('Mani:Jinni:ActivateJinn:ERROR - ', e);
                    debug(e, {
                        tags: { api: true },
                        extra: { spell: ABILITY_ACTIVATE_JINNI },
                    });
                    return false;
                }
            },
        },
        {
            id: ABILITY_JOIN_CIRCLE,
            name: 'Join Summoning Circle',
            provider: ITEM_ID,
            symbol: '㊙',
            description: 'Join a community and contribute to a joint jinni with your friends',
            displayType: 'none',
            canDo: async () => {
                const addy = await getStorage(ID_PLAYER_SLOT);
                if (!addy) return 'ethereal';
                // only require spellbook, dont need master djinn equipped
                return 'equipped';
            },
            do: doJoinCircle,
        },
        {
            id: ABILITY_MYSTIC_CRYPT,
            name: 'Create Mystic Crypt',
            provider: ITEM_ID,
            symbol: '🏦',
            description:
                "Save game progress to your phone'scloud storage to restore account if you lose your phone",
            displayType: 'none',
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
                    return success;
                } catch (e) {
                    console.log('Mani:Jinni:MysticCrypt:ERROR --', e);
                    return false;
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
            do: async () => true,
        }),
        // TODO add speak intentions as widget. displayType 'avatar'
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

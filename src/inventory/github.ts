import {
    InventoryIntegration,
    DjinnStat,
    SpiritStat,
    CommunityStat,
    IntelligenceStat,
    InventoryItem,
    ItemStatus,
    Resource,
} from 'types/GameMechanics';
import { cleanGql, qu } from 'utils/api';
import { ID_PLAYER_SLOT, ID_PROVIDER_IDS_SLOT, getStorage } from 'utils/config';
import { debug, track } from 'utils/logging';
import { getProviderId } from 'utils/oauth';
import { equip as _equip, unequip as _unequip } from './_oauth';

export const ITEM_ID = 'Github';
export const ABILITY_SYNC_REPOS = 'github-sync-repos';
export const ABILITY_TRACK_COMMITS = 'github-sync-commits';

const equip = _equip(ITEM_ID);
const unequip = _unequip(ITEM_ID);
const item: InventoryItem = {
    id: ITEM_ID,
    name: ITEM_ID,
    dataProvider: ITEM_ID,
    image: 'https://pngimg.com/uploads/github/github_PNG90.png',
    tags: ['digital', 'productivity'],
    attributes: [
        { ...DjinnStat, value: 1 },
        { ...CommunityStat, value: 5 },
        { ...SpiritStat, value: 5 },
        { ...IntelligenceStat, value: 20 },
    ],
    checkStatus: async () => {
        const pid = await getStorage(ID_PLAYER_SLOT);
        console.log('Inv:Spotify:checkStatus', pid);
        if (!pid && !__DEV__) return 'ethereal'; // allow to interact in dev even if cant equip
        // TODO api request to see if access_token exist on API
        const cached = (await getStorage<{ [provider: string]: string }>(ID_PROVIDER_IDS_SLOT))?.[
            ITEM_ID
        ];
        console.log(
            'sync id res',
            cached,
            await getStorage<{ [provider: string]: string }>(ID_PROVIDER_IDS_SLOT),
        );

        // return 'unequipped';
        return cached ? 'equipped' : 'unequipped';
    },
    canEquip: async () => ((await getStorage(ID_PLAYER_SLOT)) ? true : false),
    equip,
    unequip,
    abilities: [
        {
            id: ABILITY_SYNC_REPOS,
            name: 'Add Repos',
            symbol: '💻',
            description: 'Give your jinni access to your code repos to learn from your daily adds',
            provider: ITEM_ID,
            displayType: 'none',
            canDo: async (status: ItemStatus) => (status === 'equipped' ? 'idle' : 'unequipped'),
            do: async () => {
                track(ABILITY_SYNC_REPOS, {
                    spell: ABILITY_SYNC_REPOS,
                    activityType: 'initiated',
                });
                const pid = await getStorage<string>(ID_PLAYER_SLOT);
                if (!pid) {
                    track(ABILITY_SYNC_REPOS, {
                        spell: ABILITY_SYNC_REPOS,
                        activityType: 'unauthenticated',
                    });
                    return false;
                }

                try {
                    // ensure provider id to pull
                    const providerId = await getProviderId({ playerId: pid, provider: ITEM_ID });
                    if (!providerId) {
                        track(ABILITY_SYNC_REPOS, {
                            spell: ABILITY_SYNC_REPOS,
                            activityType: 'unequipped',
                            providerId,
                            success: false,
                        });
                        return false;
                    }

                    const response = await qu<{ data: { sync_repos: Resource[] } }>({
                        mutation: cleanGql(`
                            mutation sync_repos(
                                $player_id: String!,
                                $provider: String!,
                                $verification: SignedRequest
                            ) {
                                sync_repos(
                                    verification: $verification,
                                    provider: $provider,
                                    player_id: $player_id
                                ) {
                                    provider_id
                                    name
                                    url
                                }
                            }
                    `),
                    })({ player_id: pid, provider: ITEM_ID });
                    track(ABILITY_SYNC_REPOS, {
                        spell: ABILITY_SYNC_REPOS,
                        activityType: 'completed',
                        provider: providerId,
                    });
                    console.log('inv;Github:sync-repos:res', response);

                    return response?.data?.sync_repos ? true : false;
                } catch (e) {
                    debug(e, {
                        extra: { spell: ABILITY_SYNC_REPOS },
                        tags: { ability: true },
                    });

                    return false;
                }
            },
        },
        {
            id: ABILITY_TRACK_COMMITS,
            name: 'Track Commits',
            symbol: '💻',
            description: 'Jinni will learn from what you have been working on',
            provider: ITEM_ID,
            displayType: 'none',
            canDo: async (status: ItemStatus) => (status === 'equipped' ? 'idle' : 'unequipped'),
            do: async () => {
                track(ABILITY_TRACK_COMMITS, {
                    spell: ABILITY_TRACK_COMMITS,
                    activityType: 'initiated',
                });
                const pid = await getStorage<string>(ID_PLAYER_SLOT);
                if (!pid) {
                    track(ABILITY_TRACK_COMMITS, {
                        spell: ABILITY_TRACK_COMMITS,
                        activityType: 'unauthenticated',
                    });
                    return false;
                }

                try {
                    // ensure provider id to pull
                    const providerId = await getProviderId({ playerId: pid, provider: ITEM_ID });
                    if (!providerId) {
                        track(ABILITY_TRACK_COMMITS, {
                            spell: ABILITY_TRACK_COMMITS,
                            activityType: 'unequipped',
                            providerId,
                            success: false,
                        });
                        return false;
                    }

                    const response = await qu<{ data: { sync_repos: Resource[] } }>({
                        mutation: cleanGql(`
                            mutation track_commits(
                                $player_id: String!,
                                $provider: String!,
                                $verification: SignedRequest
                            ) {
                                track_commits(
                                    verification: $verification,
                                    provider: $provider,
                                    player_id: $player_id
                                )
                            }
                    `),
                    })({ player_id: pid, provider: ITEM_ID });
                    track(ABILITY_TRACK_COMMITS, {
                        spell: ABILITY_TRACK_COMMITS,
                        activityType: 'success',
                        provider: providerId,
                    });
                    console.log('inv;Github:sync-repos:res', response);

                    return response?.data?.sync_repos ? true : false;
                } catch (e) {
                    debug(e, {
                        extra: { spell: ABILITY_TRACK_COMMITS },
                        tags: { ability: true },
                    });

                    return false;
                }
            },
        },
    ],
    widgets: [],
};

const initPermissions = async () => {
    return true;
};
const getPermissions = async () => {
    return true;
};

export default {
    item,
    checkEligibility: async () => true,
    equip,
    unequip,
    getPermissions,
    initPermissions,
} as InventoryIntegration;

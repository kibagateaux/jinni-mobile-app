import { Platform, Share } from 'react-native';
import { cleanGql, qu } from 'utils/api';
import { getProviderId } from 'utils/oauth';

import {
    InventoryIntegration,
    DjinnStat,
    SpiritStat,
    CommunityStat,
    IntelligenceStat,
    InventoryItem,
    ItemStatus,
    HoF,
    // eslint-ignore-next-line
    // Resource,
} from 'types/GameMechanics';
import {
    ID_PLAYER_SLOT,
    ID_PROVIDER_IDS_SLOT,
    TRACK_SHARE_CONTENT,
    getStorage,
} from 'utils/config';
import { debug, track } from 'utils/logging';
import { obj } from 'types/UserConfig';

const ITEM_ID = 'Spotify';
const ABILITY_SHARE_PROFILE = 'spotify-share-profile';
const ABILITY_SHARE_PLAYLIST = 'spotify-share-playlist';
const WIDGET_PIN_PLAYLIST = 'spotify-pin-playlist';

const equip: HoF = async (promptAsync) => {
    console.log('equipping spotiyfy!!!');
    try {
        // expo-auth-session only exposes API via hooks which we cant embed in this since its a conditional call
        // should we roll our own OAuth lib or just keep this callback method?
        // Slightly complicates equip() vs no params but also enables a ton of functionality for any item
        await promptAsync!();

        // TODO send mu(syncProvideId). If call fails then login unsuccessful
        return true;
    } catch (e) {
        console.log('Inv:spotify:equip:ERR', e);
        return false;
    }
};

const unequip: HoF = async () => {
    console.log('unequip spotify!!!');
    try {
        // TODO call api to delete identity
        return true;
    } catch (e) {
        console.log('Inv:spotify:equip:ERR', e);
        return false;
    }
};

const item: InventoryItem = {
    id: ITEM_ID,
    name: "Horn o' Vibranium",
    dataProvider: ITEM_ID,
    image: 'https://w7.pngwing.com/pngs/420/432/png-transparent-spotify-logo-spotify-computer-icons-podcast-music-apps-miscellaneous-angle-logo-thumbnail.png',
    tags: ['digital', 'music', 'social'],
    installLink: 'https://www.spotify.com/us/download/',
    attributes: [
        { ...DjinnStat, value: 1 },
        { ...CommunityStat, value: 10 },
        { ...SpiritStat, value: 20 },
        { ...IntelligenceStat, value: 5 },
    ],
    checkStatus: async () => {
        const pid = await getStorage(ID_PLAYER_SLOT);
        console.log('Inv:Spotify:checkStatus', pid);
        if (!pid && !__DEV__) return 'ethereal'; // allow to interact in dev even if cant equip
        const cached = (await getStorage<obj>(ID_PROVIDER_IDS_SLOT))?.[ITEM_ID];
        console.log('Inv:Spotify:checkStatus', cached);
        // TODO could make api request to see if access_token exist on API but ID should be saved on equip
        // only irrelevant if logging in old account to new device.
        // return 'unequipped';
        return cached ? 'equipped' : 'unequipped';
    },
    canEquip: async () => ((await getStorage(ID_PLAYER_SLOT)) ? true : false),
    equip,
    unequip,
    abilities: [
        {
            id: ABILITY_SHARE_PLAYLIST,
            name: 'Share Playlist',
            symbol: '🎶',
            description: 'Share a playlist on Spotify with another player',
            provider: ITEM_ID,
            displayType: 'none',
            canDo: async (status: ItemStatus) => (status === 'equipped' ? 'idle' : 'unequipped'),
            do: async () => {
                // const pid = await getStorage(ID_PLAYER_SLOT);
                // if (!pid) return async () => false;
                // try {
                //     const response = qu<Resource[]>({
                //         query: cleanGql(`
                //         query spotify_top_playlist(
                //             $verification: SignedRequest!
                //             $target_player: String!
                //         ) {
                //             spotify_top_playlist(
                //                 verification: $verification
                //                 target_player: $target_player
                //             ) {
                //                 id
                //                 name
                //                 href
                //             }
                //         }
                //     `),
                //     })({ player_id: pid });
                //     console.log('inv:Spotify:SharePlaylist:res', response);
                // } catch (e) {
                //     console.log('inv:Spotify:SharePlaylist:ERROR', e);
                // }
                // fetch their playlists from spotify
                // open modal
                // display playlists
                // player selects playlist
                // open phone native share/contacts module
                // player selects people to send to
                return async () => true;
            },
        },
        {
            id: ABILITY_SHARE_PROFILE,
            name: 'Share Profile',
            symbol: '🦹‍♂️',
            description: 'Share your Spotfiy profile with another player',
            provider: ITEM_ID,
            canDo: async (status: ItemStatus) => (status === 'equipped' ? 'idle' : 'unequipped'),
            displayType: 'none',
            do: async () => {
                console.log('Spotify:Ability:ShareProfile');
                track(TRACK_SHARE_CONTENT, {
                    spell: ABILITY_SHARE_PROFILE,
                    activityType: 'initiated',
                });
                const pid = await getStorage(ID_PLAYER_SLOT);
                console.log('Spotify:Ability:ShareProfile:pid', pid);
                if (!pid) {
                    track(TRACK_SHARE_CONTENT, {
                        spell: ABILITY_SHARE_PROFILE,
                        activityType: 'unauthenticated',
                        success: false,
                    });
                    return async () => false;
                }
                try {
                    console.log('Spotify:Ability:ShareProfile:get-id');
                    const providerId = await getProviderId({ playerId: pid, provider: ITEM_ID });
                    console.log('Spotify:Ability:ShareProfile:id', providerId);
                    if (!providerId) {
                        track(TRACK_SHARE_CONTENT, {
                            spell: ABILITY_SHARE_PROFILE,
                            activityType: 'unequipped',
                            providerId,
                            success: false,
                        });
                        return async () => false;
                    }
                    const profileUrl = `https://open.spotify.com/user/${providerId}`;
                    const { action, activityType } = await Share.share({
                        title: 'Tell your 🧞‍♂️ who to share your Spotify profile with ',
                        ...Platform.select({
                            ios: { message: 'My Spotify profile via Jinni 🧞‍♂️', url: profileUrl },
                            android: { message: `My Spotify profile via Jinni 🧞‍♂️ - ${profileUrl}` },
                            default: { message: `My Spotify profile via Jinni 🧞‍♂️ - ${profileUrl}` },
                        }),
                    });

                    console.log('Spotify:Ability:ShareProfile:share', action);
                    if (action === Share.sharedAction) {
                        track(TRACK_SHARE_CONTENT, {
                            spell: ABILITY_SHARE_PROFILE,
                            activityType: activityType ?? 'success',
                            providerId,
                            success: true,
                        });
                        return async () => true;
                    }

                    if (action === Share.dismissedAction) {
                        track(TRACK_SHARE_CONTENT, {
                            spell: ABILITY_SHARE_PROFILE,
                            activityType: 'dismissed',
                            providerId,
                        });
                        return async () => false;
                    }
                } catch (e: unknown) {
                    track(TRACK_SHARE_CONTENT, {
                        spell: ABILITY_SHARE_PROFILE,
                        activityType: 'failed',
                        success: false,
                    });
                    debug({
                        extra: { spell: ABILITY_SHARE_PROFILE },
                        tags: { ability: true },
                    });
                    return async () => false;
                }

                return async () => false;
            },
        },
        // {
        //     id: 'spotify-silent-disco',
        //     name: 'Silent Disco',
        //     symbol: '🪩',
        //     description: 'Create an IRL rave right now!',
        //     canDo: async (status: ItemStatus) => (status === 'equipped' ? 'idle' : 'unequipped'),
        //     do: async () => {

        //         // TODO cant just return func, need to return initial data + follow up. follow up neds to take object of data
        //         return async () => true;
        //     },
        // },
    ],
    widgets: [
        {
            id: WIDGET_PIN_PLAYLIST,
            name: 'Homepage Playlist',
            symbol: '💃',
            description:
                'Add a playlist to your homepage that will autoplay when people visit your profile',
            provider: ITEM_ID,
            canDo: async (status: ItemStatus) => (status === 'equipped' ? 'idle' : 'notdoable'),
            displayType: 'none',
            do: async <WidgetSettingInput>(params: WidgetSettingInput): Promise<HoF> => {
                console.log('playlist to pin', params);
                // TODO need a func for when widget pressed on profile which is diff then setting up widget
                // https://developer.spotify.com/documentation/ios/tutorials/content-linking
                // Linking.openUrl()
                return async () => false;
            },
            getOptions: async <Resource>() => {
                track(TRACK_SHARE_CONTENT, {
                    spell: WIDGET_PIN_PLAYLIST,
                    activityType: 'initiated',
                });
                const pid = await getStorage<string>(ID_PLAYER_SLOT);
                console.log('Spotify:Ability:PinPlaylist:pid', pid);
                if (!pid) {
                    track(TRACK_SHARE_CONTENT, {
                        spell: WIDGET_PIN_PLAYLIST,
                        activityType: 'unauthenticated',
                        success: false,
                    });
                    return;
                }
                try {
                    console.log('Spotify:Ability:PinPlaylist:get-id');
                    const providerId = await getProviderId({ playerId: pid, provider: ITEM_ID });
                    console.log('Spotify:Ability:PinPlaylist:id', providerId);
                    if (!providerId) {
                        track(TRACK_SHARE_CONTENT, {
                            spell: WIDGET_PIN_PLAYLIST,
                            activityType: 'unequipped',
                            providerId,
                            success: false,
                        });
                        return;
                    }
                    // TODO abstract out all ability/widget logic (id checks, tracking, etc.) and pass func with API calls with return values
                    const response = await qu<{ data: { get_playlists: Resource[] } }>({
                        query: cleanGql(`
                            query get_playlists(
                                $target_player: String!,
                                $provider: String!,
                                $verification: SignedRequest
                            ) {
                                get_playlists(
                                        target_player: $target_player,
                                        provider: $provider,
                                        verification: $verification
                                ) {
                                    name
                                    url
                                    image
                                }
                            }
                    `),
                    })({ target_player: pid, provider: ITEM_ID });
                    console.log('Spotify:Ability:PinPlaylist:id', providerId);
                    console.log('Spotify:Ability:PinPlaylist:res', response);

                    track(WIDGET_PIN_PLAYLIST, {
                        spell: WIDGET_PIN_PLAYLIST,
                        activityType: 'completed',
                        provider: providerId,
                    });
                    console.log('Spotify:Widget:PinPlaylist:res', response);

                    return response?.data?.get_playlists ?? null;
                } catch (e: unknown) {
                    track(TRACK_SHARE_CONTENT, {
                        spell: WIDGET_PIN_PLAYLIST,
                        activityType: 'failed',
                        success: false,
                    });
                    debug({
                        extra: { spell: WIDGET_PIN_PLAYLIST },
                        tags: { ability: true },
                    });
                    return;
                }
                // @DEV: Only Premium users can start Jams!
                // get players playlists with name, id
                // render list for them to select from
                // maybe generator is better devex but doesnt really support async values

                return;
            },
        },
    ],
};

// TODO should we abstract NFC Manager out of SignWithID so we can request permissions separately?
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

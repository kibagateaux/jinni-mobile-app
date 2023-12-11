import { Platform, Share } from 'react-native';
import { getProviderId } from 'utils/api';

import {
    InventoryIntegration,
    DjinnStat,
    SpiritStat,
    CommunityStat,
    IntelligenceStat,
    InventoryItem,
    ItemStatus,
    HoF,
} from 'types/GameMechanics';
import { SHARE_CONTENT, getPlayerId } from 'utils/config';
import { debug, track } from 'utils/logging';

const ABILITY_SHARE_PROFILE = 'spotify-share-profile';
const ABILITY_SHARE_PLAYLIST = 'spotify-share-playlist';
const WIDGET_PIN_PLAYLIST = 'spotify-pin-playlist';

const equip: HoF = async (promptAsync) => {
    console.log('equipping spotiyfy!!!');
    try {
        // expo-auth-session only exposes API via hooks which we cant embed in this since its a conditional call
        // should we roll our own OAuth lib or just keep this callback method?
        // Slightly complicates equip() vs no params but also enables a ton of functionality for any item
        promptAsync!();
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
    id: 'Spotify',
    name: "Horn o' Vibranium",
    datasource: 'Spotify',
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
        // TODO api request to see if access_token exist on API
        return 'unequipped';
    },
    canEquip: async () => true,
    equip,
    unequip,
    abilities: [
        {
            id: ABILITY_SHARE_PLAYLIST,
            name: 'Share Playlist',
            symbol: '🎶',
            description: 'Share a playlist on Spotify with another player',
            canDo: async (status: ItemStatus) => (status === 'equipped' ? true : false),
            do: async () => {
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
            canDo: async (status: ItemStatus) => (status === 'equipped' ? true : false),
            do: async () => {
                console.log('Spotify:Ability:ShareProfile');
                track(SHARE_CONTENT, {
                    ability: ABILITY_SHARE_PROFILE,
                    activityType: 'initiated',
                });
                const pid = await getPlayerId();
                console.log('Spotify:Ability:ShareProfile:pid', pid);
                if (!pid) return async () => false;
                try {
                    const providerId = await getProviderId(pid)('Spotify');
                    console.log('Spotify:Ability:ShareProfile:pid', providerId);
                    if (!providerId) {
                        track(SHARE_CONTENT, {
                            ability: ABILITY_SHARE_PROFILE,
                            activityType: 'unequipped',
                            providerId,
                        });
                    }
                    const profileUrl = `https://open.spotify.com/user/${providerId}`;
                    const { action, activityType } = await Share.share({
                        title: 'Tell your 🧞‍♂️ who to share your Spotify profile with ',
                        ...Platform.select({
                            ios: { message: 'My Spotify profile via Jinni', url: profileUrl },
                            android: { message: `My Spotify profile via Jinni - ${profileUrl}` },
                            default: { message: `My Spotify profile via Jinni - ${profileUrl}` },
                        }),
                    });

                    console.log('Spotify:Ability:ShareProfile:share', action);
                    if (action === Share.sharedAction) {
                        track(SHARE_CONTENT, {
                            ability: ABILITY_SHARE_PROFILE,
                            activityType: activityType ?? 'shared',
                            providerId,
                        });
                        return async () => true;
                    }

                    if (action === Share.dismissedAction) {
                        track(SHARE_CONTENT, {
                            ability: ABILITY_SHARE_PROFILE,
                            activityType: 'dismissed',
                            providerId,
                        });
                        return async () => false;
                    }
                } catch (e: unknown) {
                    track(SHARE_CONTENT, {
                        ability: ABILITY_SHARE_PROFILE,
                        activityType: 'failed',
                    });
                    debug({
                        extra: { ability: ABILITY_SHARE_PROFILE },
                        tags: { ability: true },
                    });
                    return async () => false;
                }

                return async () => false;
            },
        },
        {
            id: 'spotify-silent-disco',
            name: 'Silent Disco',
            symbol: '🪩',
            description: 'Create an IRL rave right now!',
            canDo: async (status: ItemStatus) => (status === 'equipped' ? true : false),
            do: async () => {
                // @DEV: Only Premium users can start Jams!
                // get players playlists with name, id
                // render list for them to select from

                // No api for jams. Deeplink into app with selected  playlist id
                // TODO cant just return func, need to return initial data + follow up. follow up neds to take object of data
                return async () => true;
            },
        },
    ],
    widgets: [
        {
            id: WIDGET_PIN_PLAYLIST,
            name: 'Homepage Playlist',
            symbol: '💃',
            description:
                'Add a playlist to your homepage that will autoplay when people visit your profile',
            canDo: async (status: ItemStatus) => (status === 'equipped' ? true : false),
            do: async () => {
                // fetch their playlists from spotify
                // open modal
                // display playlists
                // player selects playlist
                // open phone native share/contacts module
                // player selects people to send to
                return async () => true;
            },
            // TODO need a func for when widget pressed on profile which is diff then setting up widget
            // https://developer.spotify.com/documentation/ios/tutorials/content-linking
            // Linking.openUrl()
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

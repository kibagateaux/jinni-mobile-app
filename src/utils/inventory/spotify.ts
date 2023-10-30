import {
    InventoryIntegration,
    DjinnStat,
    SpiritStat,
    CommunityStat,
    InventoryItem,
    ItemStatus,
    HoF,
} from 'types/GameMechanics';

const equip: HoF = async (promptAsync) => {
    console.log('equipping spotiyfy!!!');
    try {
        // expo-auth-session only exposes API via hooks which we cant embed in this since its a conditional call
        // should we roll our own OAuth lib or just keep this callback method?
        // Slightly complicates equip() vs no params but also enables a ton of functionality for any item
        promptAsync!();
        return true;
    } catch (e) {
        console.log('Inv:spotify:equip:ERR', e);
        return false;
    }
};

const unequip: HoF = async () => {
    console.log('unequip spotify!!!');
    try {
        return true;
    } catch (e) {
        console.log('Inv:spotify:equip:ERR', e);
        return false;
    }
};

const item: InventoryItem = {
    id: 'Spotify',
    name: "Da Bumpin Horn o' Vibranium",
    datasource: 'Spotify',
    image: 'https://w7.pngwing.com/pngs/420/432/png-transparent-spotify-logo-spotify-computer-icons-podcast-music-apps-miscellaneous-angle-logo-thumbnail.png',
    installLink: 'https://www.spotify.com/us/download/',
    attributes: [
        { ...DjinnStat, value: 1 },
        { ...CommunityStat, value: 10 },
        { ...SpiritStat, value: 20 },
    ],
    checkStatus: async () => {
        // TODO figure out auth lol
        // lookup local storage or server for access/refresh token
        // const hasToken = await AsyncStorage.getItem('spotify-access-token');
        // if(proof) return 'equipped';
        return 'unequipped';
    },
    canEquip: async () => true,
    equip,
    unequip,
    abilities: [
        {
            id: 'spotify-share-playlist',
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
            id: 'spotify-share-profile',
            name: 'Share Profile',
            symbol: '🦹‍♂️',
            description: 'Share your Spotfiy profile with another player',
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

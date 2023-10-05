import { Platform } from 'react-native';
import {
    InventoryIntegration,
    JinniStat,
    SpiritStat,
    CommunityStat,
    InventoryItem,
} from 'types/GameMechanics';

const equip = async (promptAsync) => {
    console.log("equipping spotiyfy!!!");
    try {
        promptAsync();
    } catch(e) {
        console.log("Inv:spotify:equip:ERR", e);
        return false;
    }
}

const unequip = async () => {
    console.log("unequip spotify!!!");
    try {

    } catch(e) {
        console.log("Inv:spotify:equip:ERR", e);
        return false;
    }
}


const item = {
    id: "spotify",
    name: "Da Bumpin Horn o' Vibranium",
    dataSourceProvider: "spotify",
    image: "https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green-768x231.png",
    installLink: "https://www.spotify.com/us/download/",
    attributes: [
        { ...JinniStat, value: 1 },
        { ...CommunityStat, value: 10 },
        { ...SpiritStat, value: 20 },
    ],
    checkStatus: async () => {
        // lookup local storage or server for access/refresh token
        // const hasToken = await AsyncStorage.getItem('spotify-access-token');
        // if(proof) return 'equipped';
        return 'unequipped';
    },
    canEquip: async () => true,
    equip,
    unequip,
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
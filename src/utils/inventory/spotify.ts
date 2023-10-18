import { Platform } from 'react-native';
import {
    InventoryIntegration,
    DjinnStat,
    SpiritStat,
    CommunityStat,
    InventoryItem,
} from 'types/GameMechanics';

const equip = async (promptAsync) => {
    console.log("equipping spotiyfy!!!");
    try {
        // expo-auth-session only exposes API via hooks which we cant embed in this since its a conditional call
        // should we roll our own OAuth lib or just have this callback method?
        // Slightly complicates equip() vs no params but also enables a ton of functionality for any item with callback
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
    datasource: "spotify",
    image: "https://w7.pngwing.com/pngs/420/432/png-transparent-spotify-logo-spotify-computer-icons-podcast-music-apps-miscellaneous-angle-logo-thumbnail.png",
    installLink: "https://www.spotify.com/us/download/",
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
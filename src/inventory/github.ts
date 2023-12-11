import {
    InventoryIntegration,
    DjinnStat,
    SpiritStat,
    CommunityStat,
    IntelligenceStat,
    InventoryItem,
    HoF,
} from 'types/GameMechanics';

const equip: HoF = async (promptAsync) => {
    console.log('equipping github!!!');
    try {
        // expo-auth-session only exposes API via hooks which we cant embed in this since its a conditional call
        // should we roll our own OAuth lib or just keep this callback method?
        // Slightly complicates equip() vs no params but also enables a ton of functionality for any item
        promptAsync!();
        // TODO send mu(syncProvideId). If call fails then login unsuccessful
        return true;
    } catch (e) {
        console.log('Inv:github:equip:ERR', e);
        return false;
    }
};

const unequip: HoF = async () => {
    console.log('unequip github!!!');
    try {
        // TODO call api to delete identity
        return true;
    } catch (e) {
        console.log('Inv:github:equip:ERR', e);
        return false;
    }
};

const item: InventoryItem = {
    id: 'Github',
    name: 'Octopus Brains',
    datasource: 'Github',
    image: 'https://pngimg.com/uploads/github/github_PNG90.png',
    tags: ['digital', 'productivity'],
    attributes: [
        { ...DjinnStat, value: 1 },
        { ...CommunityStat, value: 5 },
        { ...SpiritStat, value: 5 },
        { ...IntelligenceStat, value: 20 },
    ],
    checkStatus: async () => {
        // TODO api request to see if access_token exist on API
        return 'unequipped';
    },
    canEquip: async () => true,
    equip,
    unequip,
    abilities: [],
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

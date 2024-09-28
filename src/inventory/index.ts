import axios from 'axios';
import { Platform } from 'react-native';
// import { reduce } from 'lodash/fp';
// import { readDirectoryAsync } from 'expo-file-system';

// TODO read directory file names and generate export object with inventory ids for easier consumption
import iosHealth from './ios-health-kit';
import iwatchHealth from './iwatch-health-kit';
import androidHealth from './android-health-connect';
import maliksMajik from './maliks-majik';
import spotify from './spotify';
import github from './github';
// import locationForeground from './phone-location-foreground';
// import locationBackground from './phone-location-background';

import { getAppConfig, getNetworkState, isMobile } from 'utils/config';

import { InventoryItem, ItemStatus } from 'types/GameMechanics';

// TODO
// const inventoryDirectory = path.join(__dirname, '/utils/inventory');
// console.log('get all inventory items', __dirname);
// const inventoryFiles = fs.readdirSync(__dirname);
// // console.log('get all inventory items', inventoryFiles);
// const allFiles = readDirectoryAsync(__dirname);
// const allInventoryItems: { [key: string]: InventoryItem } = reduce((acc, file) => {
//     const item = require(path.join(__dirname, file)).item;
//     return item ? { ...acc, [item.id]: item } : acc;
// }, {})(inventoryFiles)();

const checkItemHasStatus =
    (status: ItemStatus) =>
    async (item: InventoryItem): Promise<boolean> =>
        (await item.checkStatus()) === status;

export const isEquipped = checkItemHasStatus('equipped');
export const isEquipping = checkItemHasStatus('equipping');
export const isUnequipped = checkItemHasStatus('unequipped');

export const getInventoryItems = async (username?: string): Promise<InventoryItem[]> => {
    const platformInventoryItems: InventoryItem[] = getPlatformItems(Platform.OS);
    // not logged in to get personalizations
    if (!username) return platformInventoryItems;
    // no internet access to send request
    if (!(await getNetworkState()).isNoosphere) return platformInventoryItems;

    return axios
        .get(`${getAppConfig().API_URL}/scry/inventory/${username}`)
        .then((response) => {
            console.log('inventory response', response);
            // TODO filter response for current platform
            return response.data as InventoryItem[];
        })
        .catch((error) => {
            console.error(error);
            return [];
        });
};

// items that can be equipd via web browser even if app not installed
export const coreInventory = [spotify.item, github.item];
// any data that can come directly from local device
export const mobileInventory: InventoryItem[] = [
    ...coreInventory,
    maliksMajik.item, // tricky bc technically works on web if on mobile phone
    // locationForeground.item,
    // locationBackground, // Dont need feature yet and it adds admin overhead for app review
];
export const iosInventory = [...mobileInventory, iosHealth.item, iwatchHealth.item];
export const androidInventory = [...mobileInventory, androidHealth.item];

// pulled into its own function instead of Platform.select because thats a bitch to stub in tests
export const getPlatformItems = (platform: string): InventoryItem[] => {
    switch (platform) {
        case 'ios':
            return iosInventory;
        case 'android':
            return androidInventory;
        case 'web':
            // assume mobile browser based on screen size and allow non-native phone items e.g. NFC cards
            return isMobile() ? mobileInventory : coreInventory;
        default:
            return coreInventory;
    }
};

// TODO read directory file names and generate export object with inventory ids for easier consumption
export default {
    getInventoryItems,
    iosHealth,
    androidHealth,
    iwatchHealth,
    maliksMajik,
    spotify,
};

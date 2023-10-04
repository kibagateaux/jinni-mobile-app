import { Platform } from 'react-native';
import axios from 'axios';

// TODO read directory file names and generate export object with inventory ids for easier consumption
import iosHealth from './ios-health-kit';
import androidHealth from './android-health-connect';
import maliksMajik from './maliks-majik';

import { getAppConfig } from 'utils/config';


import {
    InventoryItem,
    ItemStatus,
    JinniStat,
    HealthStat,
    CommunityStat,
    IntelligenceStat,
} from 'types/GameMechanics';


const checkItemHasStatus = (status: ItemStatus) =>
    async (item: InventoryItem): Promise<boolean> =>
        (await item.checkStatus()) === status;

export const isEquipped = checkItemHasStatus('equipped');
export const isEquipping = checkItemHasStatus('equipping');
export const isUnequipped = checkItemHasStatus('unequipped');


const getInventoryItems = async (username?: string): Promise<InventoryItem[]>=> {
    console.group("getInventoryItems user/platform : ", username, Platform.OS);
    const coreInventory = [
        maliksMajik.item,
    ]
    // any data that can come directly from local device
    const platformInventoryItems: InventoryItem[] = Platform.select({
        ios: [
            ...coreInventory,
            {
                id: "iphone-health-kit",
                name: "iPhone Health Kit",
                dataSourceProvider: "ios-health-kit",
                image: "https://www.apple.com/v/ios/ios-13/images/overview/health/health_hero__fjxh8smk2q6q_large_2x.jpg",
                installLink: "https://apps.apple.com/us/app/health/id1206187994",
                attributes: [
                    { ...JinniStat, value: 5 },
                    { ...HealthStat, value: 5 },
                    { ...IntelligenceStat, value: 2 },
                ],
                checkStatus: async () => {
                    // TODO
                    return 'unequipped';
                },
                canEquip: async () => true,
                // equip: () => {} ,
                // unequip: () => {} ,
                // actions: [],
            },
            {
                id: "iwatch-health-kit",
                name: "iWatch Health Kit",
                dataSourceProvider: "iwatch-health-kit",
                image: "https://www.apple.com/v/ios/ios-13/images/overview/health/health_hero__fjxh8smk2q6q_large_2x.jpg",
                installLink: "https://apps.apple.com/us/app/health/id1206187994",
                attributes: [
                    { ...JinniStat, value: 15 },
                    { ...HealthStat, value: 10 },
                    { ...IntelligenceStat, value: 2 },
                ],
                checkStatus: async () => {
                    // TODO
                    return 'unequipped';
                },
                canEquip: async () => true,
                // equip: () => {} ,
                // unequip: () => {} ,
                // actions: [],
            },
        ],
        android: [
            ...coreInventory,
            androidHealth.item,
        ],
        default: [] // nothing for web
    });
    
    if(!username) return platformInventoryItems;

    return axios.get(`${getAppConfig().API_URL}/scry/inventory/${username}`)
        .then((response) => {
            console.log("inventory response", response)
            return response.data as InventoryItem[];
        })
        .catch((error: any) => {
            console.error(error);
            return [];
        });
}

// TODO read directory file names and generate export object with inventory ids for easier consumption
export default {
    iosHealth,
    androidHealth,
    getInventoryItems,
};
import {Platform} from 'react-native';
import axios from 'axios';

import {
    InventoryItem,
    JinniStat,
    HealthStat,
    CommunityStat,
    IntelligenceStat,
} from '../types/GameMechanics';
import { getConfig } from 'expo/config';

import { ID_ANON_SLOT, PROOF_MASTER_DJINN_SLOT, getId, saveId, signWithId } from './zkpid';

type AppConfig = {
    API_URL: string;
    API_KEY: string;
}


export const getAppConfig = (): AppConfig => ({
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
    API_KEY: process.env.EXPO_PUBLIC_API_KEY || 'test-api-key'
});


type UserConfig = {
    getInventoryItems: (username?: string) => Promise<InventoryItem[]>;
}


export const getInventoryItems = async (username?: string): Promise<InventoryItem[]>=> {
    console.group("getInventoryItems", username, Platform.OS);
    const coreInventory = [
        {
            id: "master-djinn-summoning-circle",
            name: "Master Djinn Summoning Circle",
            image: "https://cdn.drawception.com/drawings/3yyv096cK5.png",
            attributes: [
                { ...JinniStat, value: 10 },
                { ...CommunityStat, value: 10 },
            ],
            isEquipped: async () => (await getId(PROOF_MASTER_DJINN_SLOT)) !== null,
            dataSourceProvider: "master-djinn-card",
            equip: () => {
                console.log("summoning master djinn!!!");
                return signWithId(ID_ANON_SLOT).then((signature) => {
                    console.log("Inventory: equipped master djinn", signature);
                    // ensure signature is valid ?
                    // send to our server for storage or some
                    // save signature to local storage for later authentication
                    signature && saveId(PROOF_MASTER_DJINN_SLOT, signature);
                    return true;
                })
                .catch((err) => {
                    console.log("ERR: summoning master djinn", err);
                    return false;
                });
            }
            // unequip: () => {} ,
            // actions: [],
        },  
    ]
    // any data that can come directly from local device
    const platformInventoryItems: InventoryItem[] = Platform.select({
        ios: [
            ...coreInventory,
            {
                id: "iphone-health-kit",
                name: "iPhone Health Kit",
                image: "https://www.apple.com/v/ios/ios-13/images/overview/health/health_hero__fjxh8smk2q6q_large_2x.jpg",
                installLink: "https://apps.apple.com/us/app/health/id1206187994",
                attributes: [
                    { ...JinniStat, value: 5 },
                    { ...HealthStat, value: 5 },
                    { ...IntelligenceStat, value: 2 },
                ],
                isEquipped: async () => false,
                // equip: () => {} ,
                // unequip: () => {} ,
                // actions: [],
                dataSourceProvider: "ios-health-kit",
            },
            {
                id: "iwatch-health-kit",
                name: "iWatch Health Kit",
                image: "https://www.apple.com/v/ios/ios-13/images/overview/health/health_hero__fjxh8smk2q6q_large_2x.jpg",
                installLink: "https://apps.apple.com/us/app/health/id1206187994",
                attributes: [
                    { ...JinniStat, value: 15 },
                    { ...HealthStat, value: 10 },
                    { ...IntelligenceStat, value: 2 },
                ],
                isEquipped: async () => false,
                // equip: () => {} ,
                // unequip: () => {} ,
                // actions: [],
                dataSourceProvider: "iwatch-health-kit",
            },
        ],
        android: [
            ...coreInventory,
            {
                id: "android-health-connect",
                name: "Android Health Connect",
                image: "https://www.apple.com/v/ios/ios-13/images/overview/health/health_hero__fjxh8smk2q6q_large_2x.jpg",
                installLink: "https://play.google.com/store/apps/details?id=com.healthconnectapp.healthconnect&hl=en_US&gl=US",
                attributes: [
                    { ...JinniStat, value: 5 },
                    { ...HealthStat, value: 5 },
                    { ...IntelligenceStat, value: 2 },
                ],
                isEquipped: async () => false,
                // equip: () => {} ,
                // unequip: () => {} ,
                // actions: [],
                dataSourceProvider: "android-health-kit",
            },
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

export const getUserConfig: UserConfig = {
    getInventoryItems,
};
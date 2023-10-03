import { Platform } from "react-native";
import {
    getSdkStatus,
    openHealthConnectSettings,
    initialize,
    requestPermission,
    readRecords,
    revokeAllPermissions,
    getGrantedPermissions,
    SdkAvailabilityStatus,
} from 'react-native-health-connect';

import {
    InventoryIntegration,
    JinniStat,
    HealthStat,
    IntelligenceStat,
    InventoryItem,
} from 'types/GameMechanics';

import { PORTAL_DAY } from "utils/config";

const ANDROID_HEALTH_PERMISSIONS = [
    // summaries
    { accessType: 'read', recordType: 'Steps' },
    { accessType: 'read', recordType: 'Distance' },
    { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
    { accessType: 'read', recordType: 'TotalCaloriesBurned' },
    { accessType: 'read', recordType: 'ExerciseSession' },
    // { accessType: 'read', recordType: 'SleepSession' },
    { accessType: 'read', recordType: 'Hydration' },
    // physiological data
    // { accessType: 'read', recordType: 'BasalMetabolicRate' },
    // { accessType: 'read', recordType: 'BodyFat' },
    // { accessType: 'read', recordType: 'LeanBodyMass' },
    // { accessType: 'read', recordType: 'HeartRate' },
    // { accessType: 'read', recordType: 'RespiratoryRate' },
    { accessType: 'read', recordType: 'Weight' },
    // { accessType: 'read', recordType: 'RestingHeartRate' },
]

const checkEligibility = async (): Promise<boolean> => {
    if(Platform.OS !== 'android') return false;

    const status = await getSdkStatus();
    console.log("Inv:android-health-connect:checkEligibility: ", status);

    if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
        console.log('Android Health is not available on this device');
        // TODO link to Google play store link for download
        return false;
    }

    return true;
}

const getPermissions = async () => {
    try {
        if (!await checkEligibility()) {
            console.log('Android Health is not available on this device');
            // TODO link to Google play store link for Health Connect app download
            return false;
        }
    } catch(e) {
        console.log("Inv:android-health-connect:checkElig: ", e);
        return false;
    }

    try {
        if(await getGrantedPermissions() !== ANDROID_HEALTH_PERMISSIONS) {
            console.log('Android Health is not available on this device');
            return false;
        }
        return true;
    } catch(e) {
        console.log("Inv:android-health-connect:getPerm: ", e);
        return false;
    }
}
  
const initPermissions = async () => {
    console.log("Inv:andoird-health-connect:Init");
    const isInitialized = await initialize();
    if(!isInitialized) throw Error("Unable Anddroid Health  to initialize");
    const permissions = await requestPermission(ANDROID_HEALTH_PERMISSIONS);
    return true;
}
 
const equip = async () => {
    if(!checkEligibility()) return false;

    try {
        await initPermissions();

        // todo abstract to utils function
        // getStepCount();
        
        return true;
    } catch (error) {
        console.log('Error requesting permissions: ', error);
        return false;
    }

}


const unequip = async () => {
    await revokeAllPermissions();
    // TODO: Implement unequip functionality
    console.log('Unequip called');
    return true;
}

const queryHealthData = async ({ activity, operator, startTime, endTime }: QueryAndroidHealthDataProps) => {
    // TODO abstract to utils
    const records = await readRecords(activity, {
        timeRangeFilter: {
            operator,
            startTime: startTime ?? PORTAL_DAY ,
            endTime: endTime ?? Date.now().toLocaleString(),
        },
    });
    console.log("Android Health Steps", records);

    return records;
}

const item = {
    id: "android-health-connect",
    name: "Android Health Connect",
    dataSourceProvider: "android-health-connect",
    image: "https://play-lh.googleusercontent.com/EbzDx68RZddtIMvs8H8MLcO-KOiBqEYJbi_kRjEdXved0p3KXr0nwUnLUgitZ5kQVWVZ=w480-h960-rw",
    installLink: "https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata",
    attributes: [
        { ...JinniStat, value: 5 },
        { ...HealthStat, value: 5 },
        { ...IntelligenceStat, value: 2 },
    ],
    checkStatus: async () => {
        const isInstalled = await checkEligibility();
        console.log("Inv:android-health-connect:checkStatus:", isInstalled)
        if(!isInstalled) return "ethereal";

        const isEquipped = await getPermissions() ;
        if(isEquipped) return 'equipped';

        // if getPermissions() permissions have been revoked 
        // return 'destroyed';
        // TODO
        // see if health connect is installed
        return 'unequipped';
    },
    // must have app installed but not equipped yet
    canEquip: async () => (await checkEligibility()) === true && (await getPermissions() === false),
    equip,
    unequip,
    // actions: [],
}

export default {
    item,
    checkEligibility,
    getPermissions,
    initPermissions,
    equip,
    unequip,
} as InventoryIntegration;
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
    DjinnStat,
    HealthStat,
    IntelligenceStat,
    InventoryItem,
} from 'types/GameMechanics';

import { PORTAL_DAY } from "utils/mayanese";

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
        console.log("Inv:android-health-connect:checkElig: NOT ELIIGBLE", );
        // TODO link to Google play store link for download
        return false;
    }

     // @dev MUST always init first thing otherwise any SDK calls including getPermissions fails.
     // we always call checkEligibilty before anything else so all gucci.
    const isInitialized = await initialize();
    if(!isInitialized) throw Error("Unable Anddroid Health to initialize");

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
        const grantedPerms = await getGrantedPermissions();
        console.log("Inv:android-health-connect:getPerm: GrantedPerms ", grantedPerms);

        // if(grantedPerms !== ANDROID_HEALTH_PERMISSIONS) {
        if(grantedPerms.length === 0) {
            console.log("Inv:android-health-connect:getPerm: NO PERMISSIONS");
            return false;
        }
        return true;
    } catch(e) {
        console.log("Inv:android-health-connect:getPerm: ", e);
        return false;
    }
}
  
const initPermissions = async () => {
    checkEligibility();
    console.log("Inv:andoird-health-connect:Init");
    const permissions = await requestPermission(ANDROID_HEALTH_PERMISSIONS);
    console.log("Inv:android-health-connect:Init: Permissions Granted!", permissions);
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

const item = {
    id: "android-health-connect",
    name: "Cyborg Repair Pack",
    dataSourceProvider: "android-health-connect",
    image: "https://play-lh.googleusercontent.com/EbzDx68RZddtIMvs8H8MLcO-KOiBqEYJbi_kRjEdXved0p3KXr0nwUnLUgitZ5kQVWVZ=w480-h960-rw",
    installLink: "https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata",
    attributes: [
        { ...DjinnStat, value: 5 },
        { ...HealthStat, value: 10 },
        { ...IntelligenceStat, value: 2 },
    ],
    checkStatus: async () => {
        const isInstalled = await checkEligibility();
        console.log("Inv:android-health-connect:checkStatus: installed?", isInstalled)
        if(!isInstalled) return "ethereal";
        
        const isEquipped = await getPermissions() ;
        console.log("Inv:android-health-connect:checkStatus: equipped?", isEquipped)
        if(isEquipped) return 'equipped';
        
        // if getPermissions() permissions have been revoked 
        // return 'destroyed';
        // TODO
        // see if health connect is installed
        console.log("Inv:android-health-connect:checkStatus: unequipped!", isEquipped)
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

/**
 * @desc - Query Android health data from phone
 * @dev - Custom Item Function
 * @param 
 * @returns HealthRecords[]
 */
export const queryHealthData = async ({ activity, operator, startTime, endTime }: QueryAndroidHealthDataProps) => {
    // TODO abstract to utils
    const records = await readRecords(activity, {
        timeRangeFilter: {
            operator,
            startTime: startTime ?? PORTAL_DAY ,
            endTime: endTime ?? Date.now().toLocaleString(),
        },
    });
    // console.log("Android Health Steps", records);

    return records;
}
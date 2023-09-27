import { Platform } from "react-native";
import {
    getSdkStatus,
    openHealthConnectSettings,
    initialize,
    requestPermission,
    readRecords,
} from 'react-native-health-connect';
  import { InventoryIntegration } from 'types/GameMechanics';
  import { QueryDeviceHealthDataProps } from "types/HealthData";


  export const checkEligibility = async (): Promise<boolean> => {
    if(Platform.OS !== 'android') return false;

    const isAvailable = await getSdkStatus();
    if (!isAvailable) {
        console.log('Android Health is not available on this device');
        // TODO link to Google play store link for download
        return false;
    }

    return true;
  }

  export const getPermissions = async () => {
    const isAvailable = await getSdkStatus();
    if (!isAvailable) {
        console.log('Android Health is not available on this device');
        // TODO link to Google play store link for Health Connect app download
        return false;
    }
    // TODO check existing permissions
    return true;
  }
  
  export const initPermissions = async () => {
    const isInitialized = await initialize();
    const permissions = await requestPermission([
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
    ]);
    return true;
  }
 
  export const equip = async () => {
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


export const unequip = async () => {
    // TODO: Implement unequip functionality
    console.log('Unequip called');
    return true;
}

export const getStepCount = async (options: QueryDeviceHealthDataProps) => {
    // TODO abstract to utils
    const records = await readRecords('Steps', {
        timeRangeFilter: {
            operator: 'between',
            startTime: '2023-05-09T12:00:00.405Z',
            endTime: '2023-09-09T23:53:15.405Z',
        },
    });
    console.log("Android Health Steps", records);

    return records;
}

export default {
    checkEligibility,
    getPermissions,
    initPermissions,
    equip,
    unequip,
} as InventoryIntegration;
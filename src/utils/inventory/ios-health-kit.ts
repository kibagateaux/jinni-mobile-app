import { Platform } from 'react-native';
import AppleHealthKit, {
    HealthValue,
    HealthKitPermissions,
} from 'react-native-health'
import { InventoryIntegration } from 'types/GameMechanics';
import { QueryDeviceHealthDataProps } from "types/HealthData";

  /* Permission options */
const permissions = {
    permissions: {
        read: [
            // summaries
            AppleHealthKit.Constants.Permissions.Water,
            AppleHealthKit.Constants.Permissions.Steps,
            AppleHealthKit.Constants.Permissions.StepCount,
            AppleHealthKit.Constants.Permissions.ActivitySummary,
            AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
            // physiological data
            AppleHealthKit.Constants.Permissions.Weight,
            // AppleHealthKit.Constants.Permissions.BodyMass,
            // AppleHealthKit.Constants.Permissions.HeartRate,
            // AppleHealthKit.Constants.Permissions.LeanBodyMass,
            AppleHealthKit.Constants.Permissions.BodyMassIndex,
            // AppleHealthKit.Constants.Permissions.RespiratoryRate,
            // subjective data
            // AppleHealthKit.Constants.Permissions.Workout,
            // AppleHealthKit.Constants.Permissions.PeakFlow,
            // AppleHealthKit.Constants.Permissions.SleepAnalysis,
            // AppleHealthKit.Constants.Permissions.MindfulSession,
        ],
    },
} as HealthKitPermissions

export const checkEligibility = async (): Promise<boolean> => {
    if(Platform.OS !== 'ios') return false;

    return new Promise((resolve, reject) => {
        AppleHealthKit.isAvailable((err: Object, available: boolean) => {
            if (err) {
                console.log('error initializing Healthkit: ', err)
                reject(false);
            } else {
                // TODO check if we have permissions already
                resolve(true);
            }
        });
    });

    return true
}

export const getPermissions = async () => {
    return true;
}


export const initPermissions = async () => {
    // todo abstract to utils function  -
    // 1. check permissions
    // 2. if not granted, request permissions
    // 3. if not granted, open settings
    // 4. once granted, read records
    // 5. once read, send to API
   if(!checkEligibility()) return false;

    AppleHealthKit.initHealthKit(permissions, (error: string) => {
        /* Called after we receive a response from the system */
        if (error) {
            console.log('[ERROR] Cannot grant permissions!')
        }
    
        /* Can now read or write to HealthKit */
        getStepCount({
            startDate: new Date(2020, 1, 1).toISOString(),
        });

    })
};

export const equip = async () => {
    initPermissions();
    return true;
}

export const unequip = async () => {
    // TODO: Implement unequip functionality
    console.log('Unequip called');
    return true;
}

export const getStepCount = async (options: QueryDeviceHealthDataProps) => {
    // TODO abstract to utils
    AppleHealthKit.getStepCount(options, (err: Object, steps: HealthValue) => {
        console.log("Apple Health Steps", steps)
    })
}

export default {
    checkEligibility,
    getPermissions,
    initPermissions,
    equip,
    unequip,
} as InventoryIntegration;
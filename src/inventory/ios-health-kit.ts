import { Platform } from 'react-native';
import AppleHealthKit, { HealthValue, HealthKitPermissions } from 'react-native-health';
import { InventoryIntegration, HoF, InventoryItem } from 'types/GameMechanics';
import { QueryIosHealthDataProps } from 'types/GameData';

import { DjinnStat, HealthStat, IntelligenceStat } from 'types/GameMechanics';

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
} as HealthKitPermissions;

const checkEligibility = async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') return false;

    return new Promise((resolve, reject) => {
        AppleHealthKit.isAvailable((err: object, available: boolean) => {
            if (err) {
                console.log('error initializing Healthkit: ', err);
                return reject(false);
            }
            if (available) {
                // TODO check if we have permissions already
                return resolve(true);
            } else {
                return resolve(false);
            }
        });
    });
};

const getPermissions = async () => {
    return true;
};

const initPermissions = async () => {
    // todo abstract to utils function  -
    // 1. check permissions
    // 2. if not granted, request permissions
    // 3. if not granted, open settings
    // 4. once granted, read records
    // 5. once read, send to API
    if (!checkEligibility()) return false;

    AppleHealthKit.initHealthKit(permissions, (error: string) => {
        /* Called after we receive a response from the system */
        if (error) {
            console.log('[ERROR] Cannot grant permissions!');
        }

        /* Can now read or write to HealthKit */
        getStepCount({
            startDate: new Date(2020, 1, 1).toISOString(),
        });
    });
};

const equip: HoF = async () => {
    initPermissions();
    return true;
};

const unequip: HoF = async () => {
    // TODO: Implement unequip functionality
    console.log('Unequip called');
    return true;
};

const getStepCount = async (options: QueryIosHealthDataProps) => {
    // TODO abstract to utils
    AppleHealthKit.getStepCount(options, (err: object, steps: HealthValue) => {
        console.log('Apple Health Steps', steps);
    });
};

const item: InventoryItem = {
    id: 'IphoneHealthKit',
    name: 'iPhone Health Kit',
    dataProvider: 'ios-health-kit',
    image: 'https://www.apple.com/v/ios/ios-13/images/overview/health/health_hero__fjxh8smk2q6q_large_2x.jpg',
    installLink: 'https://apps.apple.com/us/app/health/id1206187994',
    attributes: [
        { ...DjinnStat, value: 5 },
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
};

export default {
    item,
    checkEligibility,
    getPermissions,
    initPermissions,
    equip,
    unequip,
} as InventoryIntegration;

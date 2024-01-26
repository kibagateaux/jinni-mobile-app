import { startOfDay, formatISO } from 'date-fns/fp';
import { keys, merge } from 'lodash';
import { sortBy, reduce } from 'lodash/fp';
import {
    getSdkStatus,
    // openHealthConnectSettings,// TODO figure out how to utilize this
    initialize,
    requestPermission,
    readRecords,
    revokeAllPermissions,
    getGrantedPermissions,
    SdkAvailabilityStatus,
} from 'react-native-health-connect';
import { Permission } from 'react-native-health-connect/types';
import { debug, track } from 'utils/logging';
import { TRACK_PERMS_REQUESTED, TRACK_DATA_QUERIED } from 'utils/config';

import {
    InventoryIntegration,
    DjinnStat,
    HealthStat,
    IntelligenceStat,
    InventoryItem,
    HoF,
} from 'types/GameMechanics';

import { PORTAL_DAY } from 'utils/mayanese';
import {
    AndroidHealthRecord,
    GetHealthDataProps,
    QueryAndroidHealthDataProps,
} from 'types/HealthData';
import { JsonMap } from '@segment/analytics-react-native';
import { Platform } from 'react-native';

const ITEM_ID = 'AndroidHealthConnect';
const PERMISSIONS = [
    // summaries
    { accessType: 'read', recordType: 'Steps' },
    { accessType: 'read', recordType: 'Distance' },
    { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
    { accessType: 'read', recordType: 'Hydration' },
    // { accessType: 'read', recordType: 'TotalCaloriesBurned' },
    // { accessType: 'read', recordType: 'ExerciseSession' },
    // { accessType: 'read', recordType: 'SleepSession' },
    // physiological data
    // { accessType: 'read', recordType: 'BasalMetabolicRate' },
    // { accessType: 'read', recordType: 'BodyFat' },
    // { accessType: 'read', recordType: 'LeanBodyMass' },
    // { accessType: 'read', recordType: 'HeartRate' },
    // { accessType: 'read', recordType: 'RespiratoryRate' },
    // { accessType: 'read', recordType: 'Weight' },
    // { accessType: 'read', recordType: 'RestingHeartRate' },
] as Permission[];

const checkEligibility = async (): Promise<boolean> => {
    // cant test anything in file if we run this.
    if (!__DEV__ && Platform.OS !== 'android') return false;
    if ((Platform.Version as number) >= 14) return false; // android Version always returns a numbe

    const status = await getSdkStatus();
    console.log(
        'Inv:AndroidHealthConnect:checkEligibility: ',
        status,
        SdkAvailabilityStatus.SDK_AVAILABLE,
    );

    if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
        console.log('Inv:AndroidHealthConnect:checkElig: NOT ELIIGBLE - ');
        // TODO link to Google play store link for download
        return false;
    }

    // @dev MUST always init first thing otherwise any SDK calls including getPermissions fails.
    // we always call checkEligibilty before anything else so all gucci.
    const isInitialized = await initialize();
    if (!isInitialized) throw Error('Unable to initialize Android Health');

    return true;
};

const getPermissions = async () => {
    if (!(await checkEligibility())) return false;

    try {
        const grantedPerms = await getGrantedPermissions();
        console.log('Inv:AndroidHealthConnect:getPerm: GrantedPerms ', grantedPerms);

        // allow them to deselect permissions if they want
        // if(grantedPerms !== PERMISSIONS) {
        if (!grantedPerms || grantedPerms.length === 0) {
            console.log('Inv:AndroidHealthConnect:getPerm: NO PERMISSIONS');
            return false;
        }
        return true;
    } catch (e: unknown) {
        console.log('Inv:AndroidHealthConnect:getPerm: ', e);
        debug(e);
        return false;
    }
};

const initPermissions = async () => {
    if (!(await checkEligibility())) return false;
    try {
        const permissions = (await requestPermission(PERMISSIONS)) as object[] as JsonMap[];
        console.log('Inv:andoird-health-connect:Init', permissions);
        if (!permissions?.length) return false;

        track(TRACK_PERMS_REQUESTED, { itemId: ITEM_ID, permissions });
        console.log('Inv:AndroidHealthConnect:Init: Permissions Granted!', permissions);
        return true;
    } catch (e: unknown) {
        console.log('C:AndroidHealth:InitPerm: ERROR - ', e);
        debug(e);
        return false;
    }
};

const equip: HoF = async () => {
    // TODO refector checkEligibility out of all these funcs and into inventory UI flow
    // Why? More functional and helps with testing
    // return 0, 1, 2, on checkEligibility for 0. cant install, 1. installable, 2. installed
    // call await initialize() manually on get/initPermissions and queryData

    console.log('equip eligible', await checkEligibility());
    if (!(await checkEligibility())) return false;

    try {
        return await initPermissions();
        // TODO return array of string for permissions granted
    } catch (e: unknown) {
        console.log('Error requesting permissions: ', e);
        debug(e);
        return false;
    }
};

const unequip: HoF = async () => {
    await revokeAllPermissions();
    // TODO: Implement unequip functionality
    console.log('Unequip called');
    return true;
};

const checkStatus = async () => {
    const isInstalled = await checkEligibility();
    console.log('Inv:AndroidHealthConnect:checkStatus: installed?', isInstalled);
    if (!isInstalled) return 'ethereal';

    const isEquipped = await getPermissions();
    console.log('Inv:AndroidHealthConnect:checkStatus: equipped?', isEquipped);
    if (isEquipped) return 'equipped';

    console.log('Inv:AndroidHealthConnect:checkStatus: unequipped!', isEquipped);
    return 'unequipped';
};

const item: InventoryItem = {
    id: ITEM_ID,
    name: 'Cyborg Repair Pack',
    dataProvider: ITEM_ID,
    tags: ['physical', 'exercise'],
    image: 'https://play-lh.googleusercontent.com/EbzDx68RZddtIMvs8H8MLcO-KOiBqEYJbi_kRjEdXved0p3KXr0nwUnLUgitZ5kQVWVZ=w480-h960-rw',
    installLink: 'https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata',
    attributes: [
        { ...DjinnStat, value: 5 },
        { ...HealthStat, value: 10 },
        { ...IntelligenceStat, value: 2 },
    ],
    checkStatus,
    // must have app installed but not equipped yet
    // TODO refactor to checkEligibility === 1
    canEquip: async () => (await checkEligibility()) === true && (await getPermissions()) === false,
    equip,
    unequip,
};

export default {
    item,
    permissions: PERMISSIONS,
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
export const queryHealthData = async ({
    activity,
    operator,
    startTime,
    endTime,
}: QueryAndroidHealthDataProps): Promise<AndroidHealthRecord[]> => {
    try {
        const records = await readRecords(activity, {
            timeRangeFilter: {
                operator,
                startTime: startTime ?? PORTAL_DAY,
                endTime: endTime ?? Date.now().toLocaleString(),
            },
        });

        track(TRACK_DATA_QUERIED, { itemId: ITEM_ID, actionType: activity });
        console.log('Android Health Steps', records.slice(0, 10));

        return records as AndroidHealthRecord[];
    } catch (e) {
        console.log('C:AndroidHealthConnect:ERROR - ', e);
        return [];
    }
};

/**
 * @desc - Query Android health data from phone
 * @dev - Custom Item Function
 * @param
 * @returns HealthRecords[]
 */
export const getActivityData = async ({
    startTime,
    endTime,
}: GetHealthDataProps): Promise<object[]> => {
    const steps = queryHealthData({ activity: 'Steps', operator: 'between', startTime, endTime });
    const distance = queryHealthData({
        activity: 'Distance',
        operator: 'between',
        startTime,
        endTime,
    });
    const caloriesBurned = queryHealthData({
        activity: 'TotalCaloriesBurned',
        operator: 'between',
        startTime,
        endTime,
    });
    const [aggSteps, aggDist, aggCals] = (await Promise.all([steps, distance, caloriesBurned])).map(
        aggDailyData,
    );
    const dailyData = keys(steps).reduce((agg: object[], date: string) => {
        console.log(
            'C:AndroidHealthConnect:GetActs:agg - ',
            date,
            aggSteps[date],
            aggDist[date],
            aggCals[date],
        );
        return [...agg, merge(aggSteps[date], [aggDist[date], aggCals[date]])];
    }, []);
    console.log('C:AndroidHealthConnect:GetActs:fin - ', dailyData);

    return dailyData;
};

/**
 * @desc - Aggregate multiple steps data into single object for an entire day to save DB space
 * @dev - Assumes all records are of the same activity/type
 * @param records -  all records queried from phone
 * @returns HealthRecords[] - one health record per day.
 */
export const aggDailyData = (
    records: AndroidHealthRecord[],
): { [key: string]: AndroidHealthRecord[] } => {
    // TODO pass in getStartTime(item), getEndTime(item), getActionMetadata(acc, item) func to abstract away from Android and Steps
    const sortedRecords = sortBy((r: AndroidHealthRecord) => new Date(r.startTime).getTime())(
        records,
    );

    const groupedRecords = reduce(
        (acc: { [key: string]: AndroidHealthRecord }, record: AndroidHealthRecord) => {
            const recordDate = formatISO(startOfDay(new Date(record.startTime)));
            return !acc[recordDate]
                ? { ...acc, [recordDate]: record }
                : {
                      ...acc,
                      [recordDate]: {
                          ...acc[recordDate],
                          // TODO getActionMEtadata HoF for count, et.c.
                          count: record.count ? acc[recordDate].count ?? 0 + record.count : 0,
                          startTime:
                              acc[recordDate].startTime < record.startTime
                                  ? acc[recordDate].startTime
                                  : record.startTime,
                          endTime:
                              acc[recordDate].endTime > record.endTime
                                  ? acc[recordDate].endTime
                                  : record.endTime,
                      },
                  };
        },
        {},
    )(sortedRecords);

    // return groupedRecords;
    return Object.values(groupedRecords) as AndroidHealthRecord[];
};

// records.reduce((agg, record) => ({
//     count: record.count + agg.count,
//     endTime: agg.endTime > record.endTime ? agg.endTime : record.endTime,
//     startTime: agg.startTime < record.startTime ? agg.startTime : record.startTime,
// }));

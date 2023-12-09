import { RecordResult } from 'react-native-health-connect/lib/typescript/types';

// general format of health data query
export interface GetHealthDataProps {
    activity?: string;
    startTime?: string; // ISO string '2023-06-20T23:53:15.405Z'
    endTime?: string; // ISO string '2023-10-10T23:53:15.405Z'
    operator?: 'between' | 'before';
}

// iOS/AndroidGarmin/Strava/Withings/etc specific query structure

export interface QueryIosHealthDataProps {
    startDate: number;
    endDate: number;
    activity: string;
}

type SupportedActivities = 'Steps' | 'Distance' | 'ActiveCaloriesBurned';
export interface QueryAndroidHealthDataProps extends GetHealthDataProps {
    activity: SupportedActivities;
    startTime?: string; // ISO string '2023-06-20T23:53:15.405Z'
    endTime?: string; // ISO string '2023-10-10T23:53:15.405Z'
    operator: 'between' | 'before';
}

export interface AndroidHealthRecord extends RecordResult<SupportedActivities> {
    // just here for easier documentation acccessibility
    // count?: number; // might only be true for steps not everything
    // endTime: string; // ISO string '2023-06-20T23:53:15.405Z'
    // startTime: string; // ISO string '2023-06-20T23:53:15.405Z'
    // metadata: {
    //     device: number;
    //     clientRecordId: string;
    //     clientRecordVersion: number;
    //     dataOrigin: string; // app domain e.g. "com.google.android.apps.fitness"
    //     id: string; // uuid
    //     lastModifiedTime: string; // ISO string '2023-06-20T23:53:15.405Z'
    //     recordingMethod: number;
    // };
}

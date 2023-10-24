// general format of health data query
export interface GetHealthDataProps {
    activity?: string;
    startTime?: string; // ISO string '2023-06-20T23:53:15.405Z'
    endTime?: string; // ISO string '2023-10-10T23:53:15.405Z'
    operator?: 'between' | 'before';
}

interface QueryIosHealthDataProps {
    startDate: number;
    endDate: number;
    activity: string;
}

interface QueryAndroidHealthDataProps extends GetHealthDataProps {
    activity: 'Steps';
    startTime?: string; // ISO string '2023-06-20T23:53:15.405Z'
    endTime?: string; // ISO string '2023-10-10T23:53:15.405Z'
    operator: 'between' | 'before';
}

// mostly just here for documentation, not using anywhere atm
// TODO make subtypes <T> like Steps, HeartRate, etc.
export interface AndroidHealthRecord {
    count: number; // might only be true for steps not everything
    endTime: string;  // ISO string '2023-06-20T23:53:15.405Z'
    startTime: string; // ISO string '2023-06-20T23:53:15.405Z'
    metadata: {
        clientRecordId: null;
        clientRecordVersion: number;
        dataOrigin: string; // app domain e.g. "com.google.android.apps.fitness"
        id: string; // uuid
        lastModifiedTime: string; // ISO string '2023-06-20T23:53:15.405Z'
        recordingMethod: number;
    }
}
// ios specific query structure
// android specific query structure
// garmin specific query structure
// Garmin/Strava/Withings/etc specific query structure
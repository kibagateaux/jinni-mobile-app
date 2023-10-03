// general format of health data query
interface QueryIosHealthDataProps {
    startDate: number;
    endDate: number;
    activity: string;
}

interface QueryAndroidHealthDataProps {
    activity: 'Steps';
    startTime?: number; // ISO string '2023-09-09T23:53:15.405Z'
    endTime?: number; // ISO string '2023-09-09T23:53:15.405Z'
    operator: 'between' | 'before';
}

// ios specific query structure
// android specific query structure
// garmin specific query structure
// Garmin/Strava/Withings/etc specific query structure
import { Platform } from 'react-native';
import * as Sentry from 'sentry-expo';
import { SegmentClient as Segment, createClient } from '@segment/analytics-react-native';
import Constants from 'expo-constants';

import { getAppConfig, saveStorage } from 'utils/config';

import { ItemIds } from 'types/GameMechanics';

const isNativeApp = Platform.OS === 'ios' || Platform.OS === 'android';

export type SentryClient = typeof Sentry.Native | typeof Sentry.Browser | null;
let sentryClient: SentryClient;
export const getSentry = (): SentryClient => {
    if (!sentryClient && getAppConfig().SENTRY_DSN) {
        Sentry.init({
            dsn: getAppConfig().SENTRY_DSN!,
            //   release: 'my release name',
            //   dist: 'my dist',

            tracesSampleRate: 1.0,

            // enableInExpoDevelopment: __DEV__, // dont issue sentry events if local development
            debug: __DEV__, // If `true`, Sentry prints debugging information if error sending the event.

            integrations: isNativeApp
                ? [
                      // https://github.com/expo/sentry-expo/issues/368
                      // https://docs.expo.dev/guides/using-sentry/#troubleshooting
                      new Sentry.Native.ReactNativeTracing({
                          enableAppStartTracking: __DEV__,
                          shouldCreateSpanForRequest: (url) => {
                              return (
                                  !__DEV__ ||
                                  !url.startsWith(`http://${Constants?.expoConfig?.hostUri}/logs`)
                              );
                          },
                      }),
                  ]
                : [],
        });
        sentryClient = isNativeApp ? Sentry.Native : Sentry.Browser;
    }

    return sentryClient;
};

export type SegmentClient = Segment | null;
let segmentClient: SegmentClient;
export const getSegment = () => {
    if (!segmentClient && getAppConfig().SEGMENT_API_KEY)
        segmentClient = createClient({
            writeKey: getAppConfig().SEGMENT_API_KEY!,
            debug: __DEV__ ? true : false,
        });

    return segmentClient;
};

export const TRACK_PERMS_REQUESTED = 'TRACK_PERMISSIONS_REQUESTED';
export const TRACK_DATA_QUERIED = 'TRACK_DATA_QUERIED';

interface LogDataQueryProps {
    itemId: ItemIds;
    activities: { [key: string]: string }; // name -> ISO local time
}

export const LAST_QUERIED_SLOT = 'LAST_TIME_QUERIED';

export const logLastDataQuery = ({ itemId, activities }: LogDataQueryProps) =>
    saveStorage<object>(`${LAST_QUERIED_SLOT}_${itemId}`, activities, true);

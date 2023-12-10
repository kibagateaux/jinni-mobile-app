import { Platform } from 'react-native';
import * as Sentry from 'sentry-expo';
import { JsonMap, SegmentClient as Segment, createClient } from '@segment/analytics-react-native';
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

            enableInExpoDevelopment: !__DEV__, // dont issue sentry events if local development
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

/**
 * @dev does not send logs to sentry during local development.
 *  Should happen in client config already but just in case.
 * @param err - Error exception thrown in runtime or manually crafted message
 */
export const debug = (err: string | Error | unknown) => {
    if (!__DEV__)
        err instanceof Error
            ? getSentry()?.captureException(err)
            : getSentry()?.captureMessage(String(err));
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

/**
 * @dev does not track events during local development
 * @param eventName - action user took within app to track in product analytics
 * @param data - info about event to pass along
 * @returns if event tracking was sent or not
 */
export const track = (eventName: string, data: JsonMap) =>
    // TODO add EAS_BUILD_PROFILE for tracking in test/prod
    !__DEV__ &&
    getSegment()?.track(eventName, {
        ...data,
        environment: process.env.EXPO_PUBLIC_APP_VARIANT,
        platform: Platform.OS,
    });

export const TRACK_PERMS_REQUESTED = 'TRACK_PERMISSIONS_REQUESTED';
export const TRACK_DATA_QUERIED = 'TRACK_DATA_QUERIED';

interface LogDataQueryProps {
    itemId: ItemIds;
    activities: { [key: string]: string }; // name -> ISO local time
}

export const LAST_QUERIED_SLOT = 'LAST_TIME_QUERIED';

export const logLastDataQuery = ({ itemId, activities }: LogDataQueryProps) =>
    saveStorage<object>(`${LAST_QUERIED_SLOT}_${itemId}`, activities, true);

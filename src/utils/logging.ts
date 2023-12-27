import { Platform } from 'react-native';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
import * as Sentry from 'sentry-expo';
import { JsonMap, SegmentClient as Segment, createClient } from '@segment/analytics-react-native';
import Constants from 'expo-constants';
import { ScopeContext } from '@sentry/types';

if (__DEV__) {
    // Adds messages only in a dev environment
    loadDevMessages();
    loadErrorMessages();
}

const isNativeApp = Platform.OS === 'ios' || Platform.OS === 'android';

export type SentryClient = typeof Sentry.Native | typeof Sentry.Browser | null;
let sentryClient: SentryClient;
export const getSentry = (): SentryClient => {
    if (!sentryClient && process.env.EXPO_PUBLIC_SENTRY_DSN) {
        Sentry.init({
            dsn: process.env.EXPO_PUBLIC_SENTRY_DSN!,
            environment: process.env.NODE_ENV,
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
export const debug = async (
    err: string | Error | unknown,
    context?: Partial<ScopeContext>,
): Promise<void> => {
    if (!__DEV__)
        err instanceof Error
            ? getSentry()?.captureException(err, context)
            : getSentry()?.captureMessage(String(err), context);
};

export type SegmentClient = Segment | null;
let segmentClient: SegmentClient;
export const getSegment = () => {
    if (!segmentClient && process.env.EXPO_PUBLIC_SEGMENT_API_KEY)
        segmentClient = createClient({
            writeKey: process.env.EXPO_PUBLIC_SEGMENT_API_KEY!,
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
    !__DEV__ &&
    getSegment()?.track(eventName, {
        ...data,
        environment: process.env.NODE_ENV,
        platform: Platform.OS,
    });

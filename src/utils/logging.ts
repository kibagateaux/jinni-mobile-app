import { Platform } from 'react-native';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
import * as SentryNative from '@sentry/react-native';
import * as SentryBrowser from '@sentry/react';
import { JsonMap, SegmentClient as Segment, createClient } from '@segment/analytics-react-native';
import Constants from 'expo-constants';
import { ScopeContext } from '@sentry/types';

import { getAppConfig } from 'utils/config';

if (__DEV__) {
    // Adds messages only in a dev environment
    loadDevMessages();
    loadErrorMessages();
}

const isNativeApp = Platform.OS === 'ios' || Platform.OS === 'android';

export type SentryClient = typeof SentryNative | typeof SentryBrowser | null;
let sentryClient: SentryClient;
const commonConfig = {
    dsn: getAppConfig().SENTRY_DSN,
    environment: __DEV__ ? 'development' : 'production',
    release: Constants.version,
    dist: Constants.revisionId,
    enabled: !__DEV__, // Typically disable Sentry in development
    debug: __DEV__, // If `true`, Sentry prints debugging information if error sending the event.
    tracesSampleRate: 1.0,
};

export const getSentry = (): SentryClient => {
    if (sentryClient) return sentryClient;
    if (!getAppConfig().SENTRY_DSN) return null;
    const client = isNativeApp ? SentryNative : SentryBrowser;
    // TODO review native vs web compatibility https://docs.sentry.io/platforms/react-native/migration/sentry-expo/#review-react-native-web-compatibility
    if (isNativeApp) {
        client.init({
            ...commonConfig,
            enableNative: true, // Enable native crash reporting
            enableNativeCrashHandling: true,
        });
    } else {
        client.init({
            ...commonConfig,
            integrations: [],
        });
    }
    client.setTag('deviceId', Constants.sessionId);
    client.setTag('appOwnership', Constants.appOwnership || 'N/A');
    if (Constants.appOwnership === 'expo' && Constants.expoVersion) {
        client.setTag('expoAppVersion', Constants.expoVersion);
    }
    // TODO track hot updates} in sentry
    // client.setExtras({
    //     manifest: Updates.manifest,
    //     deviceYearClass: Device.deviceYearClass,
    //     linkingUri: Constants.linkingUri,
    // });
    // client.setTag("expoReleaseChannel", Updates.manifest.releaseChannel);
    // client.setTag("appVersion", Updates.manifest.version);
    // client.setTag("appPublishedTime", Updates.manifest.publishedTime);
    // client.setTag("expoSdkVersion", Updates.manifest.sdkVersion);
    // client.setTag("expoChannel", Updates.channel);
    sentryClient = client;

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
            trackAppLifecycleEvents: true,
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

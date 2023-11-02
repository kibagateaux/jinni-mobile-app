import React, { createContext, useState, useMemo } from 'react';
import { Platform } from 'react-native';
import { getAppConfig } from 'utils/config';
import Constants from 'expo-constants';

import * as Sentry from 'sentry-expo';
import { SegmentClient, createClient } from '@segment/analytics-react-native';
import { ApolloProvider } from '@apollo/client';
import { getGqlClient } from 'utils/api';

type SentryModules = typeof Sentry.Native | typeof Sentry.Browser | null;

interface ExternalServicesConsumables {
    sentry: SentryModules;
    segment: SegmentClient | null;
}

export const ExternalServicesContext = createContext<ExternalServicesConsumables>({
    sentry: null,
    segment: null,
});

export const useExternalServices = (): ExternalServicesConsumables => {
    return React.useContext(ExternalServicesContext);
};

type Props = {
    children?: React.ReactNode;
};
export const ExternalServicesProvider: React.FC<Props> = ({ children }) => {
    const [sentry, setSentry] = useState<SentryModules>(null);
    const [segment, setSegment] = useState<SegmentClient | null>(null);

    useMemo(() => {
        if (!sentry && getAppConfig().SENTRY_DSN) {
            const isNativeApp = Platform.OS === 'ios' || Platform.OS === 'android';
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
                                      !url.startsWith(
                                          `http://${Constants?.expoConfig?.hostUri}/logs`,
                                      )
                                  );
                              },
                          }),
                      ]
                    : [],
            });

            setSentry(isNativeApp ? Sentry.Native : Platform.OS === 'web' ? Sentry.Browser : null);
        }

        if (!segment && getAppConfig().SEGMENT_API_KEY) {
            setSegment(
                createClient({
                    writeKey: getAppConfig().SEGMENT_API_KEY!,
                    debug: __DEV__ ? true : false,
                }),
            );
        }
    }, [Platform.OS]);

    // console.log('ESP: segment/sentry', segment, sentry);

    return (
        <ExternalServicesContext.Provider value={{ sentry, segment }}>
            <ApolloProvider client={getGqlClient()}>{children}</ApolloProvider>
        </ExternalServicesContext.Provider>
    );
};

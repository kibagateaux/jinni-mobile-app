import React, { createContext, useState, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import * as Sentry from 'sentry-expo';
import { getAppConfig } from 'utils/config';
import Constants from 'expo-constants';

type SentryModules = typeof Sentry.Native | typeof Sentry.Browser | null;

interface ExternalServicesConsumables {
    sentry: SentryModules;
    segment: any | null
}

export const ExternalServicesContext = createContext<ExternalServicesConsumables>({
    sentry: null,
    segment: null,
});

export const useExternalServices = (): ExternalServicesConsumables => {
    return React.useContext(ExternalServicesContext);
}

// TODO add Segment.io analytics
export const ExternalServicesProvider = ({ children }: any) => {
    const [sentry, setSentry] = useState<SentryModules>(null);
    const [segment, setSegment] = useState<any | null>(null);
  
  
    useMemo(() => {
        if(!sentry) { 
            const isNativeApp = Platform.OS === 'ios' || Platform.OS === 'android' ;
            Sentry.init({
                dsn: getAppConfig().SENTRY_DSN,
                //   release: 'my release name',
                //   dist: 'my dist',

                tracesSampleRate: 1.0,

                // enableInExpoDevelopment: __DEV__, // dont issue sentry events if local development
                debug: __DEV__, // If `true`, Sentry prints debugging information if error sending the event.

                integrations: isNativeApp ? [
                    // https://github.com/expo/sentry-expo/issues/368
                    // https://docs.expo.dev/guides/using-sentry/#troubleshooting
                    new Sentry.Native.ReactNativeTracing({
                    enableAppStartTracking: __DEV__,
                    shouldCreateSpanForRequest: url => {
                        return !__DEV__ || !url.startsWith(`http://${Constants?.expoConfig?.hostUri}/logs`);
                    },
                    }),
                ] : [

                ],
            });
            setSentry(
                isNativeApp ? Sentry.Native :
                Platform.OS === 'web' ? Sentry.Browser :
                null
            );
        }
    }, [Platform.OS])

    return (
        <ExternalServicesContext.Provider value={{ sentry, segment }}>
            {children}
        </ExternalServicesContext.Provider>
    )

}

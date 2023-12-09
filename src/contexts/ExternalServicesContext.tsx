import React, { createContext, useState, useMemo } from 'react';
import { Platform } from 'react-native';
import { getAppConfig } from 'utils/config';

import { ApolloProvider } from '@apollo/client';
import { getGqlClient } from 'utils/api';
import { SentryClient, SegmentClient, getSegment, getSentry } from 'utils/logging';

interface ExternalServicesConsumables {
    sentry: SentryClient;
    segment: SegmentClient;
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
    const [sentry, setSentry] = useState<SentryClient>(null);
    const [segment, setSegment] = useState<SegmentClient>(null);

    useMemo(() => {
        if (!sentry && getAppConfig().SENTRY_DSN) {
            setSentry(getSentry());
        }

        if (!segment && getAppConfig().SEGMENT_API_KEY) {
            setSegment(getSegment());
        }
    }, [Platform.OS]);

    // console.log('ESP: segment/sentry', segment, sentry);

    return (
        <ExternalServicesContext.Provider value={{ sentry, segment }}>
            <ApolloProvider client={getGqlClient()}>{children}</ApolloProvider>
        </ExternalServicesContext.Provider>
    );
};

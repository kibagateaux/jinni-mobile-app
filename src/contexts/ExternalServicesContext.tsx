import React, { createContext, useState, useMemo } from 'react';
import { getAppConfig } from 'utils/config';

import { ApolloProvider } from '@apollo/client';
import { Helmet, HelmetProvider } from 'react-helmet-async';
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
    }, [sentry, segment]);

    // console.log('ESP: segment/sentry', segment, sentry);

    return (
        <ExternalServicesContext.Provider value={{ sentry, segment }}>
            <HelmetProvider>
                <Helmet>
                    <link rel="manifest" href="manifest.json"></link>
                    {/* <script type="module" src='https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-core.js'></script> */}
                    {/* <script type="module" src='https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-expiration.js'></script> */}
                    {/* <script type="module" src='https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-precaching.js'></script> */}
                    {/* <script type="module" src='https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-routing.js'></script> */}
                    {/* <script type="module" src='https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-strategies.js'></script> */}
                    <script type="module" src="./service-worker.js"></script>
                    {/* <script type="module">
                        import {Workbox} from 'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-window.prod.mjs';

                        if ('serviceWorker' in navigator) {
                            const wb = new Workbox('/sw.js');

                            wb.register();
                        }
                    </script> */}
                </Helmet>
                <ApolloProvider client={getGqlClient()}>{children}</ApolloProvider>
            </HelmetProvider>
        </ExternalServicesContext.Provider>
    );
};

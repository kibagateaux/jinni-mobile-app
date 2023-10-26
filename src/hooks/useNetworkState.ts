import { useEffect, useState } from 'react';
import { getNetworkState, defaultConnection } from 'utils/config';
import { CurrentConnection } from 'types/SpiritWorld';

export const useNetworkState = (): { loading: boolean; connection: CurrentConnection } => {
    const [loading, setLoading] = useState<boolean>(false);
    const [connection, setConnection] = useState<CurrentConnection>(defaultConnection);

    useEffect(() => {
        setLoading(true);
        getNetworkState()
            .then((networkState) => {
                setConnection(networkState);
                setLoading(false);
            })
            .catch(() => {
                return defaultConnection;
                setLoading(false);
            });
    }, []);

    return { loading, connection };
};

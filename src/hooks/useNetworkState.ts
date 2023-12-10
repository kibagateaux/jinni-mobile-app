import { useEffect, useState } from 'react';
import { getNetworkState, noConnection } from 'utils/config';
import { CurrentConnection } from 'types/SpiritWorld';

export const useNetworkState = (): { loading: boolean; connection: CurrentConnection } => {
    const [loading, setLoading] = useState<boolean>(false);
    const [connection, setConnection] = useState<CurrentConnection>(noConnection);

    useEffect(() => {
        setLoading(true);
        getNetworkState()
            .then((networkState) => {
                setConnection(networkState);
                setLoading(false);
            })
            .catch(() => {
                return noConnection;
                setLoading(false);
            });
    }, []);

    return { loading, connection };
};

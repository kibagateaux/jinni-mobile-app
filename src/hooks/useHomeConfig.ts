import { useState, useEffect } from 'react';

import { getHomeConfig } from 'utils/config';
import { useAuth } from 'contexts';
import { HomeConfig } from 'types/UserConfig';
import { useNetworkState } from './useNetworkState';

export const useHomeConfig = () => {
    const { user } = useAuth();
    const { loading: isLoadingNetwork, connection } = useNetworkState();
    const [homeConfig, setHomeConfig] = useState<HomeConfig | null>(null);

    useEffect(() => {
        getHomeConfig(connection, user?.name).then((config) => setHomeConfig(config));
    }, [user, isLoadingNetwork]);

    return homeConfig;
};

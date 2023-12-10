import { useState, useEffect } from 'react';

import { getHomeConfig } from 'utils/config';
import { useAuth } from 'contexts';
import { HomeConfig } from 'types/UserConfig';
import { useNetworkState } from './useNetworkState';

export const useHomeConfig = () => {
    const { player } = useAuth();
    const { loading: isLoadingNetwork } = useNetworkState();
    const [homeConfig, setHomeConfig] = useState<HomeConfig | null>(null);

    useEffect(() => {
        getHomeConfig(player?.name).then((config) => setHomeConfig(config));
    }, [player, isLoadingNetwork]);

    return homeConfig;
};

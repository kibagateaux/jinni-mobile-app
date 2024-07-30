import { useState, useEffect } from 'react';

import { getHomeConfig } from 'utils/config';
import { useAuth } from 'contexts';
import { HomeConfig, WidgetConfig } from 'types/UserConfig';
import { useNetworkState } from './useNetworkState';
import { saveHomeConfig } from 'utils/api';

export const useHomeConfig = () => {
    const { player } = useAuth();
    const { loading: isLoadingNetwork } = useNetworkState();
    const [config, setHomeConfig] = useState<HomeConfig | null>(null);

    // TODO useCallback
    const save = async (widgets: WidgetConfig[], merge: boolean = true) => {
        const newConfig = await saveHomeConfig({
            widgets: widgets,
            merge,
        });
        setHomeConfig(newConfig);
    };

    // TODO useMemo
    useEffect(() => {
        getHomeConfig(player?.id).then((config) => setHomeConfig(config));
    }, [player, isLoadingNetwork]);

    return { config, save };
};

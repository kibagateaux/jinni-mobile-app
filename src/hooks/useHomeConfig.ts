import { useState, useEffect } from 'react';

import { getHomeConfig } from 'utils/config';
import { useAuth } from 'contexts';
import { HomeConfig, WidgetConfig } from 'types/UserConfig';
import { useNetworkState } from './useNetworkState';
import { saveHomeConfig } from 'utils/api';
import { useActiveJinni } from './useActiveJinni';

export const useHomeConfig = () => {
    const { player } = useAuth();
    const { jid } = useActiveJinni();
    const { loading: isLoadingNetwork } = useNetworkState();
    const [config, setHomeConfig] = useState<HomeConfig | null>(null);

    // TODO useCallback
    const save = async (widgets: WidgetConfig[], merge: boolean = true) => {
        const newConfig = await saveHomeConfig({
            jinniId: jid,
            widgets: widgets,
            merge,
        });
        setHomeConfig(newConfig);
    };

    // TODO useMemo
    useEffect(() => {
        // TODO jid as param not player.id since widget refactor on backend
        // API was low prio when single player but p2c jinni require pulling from remote so high prio
        getHomeConfig(player?.id).then((config) => setHomeConfig(config));
    }, [player, isLoadingNetwork]);

    // TODO feel like should return jid here since multi jinni per player now
    return { config, save };
};

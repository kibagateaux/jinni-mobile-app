import { useState, useMemo } from 'react';

import { getHomeConfig } from 'utils/api';
import { useAuth } from 'contexts';
import { HomeConfig, HomeConfigMap } from 'types/UserConfig';
import { saveHomeConfig } from 'utils/api';
import { useActiveJinni } from './useActiveJinni';
import { defaultHomeConfig } from 'utils/config';
// import { useNetworkState } from './useNetworkState';
import { UpdateWidgetConfigParams } from 'types/api';

const getActiveConfig = (activeJid: string, configs: HomeConfigMap): HomeConfig | null =>
    Object.entries(configs).find(([jinniId, jConfig]: [string, HomeConfig]) => {
        console.log('finding config for active jinni', activeJid, jinniId, jConfig);

        if (jinniId === activeJid) return true;
    })?.[1] ?? null; // return config but not jid

export const useHomeConfig = () => {
    const { player } = useAuth();
    const { jid } = useActiveJinni();
    // const { loading: isLoadingNetwork } = useNetworkState();
    const [activeConfig, setHomeConfig] = useState<HomeConfig | null>(null);
    const [allJinniConfig, setAllConfigs] = useState<HomeConfigMap | null>(null);

    // TODO useCallback
    const save = async (updates: Partial<UpdateWidgetConfigParams>): Promise<HomeConfigMap> => {
        if (!jid) return {};
        if (!updates.merge && !updates.widgets) {
            throw new Error(
                'On config save must Merge or Provide existing widget config to ensure profile permannce',
            );
        }

        const newConfig = await saveHomeConfig({
            widgets: updates.widgets!,
            jinniId: jid,
            ...updates,
        });
        if (newConfig?.[jid]) setHomeConfig(newConfig[jid]);
        return newConfig as HomeConfigMap;
    };

    // TODO useMemo
    useMemo(() => {
        // TODO figure out logic for when to pull config again once we get access to internet again
        // if(!isLoadingNetwork && useNetworkState().connection.isNoosphere && activeConfig.lastDiviTime > 5 days);
        if (!jid) return;
        if (allJinniConfig) {
            setHomeConfig(getActiveConfig(jid, allJinniConfig ?? defaultHomeConfig['undefined']));
            return;
        }

        getHomeConfig(player?.id, true).then((configs) => {
            const active = getActiveConfig(jid, configs);
            // set basic home config if none saved by player yet
            console.log('active config post api req: ', active);
            if (active) setHomeConfig(active);
            setAllConfigs(configs);
        });
    }, [jid, player, allJinniConfig]);

    // TODO feel like should return jid here since multi jinni per player now
    return { config: activeConfig, save, allJinniConfigs: allJinniConfig };
};

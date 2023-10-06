import { useState, useEffect } from 'react';

import { getHomeConfig } from 'utils/config';
import { useAuth } from 'contexts';
import { HomeConfig } from 'types/UserConfig';
import { getAppConfig } from 'utils/config';

export const useHomeConfig = () => {
    const { user } = useAuth();
    const [homeConfig, setHomeConfig] = useState<HomeConfig | null>(null);

    useEffect(() => {
        getHomeConfig(user?.name).then((config) => setHomeConfig(config))
    }, [user]);

    return homeConfig;
};
import { useState, useEffect } from 'react';

import { useAuth } from 'contexts';
import { HomeConfig } from 'types/UserConfig';
import { getAppConfig } from 'utils/config';

export const useHomeConfig = () => {
    const { user } = useAuth();
    const [homeConfig, setHomeConfig] = useState<HomeConfig | null>(null);

    useEffect(() => {
        if (user) {
            fetch(`${getAppConfig().API_URL}/scry/${user.name}/home-config/`)
                .then(response => response.json())
                .then(data => setHomeConfig(data))
                .catch(error => {
                    console.error(error)
                });
        }
    }, [user]);

    return homeConfig;
};
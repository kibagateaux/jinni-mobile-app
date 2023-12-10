import { useState, useMemo } from 'react';

import { InventoryItem } from 'types/GameMechanics';
import utils from 'utils/inventory';
import { useAuth } from 'contexts/AuthContext';

// interface UseInventoryProps {
//     username?: string;
// }

export const useInventory = () => {
    const { player } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useMemo(() => {
        if (!inventory.length) {
            setLoading(true);
            utils
                .getInventoryItems(player?.name)
                .then((inventoryItems: InventoryItem[]) => {
                    setInventory(inventoryItems);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('ERR: fetch inventory', err);
                    setLoading(false);
                });
        }
    }, [player]);

    return { inventory, loading };
};

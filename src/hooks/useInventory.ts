import { useState, useMemo } from 'react';
import { reduce } from 'lodash/fp';

import { InventoryItem, ItemAbility } from 'types/GameMechanics';
import utils from 'inventory';
import { useAuth } from 'contexts/AuthContext';

// interface UseInventoryProps {
//     username?: string;
// }

export const useInventory = () => {
    const { player } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [widgets, setWidgets] = useState<{ [id: string]: ItemAbility }>({});
    const [loading, setLoading] = useState<boolean>(false);

    // TODO use redux store or something to persists data better
    useMemo(() => {
        if (!inventory.length) {
            setLoading(true);
            utils
                .getInventoryItems(player?.name)
                .then((inventoryItems: InventoryItem[]) => {
                    setInventory(inventoryItems);
                    const allWidgets = reduce(
                        (agg, item: InventoryItem) => ({
                            ...agg,
                            ...(!item.widgets
                                ? {}
                                : reduce(
                                      (agg, widgi: ItemAbility) => ({ ...agg, [widgi.id]: widgi }),
                                      {},
                                  )(item.widgets)),
                        }),
                        {},
                    )(inventoryItems);
                    setWidgets(allWidgets);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('ERR: fetch inventory', err);
                    setLoading(false);
                });
        }
    }, [player?.name, inventory.length]);

    return { inventory, loading, widgets };
};

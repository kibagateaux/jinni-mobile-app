import { useState, useMemo } from 'react';
import { reduce } from 'lodash/fp';

import { InventoryItem, ItemAbility, ItemStatus, ItemIds } from 'types/GameMechanics';
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
                    console.log('ERR: fetch inventory', err);
                    setLoading(false);
                });
        }
    }, [player?.name, inventory.length]);

    const setItemStatus = (itemId: ItemIds, status: ItemStatus) => {
        // console.log('hooks:useInventory:setStatus', itemId, status);
        // return setInventory(inventory.map(i => i.id !== itemId ? i : {...i, status}))
        return setInventory(
            inventory.map((i) => {
                if (i.id !== itemId) return i;
                // console.log('hooks:useInventory:setStatus:i', { ...i, status });
                return { ...i, status };
            }),
        );
    };

    return { inventory, loading, widgets, setItemStatus };
};

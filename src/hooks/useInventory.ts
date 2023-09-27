
import { useState, useEffect } from 'react';
import axios from 'axios';

import {InventoryItem} from 'types/GameMechanics';
import { getUserConfig } from 'utils/config';

interface UseInventoryProps {
  username?: string;
}

export const useInventory = ({ username }: UseInventoryProps) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<Boolean>(false);

  useEffect(() => {
    if(!inventory.length) {
        setLoading(true);
        getUserConfig.getInventoryItems(username).then((inventoryItems: InventoryItem[]) => {
            setInventory(inventoryItems);
            setLoading(false);
        })
        .catch((err) => {
            console.error("ERR: fetch inventory", err);
            setLoading(false);
        });
    }
  }, [username, inventory]);

  return { inventory, loading };
};
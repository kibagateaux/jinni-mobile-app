
import { useState, useMemo } from 'react';
import axios from 'axios';

import {InventoryItem} from 'types/GameMechanics';
import utils from 'utils/inventory';
import { useAuth } from 'contexts/AuthContext';

interface UseInventoryProps {
  username?: string;
}

export const useInventory = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<Boolean>(false);

  useMemo(() => {
    if(!inventory.length) {
      setLoading(true);
      utils.getInventoryItems(user?.name)
        .then((inventoryItems: InventoryItem[]) => {
          setInventory(inventoryItems);
          setLoading(false);
        })
        .catch((err) => {
          console.error("ERR: fetch inventory", err);
          setLoading(false);
        });
    }
  }, [user, inventory]);

  return { inventory, loading };
};
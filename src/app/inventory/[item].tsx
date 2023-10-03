
import React, { useEffect, useMemo, useState } from 'react';
import { Text, View, Image, Button, StyleSheet } from 'react-native';
import { WidgetIcon } from 'components';
import { Stack, useLocalSearchParams } from 'expo-router';

import utils, { isEquipped } from 'utils/inventory';
import { useInventory } from 'hooks/useInventory';
import { useAuth } from 'contexts/AuthContext';
import { InventoryItem, ItemStatus, StatsAttribute } from 'types/GameMechanics';

import Modals, { ItemEquipWizardModal } from 'components/modals';
import { Link } from 'components';

interface ItemPageProps {
  item: InventoryItem;
}

const ItemPage: React.FC<ItemPageProps> = () => {
  const { item: id } = useLocalSearchParams();
  const { inventory, loading } = useInventory();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [status, setStatus] = useState<string>("unequipped");
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // console.log('Item: item', id, item);
  // console.log('Item: status & modal', status, activeModal);

  useMemo(() => {
    if(id && !item) {
      const item = inventory.find((item) => item.id === id);
      if(item) setItem(item);
    }
  }, [id, inventory]);

  useEffect(() => {
    if(item) {
      item.checkStatus().then((status: ItemStatus) => setStatus(status));
    }
  });
  
  if(!inventory) return (
    <Text> Item Not Currently Available For Gameplay </Text>
  );

  if(!item) return (
    <Text> Item Not Currently Available For Gameplay </Text>
  );

  const onItemEquipPress = () => {
    if(item.equip) item.equip();
    // console.log('modal to render', ItemEquipWizardModal, Modals);
    setStatus("equipping");
    setActiveModal("equip-wizard");
  };

  const onItemUnequipPress = () => {
    if(item.unequip) item.unequip();
    setStatus("unequipping");
  }

  const renderItemButton = () => {
    console.log("Item: button? ", status, item.equip, item.unequip, item);

    if(status === "unequipped" && item.equip) return (
      <Button style={styles.equipButton} title="Equip" onPress={onItemEquipPress}/>
    );

    if(status === "equipped" && item.unequip) return (
      <Button style={styles.unequipButton} title="Unequip" onPress={onItemUnequipPress}/>
    );

    // if equipped but not actions then disable button
    if(status === "equipped") return (
      <Button style={styles.unequipButton} title="Equipped" disabled/>
    );
  };

  const renderActiveModal = () => {
    console.log('render active modal', status);
    switch(activeModal) {
      case "equip-wizard":
        console.log('Inventory Active Modal data', status, item);
        const onClose = () => setActiveModal(null);
        return <ItemEquipWizardModal size="mid" item={item} status={status} onClose={onClose} />;
      default:
        return null;
    }
  }

  const renderItemHelpers = () => {
    console.log('render Item Helpers', status);
    switch(status) {
      case "unequipped":
        if(item.installLink)
          return (
            <Link to={item.installLink} trackingId={'inventory-item-install' + item.id}>
                <Text> View In App Store </Text>
            </Link>
          );
      case "equipped":
        if(item.installLink)
          return (
            <Link to={item.installLink} trackingId={'inventory-item-install' + item.id}>
                <Text> View In App Store </Text>
            </Link>
          );
      default:
        return null;
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Stack.Screen
        options={{
          title: item.name,
        }}
      />
      <View>
        <Image source={{ uri: item.image }} style={{ width: '200px', height: '200px' }} />
        {renderItemButton()}
        {/* {renderItemActions()} */}
      </View>
      <View style={{ position: 'absolute', right: 0 }}>
        {item.attributes.map((attribute: StatsAttribute) => (
          <WidgetIcon
            key={attribute.name}
            widgetId={attribute.name}
            text={`+${attribute.value} ${attribute.symbol} ${attribute.name}`}
            to={`/stats/${attribute.name}`}
          />
        ))}
      </View>
      {renderItemHelpers()}
      {renderActiveModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  equipButton: {
    height: 50,
    width: 200,
    backgroundColor: 'gold',
  },
  unequipButton: {
    height: 50,
    width: 200,
    backgroundColor: 'gray',
  },
});
export default ItemPage;
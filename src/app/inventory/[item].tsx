
import React, { useEffect, useMemo, useState } from 'react';
import { Text, View, Image, Button, StyleSheet } from 'react-native';
import { WidgetIcon } from 'components';
import { InventoryItem, StatsAttribute } from 'types/GameMechanics';
import { Stack, useLocalSearchParams } from 'expo-router';
import { getInventoryItems } from 'utils/config';
import Modals, { ItemEquipWizardModal } from 'components/modals';

interface ItemPageProps {
  item: InventoryItem;
}

const ItemPage: React.FC<ItemPageProps> = () => {
  const { item: id } = useLocalSearchParams();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [status, setStatus] = useState<string>("unequipped");
  const [activeModal, setActiveModal] = useState<string | null>(null);

  console.log('Item: status & modal', status, activeModal);
  
  useMemo(async () => {
    if(id && !item) {
      const item = (await getInventoryItems()).find((item) => item.id === id);
      if(item) setItem(item);
    }
  }, [id, item]);

  useEffect(() => {
    if(item) {
      item.isEquipped().then((isEquipped) => {
        console.log(`isEquipped ${item.id}`, isEquipped);
        if(isEquipped) setStatus("equipped"); 
      });
    }
  });

  if(!item) return (
    <Text> Item Not Currently Available For Gameplay </Text>
  );

  const onItemEquipPress = () => {
    if(item.equip) item.equip();
    console.log('modal to render', ItemEquipWizardModal, Modals);
    setStatus("equipping");
    setActiveModal("equip-wizard");
  };

  const onItemUnequipPress = () => {
    if(item.unequip) item.unequip();
    setStatus("equipping");
  }

  const renderItemButton = () => {
    if(!status && item.equip) return (
      <Button style={styles.equipButton} title="Equip" onPress={onItemEquipPress}/>
    );

    if(status && item.unequip) return (
      <Button style={styles.unequipButton} title="Unequip" onPress={onItemUnequipPress}/>
    );

    // if equipped but not actions then disable button
    if(status) return (
      <Button style={styles.unequipButton} title="Equipped" disabled/>
    );

  };

  const renderActiveModal = () => {
    switch(activeModal) {
      case "equip-wizard":
        return <ItemEquipWizardModal size="mid" item={item} status={status} />;
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
        <Image source={{ uri: item.image }} style={{ width: '50%', height: '50%' }} />
        {renderItemButton()}
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
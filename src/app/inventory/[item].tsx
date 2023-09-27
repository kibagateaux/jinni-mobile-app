
import React, { useEffect, useMemo, useState } from 'react';
import { Text, View, Image, Button, StyleSheet } from 'react-native';
import { WidgetIcon } from 'components';
import { InventoryItem, StatsAttribute } from 'types/GameMechanics';
import { Stack, useLocalSearchParams } from 'expo-router';
import { getInventoryItems } from 'utils/config';

interface ItemPageProps {
  item: InventoryItem;
}

const ItemPage: React.FC<ItemPageProps> = () => {
  const { item: id } = useLocalSearchParams();
  const [item, setItem] = useState<InventoryItem | null>(null);

  useMemo(async () => {
    if(id && !item) {
      const item = (await getInventoryItems()).find((item) => item.id === id);
      if(item) setItem(item);
    }
  }, [id, item]);

  if(!item) return (
    <Text> Item Not Currently Available For Gameplay </Text>
  );

  const renderItemButton = () => {
    if(!item.equipped && item.equip) return (
      <Button style={styles.equipButton} title="Equip" onPress={item.equip}/>
    );

    if(item.equipped && item.unequip) return (
      <Button style={styles.unequipButton} title="Unequip" onPress={item.unequip}/>
    );

    // if equipped but not actions then disable button
    if(item.equipped) return (
      <Button style={styles.unequipButton} title="Equipped" disabled/>
    );

  };

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
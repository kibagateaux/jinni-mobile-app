
import React, { useEffect, useMemo, useState } from 'react';
import { Text, View, Image, Button, StyleSheet } from 'react-native';
import { WidgetIcon } from 'components';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useAuthRequest } from 'expo-auth-session';

import { InventoryItem, ItemStatus, OAuthProvider, StatsAttribute } from 'types/GameMechanics';

import utils, { isEquipped } from 'utils/inventory';
import { createOauthRedirectURI, oauthConfigs } from 'utils/oauth';
import { useInventory } from 'hooks/useInventory';
import { useAuth } from 'contexts/AuthContext';

import Modals, { ItemEquipWizardModal } from 'components/modals';
import { Link } from 'components';

interface ItemPageProps {
  item: InventoryItem;
}

const ItemPage: React.FC<ItemPageProps> = () => {
  const { item: id } = useLocalSearchParams();
  const { inventory, loading } = useInventory();

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [status, setStatus] = useState<ItemStatus>("unequipped");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // hooks for items that require 3rd party authentication
  const [itemOauthConfig, setItemOauth] = useState<OAuthProvider>(oauthConfigs.undefined);
  const redirectUri = createOauthRedirectURI();
  console.log('[OAUTH redirectUri]', redirectUri);
  
  const [request, response, promptAsync] = useAuthRequest(
    {
        clientId: itemOauthConfig.clientId,
        scopes: itemOauthConfig.scopes,
        redirectUri: `${redirectUri}?provider=${item?.id}`,
        usePKCE: false,
    },
    itemOauthConfig,
  );

  // console.log('Item: oauth', itemOauthConfig, request, response, promptAsync);

  useEffect(() => {
    if(item) {
      // configure oauth if required for item equip/unequip
      const oauth = oauthConfigs[item.id];
      if(oauth) setItemOauth(oauth);
    }
  }, [item?.id]);


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

  const onItemEquipPress = async () => {
    if(item.equip) { 
      // console.log('modal to render', ItemEquipWizardModal, Modals);
      setStatus("equipping");
      setActiveModal("equip-wizard");
      try {
        // TODO should we add tags to items for different callback types and UI filtering?
        // or just a single, optional callback func that handles everything for equip?
        if(itemOauthConfig.authorizationEndpoint) await item.equip(promptAsync);
        else await item.equip();
        setStatus("post-equip");
      } catch(e) {
        console.log('', );
        setStatus("unequipped");
      }
    }
  };

  const onItemUnequipPress = () => {
    if(item.unequip) item.unequip();
    setStatus("unequipping");
  }

  const renderItemButton = () => {
    // console.log("Item: button? ", status, item.equip, item.unequip, item);

    if(status === "unequipped" && (item.equip && (!itemOauthConfig || request))) return (
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
    // console.log('Inventory Active Modal data', status, item);
    const onClose = () => setActiveModal(null);
    switch(activeModal) {
      case "equip-wizard":
        return <ItemEquipWizardModal size="mid" item={item} status={status} onClose={onClose} />;
      default:
        return null;
    }
  }

  const renderItemHelpers = () => {
    // console.log('render Item Helpers', status);
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
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: item.name,
        }}
      />
      <View>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
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
  container: {
    flex: 1,
    padding: 25,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  itemImage: {
    width: 200,
    height: 200,
    margin: 20,
  },
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
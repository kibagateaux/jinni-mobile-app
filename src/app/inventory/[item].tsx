import React, { useMemo, useState } from 'react';
import {
    Text,
    View,
    Image,
    Button,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useLocalSearchParams } from 'expo-router';
import { useAuthRequest } from 'expo-auth-session';

import { InventoryItem, ItemStatus, OAuthProvider, StatsAttribute } from 'types/GameMechanics';

import { createOauthRedirectURI, oauthConfigs } from 'utils/oauth';
import { useInventory } from 'hooks/useInventory';
import { useGameContent } from 'contexts/GameContentContext';

import { Link, Pill, WidgetIcon } from 'components';
import { ItemEquipWizardModal } from 'components/modals';

interface ItemPageProps {
    item: InventoryItem;
}

const ItemPage: React.FC<ItemPageProps> = () => {
    const { item: id } = useLocalSearchParams();
    const { inventory, loading } = useInventory();

    const [item, setItem] = useState<InventoryItem | null>(null);
    const [status, setStatus] = useState<ItemStatus>('unequipped');
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const { inventory: content } = useGameContent();

    // hooks for items that require 3rd party authentication
    const [itemOauthConfig, setItemOauth] = useState<OAuthProvider>(oauthConfigs.undefined);
    const redirectUri = createOauthRedirectURI();
    console.log('[OAUTH redirectUri]', redirectUri);

    const [request, , promptAsync] = useAuthRequest(
        {
            clientId: itemOauthConfig.clientId,
            scopes: itemOauthConfig.scopes,
            redirectUri: `${redirectUri}?provider=${item?.id}`,
            usePKCE: false,
        },
        itemOauthConfig,
    );

    // console.log('Item: oauth', itemOauthConfig, request, response, promptAsync);

    useMemo(() => {
        if (item) {
            // configure oauth if required for item equip/unequip
            const oauth = oauthConfigs[item.id];
            if (oauth) setItemOauth(oauth);
        }
    }, [item?.id]);

    // console.log('Item: item', id, item);
    // console.log('Item: status & modal', status, activeModal);

    useMemo(() => {
        if (id && !item) {
            const item = inventory.find((item) => item.id === id);
            if (item) setItem(item);
        }
    }, [id, inventory]);

    useMemo(() => {
        if (item) {
            item.checkStatus().then((status: ItemStatus) => setStatus(status));
        }
    }, [item?.id]);

    if (loading) return <ActivityIndicator animating size="large" />;

    if (!inventory) return <Text> Item Not Currently Available For Gameplay </Text>;

    if (!item) return <Text> Item Not Currently Available For Gameplay </Text>;

    const onItemEquipPress = async () => {
        if (item.equip) {
            // console.log('modal to render', ItemEquipWizardModal, Modals);
            setStatus('equipping');
            setActiveModal('equip-wizard');
            try {
                // TODO should we add tags to items for different callback types and UI filtering?
                // or just a single, optional callback func that handles everything for equip?
                if (itemOauthConfig.authorizationEndpoint) await item.equip(promptAsync);
                else await item.equip();
                setStatus('post-equip');
            } catch (e) {
                console.log('Error Equipping:', e);
                setStatus('unequipped');
            }
        }
    };

    const onItemUnequipPress = () => {
        if (item.unequip) item.unequip();
        setStatus('unequipping');
    };

    const renderItemButton = () => {
        // console.log("Item: button? ", status, item.equip, item.unequip, item);

        if (status === 'unequipped' && item.equip && (!itemOauthConfig || request))
            return (
                <Button
                    title="Equip"
                    onPress={onItemEquipPress}
                    style={[styles.activeItemStatusButton, styles.equipButton]}
                />
            );

        if (status === 'equipped' && item.unequip)
            return (
                <Button
                    title="Unequip"
                    onPress={onItemUnequipPress}
                    style={[styles.activeItemStatusButton, styles.unequipButton]}
                />
            );

        // if equipped but not actions then disable button
        if (status === 'equipped')
            return (
                <Button
                    title="Equipped"
                    disabled
                    style={[styles.activeItemStatusButton, styles.unequipButton]}
                />
            );
    };

    const renderActiveModal = () => {
        // console.log('Inventory Active Modal data', status, item);
        const onClose = () => setActiveModal(null);
        switch (activeModal) {
            case 'equip-wizard':
                return (
                    <ItemEquipWizardModal
                        size="mid"
                        item={item}
                        status={status}
                        onClose={onClose}
                    />
                );
            default:
                return null;
        }
    };

    const renderDefaultItemInfo = () => (
        <View style={styles.defaultInfoContainer}>
            <View style={{ flexDirection: 'row', flex: 0.1 }}>
                <Pill size="sm" text={item?.status ?? 'unequipped'} />
                {!item?.installLink ? null : (
                    // TODO open app if equipped else open app store and change trackingId
                    <Link to={item.installLink} trackingId={'inventory-item-install:' + item.id}>
                        <Pill size="sm" text="Open" theme="secondary" />
                    </Link>
                )}
            </View>
            <View style={styles.itemStatsContainer}>
                {item.attributes.map((attribute: StatsAttribute) => (
                    <WidgetIcon
                        key={attribute.name}
                        widgetId={attribute.name}
                        // styleOverride={{ height: 50, width: 300 }}
                        text={`+${attribute.value} ${attribute.symbol}         ${attribute.name}`}
                        to={`/stats/${attribute.name}`}
                    />
                ))}
            </View>
        </View>
    );

    const renderItemAbilities = () =>
        item?.abilities?.length ? (
            <ScrollView horizontal style={{ flex: 1 }}>
                {item?.abilities.map((ability) => (
                    <View key={ability.id} style={{ marginRight: 24, alignItems: 'center' }}>
                        <Text style={{ fontSize: 54 }}>{ability.symbol}</Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{ability.name}</Text>
                        <TouchableOpacity onPress={() => ability.do()}>
                            <Text>Do</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        ) : (
            <Text>
                {' '}
                No Actions Available For This Item Yet.
                <Link to="https://nootype.substack.com/subscribe">
                    Stay Tuned For Game Updates!!
                </Link>
            </Text>
        );

    const renderItemWidgets = () =>
        item?.widgets?.length ? (
            <View></View>
        ) : (
            <Text>
                {' '}
                No Actions Available For This Item Yet.
                <Link to="https://nootype.substack.com/subscribe">
                    Stay Tuned For Game Updates!!
                </Link>
            </Text>
        );

    const renderItemContent = () => (
        <ScrollView style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.sectionBody}>
                <Text>{content[id].meta.description}</Text>
            </View>

            <Text style={styles.sectionTitle}>Perks</Text>
            <View style={styles.sectionBody}>
                <Text>{content[id].meta.perks}</Text>
            </View>
        </ScrollView>
    );

    const renderActiveItemInfo = () => {
        switch (status) {
            case 'equipped':
                return (
                    <View>
                        {renderItemAbilities()}
                        {renderItemWidgets()}
                        {renderItemContent()}
                    </View>
                );
            case 'unequipped':
            default:
                return (
                    <View>
                        {renderItemContent()}
                        {renderItemAbilities()}
                        {renderItemWidgets()}
                    </View>
                );
        }
    };

    return (
        <View style={styles.container}>
            {/* <Stack.Screen
        options={{
          title: item.name,
        }}
      /> */}
            <View style={styles.topContainer}>
                <View style={styles.itemImageContainer}>
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                    {renderItemButton()}
                </View>
                <View style={styles.defaultInfoContainer}>{renderDefaultItemInfo()}</View>
            </View>

            <ScrollView style={styles.bottomContainer}>
                {renderActiveItemInfo()}
                {renderActiveModal()}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 25,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    itemImageContainer: {
        flex: 1,
    },
    itemImage: {
        // TODO make image responsive
        width: 100,
        height: 100,
        margin: 20,
    },
    activeItemStatusButton: {
        flex: 2,
    },
    equipButton: {
        backgroundColor: 'gold',
    },
    unequipButton: {
        backgroundColor: 'gray',
    },

    topContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    defaultInfoContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
    itemStatsContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },

    bottomContainer: {
        flex: 3,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    sectionTitle: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        width: '100%',
        textAlign: 'left',
    },
    sectionBody: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'normal',
        textAlign: 'left',
        width: '100%',
        marginBottom: 24,
    },
});

export default ItemPage;

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
    const [status, setStatus] = useState<ItemStatus | null>('unequipped');
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const { inventory: content } = useGameContent();
    // hooks for items that require 3rd party authentication
    const [itemOauthConfig, setItemOauth] = useState<OAuthProvider>(oauthConfigs.undefined);

    const [request, , promptAsync] = useAuthRequest(
        {
            clientId: itemOauthConfig.clientId,
            scopes: itemOauthConfig.scopes,
            redirectUri: `${createOauthRedirectURI()}?provider=${item?.id.toLowerCase()}`,
            usePKCE: false,
        },
        itemOauthConfig,
    );
    // console.log('Item: oauth', itemOauthConfig, request, response);

    useMemo(() => {
        if (item?.id) {
            // configure oauth if required for item equip/unequip
            const oauth = oauthConfigs[item.id];
            if (oauth) setItemOauth(oauth);
            // we cant store item status in config so compute and store in store
            if (!status)
                item!.checkStatus().then((newStatus: ItemStatus) => {
                    setStatus(newStatus);
                });
        }
    }, [item, status]);

    // console.log('Item: item', id, item);
    // console.log('Item: status & modal', status, activeModal);

    useMemo(() => {
        if (id && !item) {
            const item = inventory.find((item) => item.id === id);
            if (item) setItem(item);
        }
    }, [id, item, inventory]);

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
                const result = itemOauthConfig.authorizationEndpoint
                    ? await item.equip(promptAsync)
                    : await item.equip();
                // if result.error = "transceive fail" try majik ritual again
                if (result) {
                    setStatus('post-equip');
                    // TODO api request to add item to their avatar (:DataProvider or :Resource?)
                }

                // assume failure
                setStatus('unequipped');
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
        const onClose = () => {
            setActiveModal(null);
        };
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
                <Pill size="sm" text={status ?? 'unequipped'} />
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

    const renderItemAbilities = () => (
        <View>
            <Text style={styles.sectionTitle}>Abilities</Text>
            {item?.abilities?.length ? (
                <ScrollView horizontal style={{ flex: 1 }}>
                    {item?.abilities.map(
                        (
                            ability, // TODO return null if canDo === false but its async function
                        ) => (
                            // TODO check if canDo. yes? do(), no? checkStatus == equipped yes? nothin, no? pop up modal to equip.
                            // need component for install (maybe rename current 'equipwizard' and copy for modal)
                            <TouchableOpacity key={ability.id} onPress={() => ability.do()}>
                                <View
                                    key={ability.id}
                                    style={{ marginRight: 24, alignItems: 'center' }}
                                >
                                    <Text style={styles.sectionTitle}>{ability.symbol}</Text>
                                    <Text style={styles.sectionBody}>{ability.name}</Text>
                                </View>
                            </TouchableOpacity>
                        ),
                    )}
                </ScrollView>
            ) : (
                <Link to="https://nootype.substack.com/subscribe">
                    <Text>
                        No Actions Available For This Item Yet. Stay Tuned For Game Updates!!
                    </Text>
                </Link>
            )}
        </View>
    );

    const renderItemWidgets = () => (
        <ScrollView>
            <Text style={styles.sectionTitle}>Widgets</Text>
            {item?.widgets?.length ? (
                item.widgets.map((widgy) => (
                    <TouchableOpacity key={widgy.id} onPress={() => widgy.do()}>
                        <View key={widgy.id} style={{ marginRight: 24, alignItems: 'center' }}>
                            <Text style={styles.sectionTitle}>{widgy.symbol}</Text>
                            <Text style={styles.sectionBody}>{widgy.name}</Text>
                        </View>
                    </TouchableOpacity>
                ))
            ) : (
                <Link to="https://nootype.substack.com/subscribe">
                    <Text>
                        No Widgets Available For This Item Yet. Stay Tuned For Game Updates!!
                    </Text>
                </Link>
            )}
        </ScrollView>
    );

    const renderItemContent = () => (
        <ScrollView>
            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.sectionBody}>
                <Text>{content[id]?.meta?.description}</Text>
            </View>

            <Text style={styles.sectionTitle}>Perks</Text>
            <View style={styles.sectionBody}>
                <Text>{content[id]?.meta?.perks}</Text>
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
        backgroundColor: 'pink',
        flex: 1,
        padding: 25,
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
    itemImageContainer: {
        flex: 1,
        margin: 20,
    },
    itemImage: {
        width: 120,
        height: 120,
        // TODO make image responsive
        // width: '100%',
        // height: '100%',
    },
    activeItemStatusButton: {
        width: 30,
    },
    equipButton: {
        backgroundColor: 'gold',
    },
    unequipButton: {
        backgroundColor: 'gray',
    },

    topContainer: {
        flex: 1,
        maxHeight: 200, // idk why this is necessariy. flex: 3 on bottomContainer isnt working
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
        marginTop: 24,
    },

    bottomContainer: {
        flex: 3,
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

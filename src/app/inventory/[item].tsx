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
import { Stack, useLocalSearchParams } from 'expo-router';
import { useAuthRequest } from 'expo-auth-session';

import {
    InventoryItem,
    ItemAbility,
    ItemStatus,
    OAuthProvider,
    OAuthProviderIds,
    StatsAttribute,
} from 'types/GameMechanics';
import ModalRenderer from 'components/modals';

import { createOauthRedirectURI, oauthConfigs, generateRedirectState } from 'utils/oauth';
import { useInventory } from 'hooks/useInventory';
import { useGameContent } from 'contexts/GameContentContext';

import { Link, Pill, WidgetIcon } from 'components';
import { useAuth } from 'contexts/AuthContext';

interface ItemPageProps {
    item: InventoryItem;
}

const ItemPage: React.FC<ItemPageProps> = () => {
    const { item: id }: { item: string } = useLocalSearchParams();
    const { inventory, loading, setItemStatus } = useInventory();
    const [activeAbilities, setActiveAbilities] = useState<ItemAbility[] | void>(undefined);

    const item = inventory.find((i) => i.id === id);
    const status: ItemStatus = item?.status;
    console.log('pg:inventory:item:Load', id, status, item?.tags);
    useMemo(async () => {
        // we cant store item status in config so compute and store in store
        console.log('Item: check status?', item?.id && !status, item?.id, !status);
        if (item?.id && !status) {
            console.log('Item: setting status!!!');
            const newStatus = await item!.checkStatus();
            console.log('pg:Inv:Item check item status', newStatus);
            setItemStatus(item.id, newStatus);
        }
    }, [item, status, setItemStatus]);

    useMemo(async () => {
        console.log(
            'Item: check active abiliti?',
            item?.abilities?.length && !activeAbilities,
            item?.abilities?.length,
            !activeAbilities,
        );
        if (item?.abilities?.length && !activeAbilities) {
            const activeAbs = await Promise.all(
                item.abilities?.filter(async (ability) => {
                    (await ability.canDo(status)) === 'ethereal';
                }) ?? [],
            );
            console.log('pb:Inv:Item post item status abilitiy check', activeAbs);
            setActiveAbilities(activeAbs);
        }
    }, [item, status, activeAbilities]);

    // hooks for items that require 3rd party authentication
    // TODO break functionality into actual separate components to shard state and prevent rerenders
    // primarly <ItemActionbutton>, <ItemActiveAbilities>, <ItemWidgets> all have completely separate data reqs
    const [itemOauthConfig, setItemOauth] = useState<OAuthProvider>(oauthConfigs.undefined);
    // console.log('Item: oauth', itemOauthConfig, request, response);
    const [request, response, promptAsync] = useAuthRequest(
        {
            clientId: itemOauthConfig.clientId,
            scopes: itemOauthConfig.scopes,
            redirectUri: `${createOauthRedirectURI()}?provider=${item?.id}`,
            state: itemOauthConfig.state,
            usePKCE: false,
        },
        itemOauthConfig,
    );

    useMemo(async () => {
        if (item?.id) {
            const oauth = oauthConfigs[item.id];
            // configure oauth if required for item equip/unequip
            console.log('page:inv:item:oauth', oauth);
            if (oauth) {
                setItemOauth({
                    ...oauth,
                    // TODO see if we can add state later in promptAsync.
                    // can pass url as option to promptAsync e.g. promptAsync(oauthConfig, { url:  getredirectUri + generateRedirectState })
                    state: await generateRedirectState(item.id as OAuthProviderIds),
                });
            }
        }
    }, [item]);

    const { player, getSpellBook } = useAuth();
    const { setActiveModal } = useGameContent();
    const { inventory: content } = useGameContent();
    // console.log('Item: status & modal', status, activeModal);

    // TODO render loading screen when oauth items are generating redirect.
    // OR ideally delay oauth state generation until equip()
    // if (itemOauthConfig && !itemOauthConfig.state) setActiveModal({ name: 'create-spellbook' })

    if (loading) return <ActivityIndicator animating size="large" />;

    if (!inventory) return <Text> Item Not Currently Available For Gameplay </Text>;

    if (!item) return <Text> Item Not Currently Available For Gameplay </Text>;

    const onItemEquipPress = async () => {
        if (item.equip) {
            setItemStatus(item.id, 'equipping'); // hide equip button

            // console.log('modal to render', ItemEquipWizardModal, Modals);
            // TODO check if player.id first.
            if (!player?.id) {
                setActiveModal({ name: 'create-spellbook' });
                // await Promise.resolve((r: () => void) => setTimeout(r, 10000))
                await getSpellBook();
                setActiveModal(undefined);
            }

            setActiveModal({ name: 'equip-wizard' });
            try {
                console.log('pg:Inv:Item:equip:oauth', request?.redirectUri, request?.scopes);

                // TODO should we add tags to items for different callback types and UI filtering?
                // or just a single, optional callback func that handles everything for equip?
                const result =
                    itemOauthConfig.authorizationEndpoint && request
                        ? await item.equip(promptAsync)
                        : await item.equip();
                // if result.error = "transceive fail" try majik ritual again
                console.log('Oauth request/response', request, response);

                if (result) {
                    // setItemStatus(item.id, 'post-equip');
                    // TODO api request to add item to their avatar (:DataProvider or :Resource?)
                    setItemStatus(item.id, 'equipped');
                } else {
                    // assume failure
                    setItemStatus(item.id, 'unequipped');
                }
            } catch (e) {
                console.log('Error Equipping:', e);
                setItemStatus(item.id, 'unequipped');
            }
        }
    };

    const onItemUnequipPress = () => {
        if (item.unequip) item.unequip();
        setItemStatus(item.id, 'unequipping');
    };

    const renderItemButton = () => {
        if (status === 'ethereal' && item.installLink)
            return (
                <Link to={item.installLink} trackingId="item-page-install-cta">
                    <Button
                        title="Install"
                        style={[styles.activeItemStatusButton, styles.equipButton]}
                    />
                </Link>
            );

        // dont render if oauth request going out already.
        // TODO is that redundant if we set status to 'equipping' tho?
        console.log('item action button');

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

        if (status === 'unequipped')
            return (
                <Button
                    title="Equip"
                    disabled
                    style={[styles.activeItemStatusButton, styles.unequipButton]}
                />
            );
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

    const onAbilityPress = async (ability: ItemAbility) => {
        setActiveModal({ name: 'ability-check' });
        await ability.canDo(item.status!);
        setActiveModal({ name: 'ability-activate' });
        try {
            await ability.do();
            setActiveModal({ name: 'ability-complete' });
        } catch (e) {
            setActiveModal({ name: 'ability-fail' });
        }
    };

    const renderActiveItemAbilities = () => (
        <View>
            <Text style={styles.sectionTitle}>Active Abilities</Text>
            {activeAbilities?.length ? (
                <ScrollView horizontal style={{ flex: 1 }}>
                    {activeAbilities.map((ability) => (
                        // TODO check if canDo. yes? do(), no? checkStatus == equipped yes? nothin, no? pop up modal to equip.
                        // TODO return null if canDo === false but its async function
                        // need component for install (maybe rename current 'equipwizard' and copy for modal)
                        <TouchableOpacity key={ability.id} onPress={() => onAbilityPress(ability)}>
                            <View style={{ marginRight: 24, alignItems: 'center' }}>
                                <Text style={styles.sectionTitle}>{ability.symbol}</Text>
                                <Text style={styles.sectionBody}>{ability.name}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
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

    const renderAllItemAbilities = () => (
        <>
            <Text style={styles.sectionTitle}>All Abilities</Text>
            {item?.abilities?.length ? (
                <ScrollView horizontal style={{ flex: 1 }}>
                    {item?.abilities.map((ability) => (
                        <View key={ability.id} style={{ marginRight: 24, alignItems: 'center' }}>
                            <Text style={styles.sectionTitle}>{ability.symbol}</Text>
                            <Text style={styles.sectionBody}>{ability.name}</Text>
                        </View>
                    ))}
                </ScrollView>
            ) : (
                <Link to="https://nootype.substack.com/subscribe">
                    <Text>
                        No Actions Available For This Item Yet. Stay Tuned For Game Updates!!
                    </Text>
                </Link>
            )}
        </>
    );

    const renderItemWidgets = () => (
        <>
            <Text style={styles.sectionTitle}>Widgets</Text>
            <ScrollView horizontal>
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
        </>
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
                        {renderActiveItemAbilities()}
                        {renderItemWidgets()}
                        {renderItemContent()}
                        {renderAllItemAbilities()}
                    </View>
                );
            case 'unequipped':
            default:
                return (
                    <View>
                        {renderItemContent()}
                        {renderAllItemAbilities()}
                        {renderItemWidgets()}
                    </View>
                );
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: item.name,
                }}
            />
            <ModalRenderer item={item} status={status} />
            <View style={styles.topContainer}>
                <View style={styles.itemImageContainer}>
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                    {renderItemButton()}
                </View>
                <View style={styles.defaultInfoContainer}>{renderDefaultItemInfo()}</View>
            </View>

            <ScrollView style={styles.bottomContainer}>{renderActiveItemInfo()}</ScrollView>
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

import React, { useMemo, useState } from 'react';
import { Text, StyleSheet, SectionList, ActivityIndicator, View } from 'react-native';
// import { Stack } from 'expo-router';
import { groupBy, entries, map } from 'lodash/fp';

import { useInventory } from 'hooks';

import { Card } from 'components';
import { InventoryItem } from 'types/GameMechanics';
import { useGameContent } from 'contexts';

const InventoryScreen: React.FC = () => {
    const { inventory, loading } = useInventory();
    const [categorizedInventory, setCategories] = useState<
        { title: string; data: InventoryItem[] }[]
    >([]);
    const { inventory: content } = useGameContent();

    useMemo(async () => {
        if (inventory.length) {
            const inventoryWithStatus = await Promise.all(
                inventory.map(async (item: InventoryItem) =>
                    item.status ? item : { ...item, status: await item.checkStatus() },
                ),
            );
            // uncomment to test out multi, status category display
            // async (item: InventoryItem, i) => i % 2 ? { ...item, status: 'unequipped' } : { ...item, status: 'equipped' }))

            const grouped = groupBy('status', inventoryWithStatus);

            // setup categories for SectionList format
            const categorySections = map(([title, data]: [string, InventoryItem[]]) => ({
                title,
                data,
            }))(entries(grouped));

            setCategories(categorySections);
        }
    }, [inventory]);

    const renderItem = ({ item }: { item: InventoryItem }) =>
        item.status === 'ethereal' ? null : (
            <Card
                // key={item.id}
                horizontal
                styleOverride={styles.itemCard}
                image={item.image}
                title={item.name}
                path={`/inventory/${item.id}`}
                pathParams={{ id: item.id }}
                badges={item.attributes.map((a) => `+${a.value} ${a.symbol} `)}
            />
        );

    const renderCategoryHeader = ({ section: { title } }: { section: { title: string } }) =>
        title === 'ethereal' ? null : (
            <Text style={styles.inventoryHeader}>{title.toUpperCase()}</Text>
        );

    return (
        <>
            <Text style={styles.pageDescription}>{content?.index?.meta?.description}</Text>
            {loading ? (
                <ActivityIndicator animating size="large" />
            ) : (
                <SectionList
                    style={styles.container}
                    sections={categorizedInventory}
                    ItemSeparatorComponent={() => <View style={styles.itemSeperator} />}
                    renderSectionHeader={renderCategoryHeader}
                    renderItem={({ item }) => renderItem({ item })}
                />
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'pink',
        flex: 1,
        width: '100%',
    },
    pageDescription: {
        backgroundColor: 'pink',
        fontSize: 18,
        padding: 10,
        // fontWeight: 'bold',
        // marginTop: 18,
        // marginBottom: 18,
        // marginLeft: 10, // same as list
    },
    inventoryHeader: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 40,
        marginBottom: 20,
        marginLeft: 10, // same as list
    },
    itemList: {
        flex: 1,
        padding: 50,
        height: 400,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    itemSeperator: {
        // TODO dope pink/blue wavy thing w/ screen pink background
        margin: 20,
    },
    itemCard: {
        flex: 1,
        marginBottom: 18,
        // maxWidth: 500,
        shadowColor: 'black',
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
});

export default InventoryScreen;

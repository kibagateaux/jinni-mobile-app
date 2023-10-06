import React, { useEffect, useMemo, useState } from 'react';
import { Text, StyleSheet, View, FlatList, SectionList } from 'react-native';
import { groupBy, entries, map } from 'lodash/fp';

import { useInventory } from 'hooks';
import { useAuth } from 'contexts';

import { Card } from 'components';
import { InventoryItem } from 'types/GameMechanics';
import { ScrollView } from 'react-native-gesture-handler';

const InventoryScreen: React.FC = () => {
    const { user } = useAuth();
    const { inventory, loading } = useInventory();
    const [categorizedInventory, setCategories] = useState<any>([]);

    useMemo(async () => {
        if(inventory.length) {
            const inventoryWithStatus = await Promise.all(
                inventory.map(async (item: InventoryItem) =>
                    item.status ? item : ({ ...item, status: await item.checkStatus() })));
                // uncomment to test out multi, status category display
                // async (item: InventoryItem, i) => i % 2 ? { ...item, status: 'unequipped' } : { ...item, status: 'equipped' }))
            
            const grouped = groupBy('status', inventoryWithStatus);
            
            // setup categories for SectionList format
            const categorySections = map(
                ([title, data]: [string, InventoryItem[]]) => ({ title, data }))
                (entries(grouped)
            );

            setCategories(categorySections);
        }
    }, [inventory]);

    const renderItem = ({ item }: { item: InventoryItem }) => (
        <Card
            key={item.id}
            styleOverride={styles.itemCard}
            image={item.image}
            title={item.name}
            path={`/inventory/${item.id}`}
            pathParams={{ id: item.id }}
            badges={item.attributes.map(a => `+${a.value} ${a.symbol} `)}
        />
    );

    const renderCategoryHeader = ({ section: { title } }: any) =>
        <Text style={styles.inventoryHeader}>{title.toUpperCase()}</Text>;

    return (
        // TODO https://reactnative.dev/docs/optimizing-flatlist-configuration
        <SectionList
            style={styles.container}
            sections={categorizedInventory}
            renderSectionHeader={renderCategoryHeader}
            renderItem={({ item }) => renderItem({ item })}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    inventoryHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        margin: 25,
    },
    itemList: {
        flex: 1,
        // height: 400,
        padding: 50,
        width: '100%',
        flexDirection: 'row',
    },
    itemCard: {
        // flex: 1,
        maxWidth: '40%',
        shadowColor: 'black',
        shadowOpacity: 0.5,
        shadowRadius: 5,
    }
});

export default InventoryScreen;

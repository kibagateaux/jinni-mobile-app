import React, { useEffect, useMemo, useState } from 'react';
import { Text, StyleSheet, View, FlatList } from 'react-native';
import { groupBy } from 'lodash/fp';

import { useInventory } from 'hooks';
import { useAuth } from 'contexts';

import { Card } from 'components';
import { InventoryItem } from 'types/GameMechanics';

const InventoryScreen: React.FC = () => {
    const { user } = useAuth();
    const { inventory, loading } = useInventory({username: user?.name});
    const [categorizedInventory, setCategories] = useState<{[key: string]: InventoryItem[]}>({});

    useMemo(async () => {
        if(inventory.length) {
            const inventoryWithStatus = await Promise.all(inventory.map(
                async (item: InventoryItem) => item.status ? item : ({ ...item, status: await item.checkStatus() })))
            const grouped = groupBy('status', inventoryWithStatus);
            setCategories(grouped);
        }
    }, [inventory]);

    const renderItem = ({ item }: { item: InventoryItem }) => (
        <Card
            key={item.id}
            styleOverride={styles.itemCard}
            image={item.image}
            title={item.name}
            // subtitle={item.dataSourceProvider}
            path={`/inventory/${item.id}`}
            pathParams={{ id: item.id }}
            badges={item.attributes.map(a => `+${a.value} ${a.symbol} `)}
        />
    );

    return (
        <View style={styles.container}>
            {Object.entries(categorizedInventory).map(([status, items]) => (
                <View key={status}>
                    <Text style={styles.inventoryHeader}> {status.toUpperCase()} ITEMS </Text>
                    <FlatList
                        data={items}
                        renderItem={renderItem}
                        keyExtractor={(item: InventoryItem) => item.id}
                        numColumns={2}
                    />
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inventoryHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        margin: 25,
    },
    itemList: {
        // flex: 1,
        width: '100%',
        flexDirection: 'row',
        // alignItems: 'flex-start',
        // justifyContent: 'flex-start',
    },
    itemCard: {
        // flex: 1,
        // margin: 15,
        maxWidth: '40%',
        shadowColor: 'black',
        shadowOpacity: 0.5,
        shadowRadius: 5,
    }
});

export default InventoryScreen;

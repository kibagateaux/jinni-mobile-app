import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { useInventory } from 'hooks';
import { useAuth } from 'contexts';

import { Card } from 'components';
import { InventoryItem } from 'types/GameMechanics';

const InventoryScreen: React.FC = () => {
    const { user } = useAuth();
    const { inventory, loading } = useInventory({username: user?.name});

    const equipped = inventory.filter((item: InventoryItem) => item.equipped)
    const unequipped = inventory.filter((item: InventoryItem) => !item.equipped)

    console.log("Inventory", inventory, loading)
    const renderItem = ({ item }: { item: InventoryItem }) => (
        <Card
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
            <FlatList
                data={equipped}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={2}
            />
            <FlatList
                data={unequipped}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={2}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemCard: {
        // flex: 1,
        // margin: 1,
        // shadowColor: 'black',
        // shadowOpacity: 0.5,
        // shadowRadius: 5,
    }
});

export default InventoryScreen;

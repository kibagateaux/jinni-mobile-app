import React, { useEffect, useMemo, useState } from 'react';
import { Text, StyleSheet, View, FlatList } from 'react-native';
import { groupBy } from 'lodash/fp';

import { useInventory } from 'hooks';
import { useAuth } from 'contexts';

import { Card } from 'components';
import { InventoryItem } from 'types/GameMechanics';
import { queryHealthData } from 'utils/inventory/android-health-connect';

const TranmissionsScreen: React.FC = () => {
    const { user } = useAuth();
    const { inventory, loading } = useInventory({username: user?.name});
    const [dailyActivities, setDailyActivities] = useState<any>({});

    useEffect(() => {
        const dailies = Promise.all([
            queryHealthData({
                activity: 'Steps',
                startTime: '2023-06-09T23:53:15.405Z',
                endTime: '2023-09-09T23:53:15.405Z',
                operator: 'between'
            }),
        ])
        dailies.then((data) => {
            console.log("Trans: data", data);
            setDailyActivities({
                data
            })
        })
    }, [dailyActivities])

    return (
        null
        // <View style={styles.container}>
        //   <Text> "Your Daily Tranmissions" </Text>
        // </View>
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

export default TranmissionsScreen;

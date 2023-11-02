import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Kin } from 'types/SpiritWorld';

interface ActivatedDayProps {
    date: string; // yyyy-mm-dd
    kin: Kin;
    styleOverride?: object;
}

const ActivatedDay = ({ date, kin, styleOverride = {} }: ActivatedDayProps) => {
    // TODO should always have kin just havent generated everything yet.
    console.log('activated dat', date, kin, styleOverride);

    return (
        <View style={[styles.container, styleOverride]}>
            <Text style={styles.header}>Kin {kin[0]} / 260</Text>
            <Text style={styles.header}>
                Day of the {kin[1].id} {kin[2].id}
            </Text>
            <Text style={styles.header}>Today Jinn are powerful in: </Text>
            <Text style={styles.header}>{kin[2].activations.map((act) => act).join(', ')}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 50,
    },
    header: {
        fontSize: 24,
        fontWeight: '600',
        color: 'white',
    },
});
export default ActivatedDay;

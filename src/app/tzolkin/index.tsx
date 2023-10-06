import React, { useEffect, useMemo, useState } from 'react';
import { Text, StyleSheet, View, FlatList } from 'react-native';
import { CalendarList, Agenda } from 'react-native-calendars';

import { useAuth } from 'contexts';
import { tzolkinHistory } from 'utils/mayanese';
import { MarkedDates } from 'react-native-calendars/src/types';

type CalendarDisplayTypes = 'serial' | 'synchronous';

const TzolkinScreen = () => {
    const { user } = useAuth();
    const [displayType, setDisplayType] = useState<CalendarDisplayTypes>('serial');
    console.log('Tzolkin:config', tzolkinHistory);
    

    const onMonthsChanged = (months) => {
        // TODO compute or call API for wavespell and Kin days
        // TODO call API for transmissions for KIN
        console.log('now these months are visible', months);
    }

    const TzolkinDay = () => {
        return (
            <></>
        );
    };

    // TODO have data for selected day show up below calendar 

    const renderNormieCalendar = () => {
        return (
            // <View style={{ height: '100%', width: '100%'}}>

            <CalendarList
                calendarStyle={styles.serialCalendar}
                markingType={'custom'}
                markedDates={tzolkinHistory as MarkedDates}
                // dayComponent={TzolkinDay}
                
                // Enable paging on horizontal, default = false
                pagingEnabled={true}
                onVisibleMonthsChange={onMonthsChanged}
                // Set custom calendarWidth.
                pastScrollRange={6}
                futureScrollRange={6}
                // calendarWidth={320}
                // ...calendarListParams
                // ...calendarParams
                />
            // </View>
        );
    };

    const renderThorstiqueCalendar = () => {
        // TODO build interwoven frequencies of data. vertical = day, horizontal = trends
    };
    
    return displayType === 'serial' ? renderNormieCalendar() : renderThorstiqueCalendar(); 
};

const styles = StyleSheet.create({
    serialCalendar: {
        height: '50%',
        width:  '100%',
    }
});

export default TzolkinScreen;

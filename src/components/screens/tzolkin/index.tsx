import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { now } from 'lodash/fp';

import { formatToCal, tzolkinHistory } from 'utils/mayanese';
import { MarkedDates } from 'react-native-calendars/src/types';
import { useTheme } from 'contexts/ThemeContext';
import ActivatedDay from 'components/tzolkin/ActivatedDay';

type CalendarDisplayTypes = 'serial' | 'synchronous';

const TzolkinScreen = () => {
    const theme = useTheme();
    const [displayType /* setDisplayType */] = useState<CalendarDisplayTypes>('serial');
    const [activatedDay, setActivatedDay] = useState<string>(formatToCal(now()));
    console.log('Tzolkin:activeDay', activatedDay, theme.colorScheme);
    console.log('Tzolkin:config', tzolkinHistory);

    const coloring = {
        backgroundColor: theme.accentColor,
        color: theme.altTextColor,
    };

    const onMonthsChanged = (months) => {
        // TODO compute or call API for wavespell and Kin days
        // TODO call API for transmissions for KIN
        console.log('now these months are visible', months);
    };

    // const TzolkinDay = () => {
    //     return <></>;
    // };

    // TODO have data for selected day show up below calendar

    const renderNormieCalendar = () => {
        const calStyle = {
            calendarBackground: theme.accentColor,
            dayTextColor: theme.altTextColor,
            monthTextColor: theme.altTextColor,
        };
        return (
            // <View style={{ height: '100%', width: '100%'}}>

            <CalendarList
                // displayLoadingIndicator TODO dynamic based on API call
                onVisibleMonthsChange={onMonthsChanged}
                firstDay={7} // start post-shabbat. Super cute sunday fundays
                hideDayNames={true}
                showWeekNumbers={false}
                pastScrollRange={6}
                futureScrollRange={6}
                horizontal
                showsHorizontalScrollIndicator
                // Enable paging on horizontal, default = false
                pagingEnabled={true}
                markingType={'multi-period'}
                markedDates={tzolkinHistory as MarkedDates}
                style={[coloring, styles.serialCal]}
                theme={calStyle}
                onDayPress={(d) => setActivatedDay(d.dateString)}
                // dayComponent={TzolkinDay}

                // Set custom calendarWidth.

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

    return (
        <View>
            <View style={[coloring, styles.calContainer]}>
                {displayType === 'serial' ? renderNormieCalendar() : renderThorstiqueCalendar()}
            </View>
            <View style={[coloring, styles.calContainer]}>
                {tzolkinHistory[activatedDay] ? (
                    <ActivatedDay
                        date={activatedDay}
                        styleOverride={{ coloring: theme.altTextColor }}
                        kin={tzolkinHistory[activatedDay]?.kin}
                    />
                ) : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    calContainer: {
        height: '50%',
        width: '100%',
    },
    serialCal: {},
});

export default TzolkinScreen;

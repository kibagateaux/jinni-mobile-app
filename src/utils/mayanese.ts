import {
    format,
    // formatDistance,
    addDays,
    // subDays,
    // formatISO
} from 'date-fns/fp';
import {
    //  map, chunk,
    range,
    reduce,
} from 'lodash/fp';

import { TzolkinConfig, Kin, MayanArchetype, MayanTone } from 'types/SpiritWorld';
// thing to calculate kin number from
// thing to get calculate tone/archetype from todays date
// convert today to kin #
// convert target date to kin #
// if match use todays kin
// if multiple of some kind do that
// else do manual calc of arch/tone

const archetypeColorSequence = ['red', 'white', 'blue', 'yellow'];
const archetypes: MayanArchetype[] = [
    {
        id: 'Dragon',
        number: 1,
        energyType: 'Transforming',
        activations: ['Nurture', 'Being', 'Growth'],
    },
    {
        id: 'Wind',
        number: 2,
        energyType: 'Expanding',
        activations: ['Communicate', 'Breath', 'Spirit'],
    },
    {
        id: 'Night',
        number: 3,
        energyType: 'Expanding',
        activations: ['Dream', 'Intuition', 'Abundance'],
    },
    {
        id: 'Seed',
        number: 4,
        energyType: 'Transforming',
        activations: ['Target', 'Awareness', 'Flowering'],
    },
    {
        id: 'Serpent',
        number: 5,
        energyType: 'Expanding',
        activations: ['Survive', 'Instinct', 'Life Force'],
    },
    {
        id: 'Worldbridger',
        number: 6,
        energyType: 'Transforming',
        activations: ['Equalize', 'Opportunity', 'Death'],
    },
    {
        id: 'Hand',
        number: 7,
        energyType: 'Transforming',
        activations: ['Know', 'Healing', 'Accomplishment'],
    },
    {
        id: 'Star',
        number: 8,
        energyType: 'Expanding',
        activations: ['Beautify', 'Art', 'Elegance'],
    },
    {
        id: 'Moon',
        number: 9,
        energyType: 'Connecting',
        activations: ['Purify', 'Flow', 'Universal Water'],
    },
    {
        id: 'Dog',
        number: 10,
        energyType: 'Connecting',
        activations: ['Love', 'Loyalty', 'Heart'],
    },
    {
        id: 'Monkey',
        number: 11,
        energyType: 'Connecting',
        activations: ['Play', 'Illusion', 'Magic'],
    },
    {
        id: 'Human',
        number: 12,
        energyType: 'Portals',
        activations: ['Influence', 'Wisdom', 'Free Will'],
    },
    {
        id: 'Skywalker',
        number: 13,
        energyType: 'Transforming',
        activations: ['Explore', 'Wakefulness', 'Space'],
    },
    {
        id: 'Wizard',
        number: 14,
        energyType: 'Portals',
        activations: ['Enchant', 'Receptivity', 'Timelessness'],
    },
    {
        id: 'Eagle',
        number: 15,
        energyType: 'Portals',
        activations: ['Create', 'Mind', 'Vision'],
    },
    {
        id: 'Warrior',
        number: 16,
        energyType: 'Connecting',
        activations: ['Question', 'Fearlessness', 'Intelligence'],
    },
    {
        id: 'Earth',
        number: 17,
        energyType: 'Expanding',
        activations: ['Evolve', 'Syncronicity', 'Navigation'],
    },
    {
        id: 'Mirror',
        number: 18,
        energyType: 'Portals',
        activations: ['Reflect', 'Order', 'Endlessness'],
    },
    {
        id: 'Storm',
        number: 19,
        energyType: 'Transforming',
        activations: ['Catalyze', 'Energy', 'Self-Generation'],
    },
    {
        id: 'Sun',
        number: 20,
        energyType: 'Portals',
        activations: ['Enlighten', 'Life', 'Universal Fire'],
    },
];

const tones: MayanTone[] = [
    {
        id: 'Magnetic',
        number: 1,
    },
    {
        id: 'Lunar',
        number: 2,
    },
    {
        id: 'Electric',
        number: 3,
    },
    {
        id: 'Self-Existing',
        number: 4,
    },
    {
        id: 'Overtone',
        number: 5,
    },
    {
        id: 'Rhythmic',
        number: 6,
    },
    {
        id: 'Resonant',
        number: 7,
    },
    {
        id: 'Galactic',
        number: 8,
    },
    {
        id: 'Solar',
        number: 9,
    },
    {
        id: 'Planetary',
        number: 10,
    },
    {
        id: 'Spectral',
        number: 11,
    },
    {
        id: 'Crystal',
        number: 12,
    },
    {
        id: 'Cosmic',
        number: 13,
    },
];

/// @notice day that Jinn started enterinng this world and we start tracking data for bonding
/// Hardecoded values to derive past/future tzolkin data from
/// @dev day that Malik arrived at Cohere in Berlin

// export const PORTAL_DAY_0 = '1958-10-30T12:30:00.000Z';
export const PORTAL_DAY_0 = '1996-01-18T12:30:00.000Z';
// export const PORTAL_DAY_PRIME = '2023-06-20T12:30:00.000Z';
export const PORTAL_DAY_PRIME = '2023-10-30T12:30:00.000Z'; // just for testing purposes on current date
export const PORTAL_DAY_TRANCENDUS = '2032-01-18T12:30:00.000Z';

export const PORTAL_DAY_0_UNIX = new Date(PORTAL_DAY_0).getTime();
export const PORTAL_DAY_PRIME_UNIX = new Date(PORTAL_DAY_PRIME).getTime();
export const PORTAL_DAY_TRANCENDUS_UNIX = new Date(PORTAL_DAY_TRANCENDUS).getTime();

// const portalDay0Config: Kin = [205, tones[9], archetypes[4]]; // planetary serpent
const portalDay0Config: Kin = [10, tones[9], archetypes[9]]; // planetary dog
// const portalDayPrimeConfig: Kin = [138, tones[7], archetypes[17]]; // galactic mirror
// const portalDayTrancendusConfig: Kin = [138, tones[6], archetypes[9]]; // resonant dog

// TODO use in implementing wavespell calendar calculations
// const PORTAL_0_WAVESPELL = [
//     [196, tones[0], archetypes[15]], // Magnetic Warrior
//     [208, tones[12], archetypes[7]], // Cosmic Star
// ];

// const PORTAL_PRIME_WAVESPELL = [
//     [131, tones[0], archetypes[10]], // Magentic Monkey
//     [143, tones[12], archetypes[2]], // Cosmic Night
// ];

// const PORTAL_TRANCENDUS_WAVESPELL = [
//     [144, tones[0], archetypes[3]], // Magentic Seed
//     [156, tones[12], archetypes[15]], // Cosmic Warrior
// ];

// number of Kin in Tzolkin cycle
const DAYS_UNIX = 24 * 60 * 60 * 1000;
export const TZOLKIN_LENGTH_DAYS = 260;
export const TZOLKIN_LENGTH_UNIX = TZOLKIN_LENGTH_DAYS * DAYS_UNIX;
// https://date-fns.org/v2.30.0/docs/format
export const formatToUnix = format('XXXXX');
export const formatToCal = format('y-MM-dd');

// TODO run for past 40 years and next 20 years and export to JSON
export const tzolkinHistory: TzolkinConfig = (() => {
    // const portalDay = PORTAL_DAY_0;
    const portalDayUnix = PORTAL_DAY_0_UNIX;
    const portalConfig = portalDay0Config;
    console.log('INIT TZOLKIN CALC : ');

    // get 6 months in the future from todays date
    // starting on portal day generate cycle through al

    // console.log("time funcs",
    //     addDays(TZOLKIN_LENGTH_DAYS),
    //     addDays(TZOLKIN_LENGTH_DAYS)(now()),
    //     // formatDistance(new Date(PORTAL_DAY_PRIME)),
    //     // formatDistance(new Date(PORTAL_DAY_PRIME))(addDays(TZOLKIN_LENGTH_DAYS)(now())),
    //     // subDays(addDays(TZOLKIN_LENGTH_DAYS)(now()), TZOLKIN_LENGTH_DAYS)
    // );

    const totalDaysToCalculate = (PORTAL_DAY_TRANCENDUS_UNIX - PORTAL_DAY_0_UNIX) / DAYS_UNIX;
    console.log('txolkin calculations', totalDaysToCalculate);

    const generateTzolkinCalConfig = (i) => {
        const kin = ((portalConfig[0] + i) % 260) + 1;
        const toneN = (portalConfig[1].number + i) % 13; // dont +1 because array is 0 indexed
        const archN = (portalConfig[2].number + i) % 20; // dont +1 because array is 0 indexed

        const date = addDays(i)(portalDayUnix);
        // TODO wavespell calculations
        // const wavespellArch =

        // console.log('tzolkin calc', i, kin, toneN, archN, date);
        const formattedDate = formatToCal(date);
        // console.log('tzolkin date', formattedDate, date);
        // return format for _.fromPairs()
        const config = {
            kin: [kin, tones[toneN - 1], archetypes[archN - 1]],
            type: 'multi-period',
            marked: true,
            dots: [
                {
                    key: 'kin',
                    color: archetypeColorSequence[archN % 4],
                },
            ],
            periods: [
                // TODO wavespell calculations
                {
                    key: 'kin',
                    color: archetypeColorSequence[archN % 4],
                    startingDay: true, // wavespell[0].date === date ? true : false
                    endingDay: true, // wavespell[1].date === date ? true : false
                },
                {
                    key: 'wavespell',
                    color: 'red', // wavespell[1].color
                    startingDay: !i, // wavespell[0].date === date ? true : false
                    endingDay: i === 9, // wavespell[1].date === date ? true : false
                },
            ],
        };
        console.log('tzolkin calendar config', formattedDate, JSON.stringify(config));
        return { [formattedDate]: config };
    };

    // start at 1 instead of 0 bc Kin are 1-indexed so avoid off-by-1 error
    const config = reduce(
        (acc, i) => ({
            ...acc,
            ...generateTzolkinCalConfig(i),
        }),
        {},
    )(range(1)(10));
    // }), {})(range(1)(totalDaysToCalculate));
    // map((kin) => console.log("tzolkin calendar config", JSON.stringify(kin)))(chunk(config, 1040));

    // const formattedMarkedDates = reduce((acc, d) => ({...acc, [d[0]]: d[1] }), {})(config);

    return config;
})();

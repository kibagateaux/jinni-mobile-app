// import { Platform } from 'react-native';
// import * as Location from 'expo-location';

// import {
//     InventoryIntegration,
//     DjinnStat,
//     SpiritStat,
//     HealthStat,
//     CommunityStat,
//     InventoryItem,
// } from 'types/GameMechanics';

// const equip = async () => {
//     console.log('equipping location-back!!!');
//     try {
//         const { status } = await Location.requestBackgroundPermissionsAsync();
//     } catch (e) {
//         console.log('Inv:location-back:equip:ERR', e);
//         return false;
//     }
// };

// const unequip = async () => {
//     console.log('unequip location-back!!!');
//     try {
//     } catch (e) {
//         console.log('Inv:location-back:equip:ERR', e);
//         return false;
//     }
// };

// const item = {
//     id: 'phone-location-background',
//     name: 'Orb of Telepathy',
//     datasource: 'phone-location-background',
//     image: 'https://i1.sndcdn.com/artworks-000415907772-8vekjg-t500x500.jpg',
//     attributes: [
//         { ...DjinnStat, value: 20 },
//         { ...CommunityStat, value: 20 },
//         { ...SpiritStat, value: 10 },
//         { ...HealthStat, value: 10 },
//     ],
//     checkStatus: async () => {
//         const { status } = await Location.getForegroundPermissionsAsync();
//         switch (status) {
//             case 'granted':
//                 return 'equipped';
//             case 'denied':
//                 return 'destroyed';
//             case 'undetermined':
//             default:
//                 return 'ethereal';
//         }
//     },
//     canEquip: async () => true,
//     equip,
//     unequip,
//     // actions: [],
// };

// const initPermissions = () => {};
// const getPermissions = () => {};

// export default {
//     item,
//     checkEligibility: async () => true,
//     equip,
//     unequip,
//     getPermissions,
//     initPermissions,
// } as InventoryIntegration;

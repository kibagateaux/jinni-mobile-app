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
//     console.log('equipping location-fore!!!');
//     try {
//         const { status } = await Location.requestForegroundPermissionsAsync();
//     } catch (e) {
//         console.log('Inv:location-fore:equip:ERR', e);
//         return false;
//     }
// };

// const unequip = async () => {
//     console.log('unequip location-fore!!!');
//     try {
//         // await Location.
//     } catch (e) {
//         console.log('Inv:location-fore:equip:ERR', e);
//         return false;
//     }
// };

// const item = {
//     id: 'phone-location-foreground',
//     name: 'Homing Beacon',
//     datasource: 'phone-location-foreground',
//     image: 'https://static.wikia.nocookie.net/starwars/images/2/21/S-threadtransmitterbracelet-TLJVD.png/revision/latest?cb=20230729025521',
//     attributes: [
//         { ...DjinnStat, value: 5 },
//         { ...CommunityStat, value: 10 },
//         { ...HealthStat, value: 5 },
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

// // TODO should we abstract NFC Manager out of SignWithID so we can request permissions separately?
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

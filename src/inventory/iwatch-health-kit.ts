import { DjinnStat, HealthStat, IntelligenceStat, InventoryItem } from 'types/GameMechanics';

const item: InventoryItem = {
    id: 'IwatchHealthKit',
    name: 'iWatch Health Kit',
    datasource: 'IwatchHealthKit',
    image: 'https://www.apple.com/v/ios/ios-13/images/overview/health/health_hero__fjxh8smk2q6q_large_2x.jpg',
    installLink: 'https://apps.apple.com/us/app/health/id1206187994',
    attributes: [
        { ...DjinnStat, value: 15 },
        { ...HealthStat, value: 10 },
        { ...IntelligenceStat, value: 2 },
    ],
    checkStatus: async () => {
        // TODO
        return 'unequipped';
    },
    canEquip: async () => true,
    // equip: () => {} ,
    // unequip: () => {} ,
    // actions: [],
};

export default {
    item,
};

import iosHealth from './ios-health-kit'
import androidHealth from './android-health-connect'
import { InventoryIntegration } from 'types/GameMechanics';

// TODO read directory file names and generate export object with inventory ids for easier consumption
export default {
    iosHealth,
    androidHealth,
};
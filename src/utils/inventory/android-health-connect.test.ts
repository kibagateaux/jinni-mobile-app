import { InventoryItem, HoF } from 'src/types/GameMechanics';
import {
    checkEligibility,
    getPermissions,
    initPermissions,
    equip,
    unequip,
    item as androidHealthItem,
} from 'src/utils/inventory/android-health-connect';

describe('InventoryItem', () => {
    it('should have correct properties', () => {
        expect(androidHealthItem).toHaveProperty('id');
        expect(androidHealthItem).toHaveProperty('name');
        expect(androidHealthItem).toHaveProperty('image');
        expect(androidHealthItem).toHaveProperty('tags');
        expect(androidHealthItem).toHaveProperty('attributes');
        expect(androidHealthItem).toHaveProperty('datasource');
        expect(androidHealthItem).toHaveProperty('installLink');
        expect(androidHealthItem).toHaveProperty('checkStatus');
        expect(androidHealthItem).toHaveProperty('canEquip');
        expect(androidHealthItem).toHaveProperty('equip');
        expect(androidHealthItem).toHaveProperty('unequip');
    });
});

describe('checkEligibility', () => {
    it('should return false if platform is not android', async () => {
        jest.mock('react-native', () => ({
            Platform: {
                OS: 'ios',
            },
        }));
        expect(await checkEligibility()).toBe(false);
    });

    it('should return false if SDK is not available', async () => {
        jest.mock('react-native-health-connect', () => ({
            getSdkStatus: () => 'SDK_NOT_AVAILABLE',
        }));
        expect(await checkEligibility()).toBe(false);
    });

    it('should throw error if SDK fails to initialize', async () => {
        jest.mock('react-native-health-connect', () => ({
            getSdkStatus: () => 'SDK_AVAILABLE',
            initialize: () => false,
        }));
        await expect(checkEligibility()).rejects.toThrow('Unable to initialize Android Health');
    });
});

describe('getPermissions', () => {
    it('should return false if checkEligibility returns false', async () => {
        jest.mock('./android-health-connect', () => ({
            checkEligibility: () => false,
        }));
        expect(await getPermissions()).toBe(false);
    });

    it('should return false if no permissions are granted', async () => {
        jest.mock('react-native-health-connect', () => ({
            getGrantedPermissions: () => [],
        }));
        expect(await getPermissions()).toBe(false);
    });

    it('should return true if permissions are granted', async () => {
        jest.mock('react-native-health-connect', () => ({
            getGrantedPermissions: () => ['Steps'],
        }));
        expect(await getPermissions()).toBe(true);
    });
});

describe('initPermissions', () => {
    it('should return false if checkEligibility returns false', async () => {
        jest.mock('./android-health-connect', () => ({
            checkEligibility: () => false,
        }));
        expect(await initPermissions()).toBe(false);
    });

    it('should return true if permissions are granted', async () => {
        jest.mock('react-native-health-connect', () => ({
            requestPermission: () => true,
        }));
        expect(await initPermissions()).toBe(true);
    });
});

describe('equip', () => {
    it('should return false if checkEligibility returns false', async () => {
        jest.mock('./android-health-connect', () => ({
            checkEligibility: () => false,
        }));
        expect(await equip()).toBe(false);
    });

    it('should return true if permissions are initialized', async () => {
        jest.mock('./android-health-connect', () => ({
            initPermissions: () => true,
        }));
        expect(await equip()).toBe(true);
    });
});

describe('unequip', () => {
    it('should return true', async () => {
        expect(await unequip()).toBe(true);
    });
});

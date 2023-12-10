import item from '../android-health-connect';
import mockHealth from 'react-native-health-connect';
import Permission from 'react-native-health-connect/types';

jest.mock('react-native-health-connect');

beforeEach(() => {
    // assume app installed for simplicity of testing.
    // manually override when needed
    item.checkEligibility = async () => true;
});

describe('InventoryItem', () => {
    it('should have correct properties', () => {
        expect(item.item).toHaveProperty('id');
        expect(item.item).toHaveProperty('name');
        expect(item.item).toHaveProperty('image');
        expect(item.item).toHaveProperty('tags');
        expect(item.item).toHaveProperty('attributes');
        expect(item.item).toHaveProperty('datasource');
        expect(item.item).toHaveProperty('installLink');
        expect(item.item).toHaveProperty('checkStatus');
        expect(item.item).toHaveProperty('canEquip');
        expect(item.item).toHaveProperty('equip');
        expect(item.item).toHaveProperty('unequip');
    });
});

// too many issues with platform mocking and stuff so just assume android and installed
describe('checkEligibility', () => {
    // TODO figure out how to mock Platform.OS. Jest defaults to ios
    // it('should return false if platform is not android', async () => {
    //     jest.mock('react-native', () => ({
    //         Platform: {
    //             OS: 'ios',
    //         },
    //     expect(await item.checkEligibility()).toBe(false);
    //     jest.mock('react-native', () => ({
    //         Platform: {
    //             OS: 'web',
    //         },
    //     expect(await item.checkEligibility()).toBe(false);
    // });
    // it('should return true if platform is  android', async () => {
    //         initialize: () => true;
    //         getSdkStatus: () => 1,
    //     expect(await item.checkEligibility()).toBe(true);
    // });
    // it('should return false if SDK is not available', async () => {
    //         getSdkStatus: () => 1,
    //     expect(await item.checkEligibility()).toBe(false);
    // });
    // it('should throw error if SDK fails to initialize', async () => {
    //         getSdkStatus: () => 3,
    //         initialize: () => false,
    //     expect(await item.checkEligibility()).rejects.toThrow('Unable to initialize Android Health');
    // });
});

describe('initPermissions', () => {
    it('should return false if checkEligibility returns false', async () => {
        item.checkEligibility = async () => false;
        // mockHealth.requestPermission = async (perms) => perms;
        expect(await item.initPermissions()).toBe(false);
    });

    it('should return true if permissions are granted', async () => {
        item.checkEligibility = async () => true;
        // mockHealth.requestPermission = async (perms) => perms;
        mockHealth.getGrantedPermissions = async () => item.permissions as Permission[];
        expect(await item.initPermissions()).toBe(true);
    });

    it('should return false if permissions are not granted', async () => {
        mockHealth.requestPermission = async () => [];
        mockHealth.getGrantedPermissions = async () => [];
        expect(await item.initPermissions()).toBe(false);
    });
});

describe('getPermissions', () => {
    it('should return false if checkEligibility returns false', async () => {
        item.checkEligibility = async () => false;
        // mockHealth.requestPermission = async (perms) => perms;
        mockHealth.getGrantedPermissions = async () => item.permissions as Permission[];
        expect(await item.getPermissions()).toBe(false);
    });

    it('should return false if no permissions are granted', async () => {
        // mockHealth.requestPermission = async (perms) => perms;
        mockHealth.getGrantedPermissions = async () => [];
        expect(await item.getPermissions()).toBe(false);
    });

    it('should return true if permissions are granted', async () => {
        // mockHealth.requestPermission = async (perms) => perms;
        mockHealth.getGrantedPermissions = async () => item.permissions as Permission[];
        expect(await item.getPermissions()).toBe(true);
    });
});

describe('equip', () => {
    it('should return false if checkEligibility returns false', async () => {
        item.checkEligibility = async () => false;
        console.log('equip eligible', await item.checkEligibility());
        expect(await item.equip()).toBe(false);
    });

    it('should return true if permissions are initialized', async () => {
        item.initPermissions = async () => true;
        expect(await item.equip()).toBe(true);
    });

    it('should return false if permissions are not initialized', async () => {
        (item.initPermissions = async () => false), expect(await item.equip()).toBe(false);
    });
});

describe('unequip', () => {
    it('should return true', async () => {
        expect(await item.unequip()).toBe(true);
    });
});

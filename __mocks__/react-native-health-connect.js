module.exports = {
    openHealthConnectSettings: jest.fn(),
    // assume installed for testing purposes. not worth getting into weeds
    initialize: () => true,
    getSdkStatus: () => 3,
    requestPermission: jest.fn(),
    readRecords: jest.fn(),
    revokeAllPermissions: jest.fn(),
    getGrantedPermissions: jest.fn(),
    SdkAvailabilityStatus: jest.fn(),
    SdkAvailabilityStatus: {
        SDK_UNAVAILABLE: 1,
        SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED: 2,
        SDK_AVAILABLE: 3,
    },
};

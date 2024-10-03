module.exports = {
    getNetworkStateAsync: jest.fn(),
    NetworkStateType: {
        NONE: 'NONE',
        UNKNOWN: 'UNKNOWN',
        CELLULAR: 'CELLULAR',
        WIFI: 'WIFI',
        BLUETOOTH: 'BLUETOOTH',
        ETHERNET: 'ETHERNET',
        WIMAX: 'WIMAX',
        VPN: 'VPN',
        OTHER: 'OTHER',
    },
};

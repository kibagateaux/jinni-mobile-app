module.exports = {
    // https://github.com/revtel/react-native-nfc-manager/__mocks__
    NfcManagerModule: { start: jest.fn() },
    NfcTech: { IsoDep: 'IsoDep' },
    Ndef: { uriRecord: jest.fn() },
    requestTechnology: jest.fn(),
    getTag: jest.fn(),
    setEventListener: jest.fn(),
    registerTagEventEx: jest.fn(),
    unregisterTagEventEx: jest.fn(),
    unregisterTagEvent: jest.fn(),
    registerTagEvent: jest.fn(),
    writeNdefMessage: jest.fn(),
    requestNdefWrite: jest.fn(),
};

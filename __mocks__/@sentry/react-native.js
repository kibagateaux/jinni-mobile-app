module.exports = {
    Native: {
        captureException: jest.fn(),
        captureMessage: jest.fn(),
    },
    Browser: {
        captureException: jest.fn(),
        captureMessage: jest.fn(),
    },
    init: jest.fn(),
};

const mockNetInfo = {
    addEventListener: jest.fn(() => jest.fn()),
    fetch: jest.fn(() => Promise.resolve({
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
    })),
};

export default mockNetInfo;
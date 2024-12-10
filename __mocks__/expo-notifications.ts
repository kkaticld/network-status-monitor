export const AndroidImportance = {
    LOW: 'LOW',
};

export const AndroidNotificationVisibility = {
    PUBLIC: 'PUBLIC',
};

export const setNotificationHandler = jest.fn();
export const setNotificationChannelAsync = jest.fn();
export const scheduleNotificationAsync = jest.fn();
export const requestPermissionsAsync = jest.fn(() => Promise.resolve({ status: 'granted' }));

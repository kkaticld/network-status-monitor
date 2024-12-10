import React from 'react';
import { render, screen } from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import NetworkMonitor from '../components/NetworkMonitor';

// 消除控制台错误输出
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterAll(() => {
    jest.restoreAllMocks();
});

describe('NetworkMonitor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // 设置默认的网络状态
        (NetInfo.fetch as jest.Mock).mockResolvedValue({
            type: 'wifi',
            isConnected: true,
            isInternetReachable: true,
        });
    });

    it('renders initial state correctly', () => {
        render(<NetworkMonitor />);

        expect(screen.getByText('网络状态')).toBeTruthy();
        expect(screen.getByText('网络类型')).toBeTruthy();
        expect(screen.getByText('连接状态')).toBeTruthy();
        expect(screen.getByText('网络可用')).toBeTruthy();
    });

    it('updates network status when connection changes', async () => {
        const mockNetworkState = {
            type: 'wifi',
            isConnected: true,
            isInternetReachable: true,
        };

        (NetInfo.fetch as jest.Mock).mockResolvedValueOnce(mockNetworkState);

        render(<NetworkMonitor />);

        expect(await screen.findByText('Wi-Fi')).toBeTruthy();
        expect(await screen.findByText('已连接')).toBeTruthy();
        expect(await screen.findByText('是')).toBeTruthy();
    });

    it('shows disconnected state correctly', async () => {
        const mockNetworkState = {
            type: 'none',
            isConnected: false,
            isInternetReachable: false,
        };

        (NetInfo.fetch as jest.Mock).mockResolvedValueOnce(mockNetworkState);

        render(<NetworkMonitor />);

        expect(await screen.findByText('无网络')).toBeTruthy();
        expect(await screen.findByText('未连接')).toBeTruthy();
        expect(await screen.findByText('否')).toBeTruthy();
    });

    it('handles notification permission denial', async () => {
        const consoleSpy = jest.spyOn(console, 'log');
        (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
            status: 'denied'
        });

        render(<NetworkMonitor />);

        await new Promise(resolve => setTimeout(resolve, 0));

        expect(consoleSpy).toHaveBeenCalledWith('未获得通知权限');
        consoleSpy.mockRestore();
    });
});

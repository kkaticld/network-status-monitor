import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface NetworkDetails {
  type: string;
  isConnected: boolean;
  isInternetReachable: boolean;
  wifiName?: string;
  wifiStrength?: string;
  ipAddress?: string;
  subnet?: string;
}

const NetworkMonitor: React.FC = () => {
  const [networkDetails, setNetworkDetails] = useState<NetworkDetails>({
    type: '检查中...',
    isConnected: false,
    isInternetReachable: false,
  });

  useEffect(() => {
    let subscription: NetInfoSubscription;

    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('通知权限未授予');
        return;
      }
    };

    const showNotification = async (title: string, body: string) => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
        },
        trigger: null,
      });
    };

    const handleNetworkChange = (state: NetInfoState) => {
      console.log('详细网络状态:', state);

      const details: NetworkDetails = {
        type: state.type,
        isConnected: state.isConnected || false,
        isInternetReachable: state.isInternetReachable || false,
      };

      if (state.type === 'wifi' && state.details) {
        const wifiDetails = state.details;
        details.wifiName = wifiDetails.ssid || '未知网络';
        details.ipAddress = wifiDetails.ipAddress || undefined;
        details.subnet = wifiDetails.subnet || undefined;
      }

      setNetworkDetails(details);

      // 发送状态变化通知
      if (state.type === 'wifi') {
        showNotification(
          'Wi-Fi状态变化',
          `已${state.isConnected ? '连接' : '断开'} ${details.wifiName || ''}`
        );
      }
    };

    const init = async () => {
      await setupNotifications();
      const currentState = await NetInfo.fetch();
      handleNetworkChange(currentState);
      subscription = NetInfo.addEventListener(handleNetworkChange);
    };

    init();

    return () => {
      if (subscription) {
        subscription();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>网络状态监控</Text>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>基本信息</Text>
        <Text style={styles.infoText}>
          网络类型: {networkDetails.type.toUpperCase()}
        </Text>
        <Text style={styles.infoText}>
          连接状态: {networkDetails.isConnected ? '已连接' : '未连接'}
        </Text>
        <Text style={styles.infoText}>
          网络可用: {networkDetails.isInternetReachable ? '是' : '否'}
        </Text>
      </View>

      {networkDetails.type === 'wifi' && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Wi-Fi 详情</Text>
          <Text style={styles.infoText}>
            网络名称: {networkDetails.wifiName}
          </Text>
          {networkDetails.ipAddress && (
            <Text style={styles.infoText}>
              IP地址: {networkDetails.ipAddress}
            </Text>
          )}
          {networkDetails.subnet && (
            <Text style={styles.infoText}>
              子网掩码: {networkDetails.subnet}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
});

export default NetworkMonitor;

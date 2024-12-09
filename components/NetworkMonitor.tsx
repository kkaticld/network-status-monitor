// NetworkMonitor.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

interface NetworkDetails {
  type: string;
  isConnected: boolean;
  isInternetReachable: boolean;
}

const getNetworkTypeText = (type: string): string => {
  switch (type) {
    case 'wifi': return 'Wi-Fi';
    case 'cellular': return '移动数据';
    case 'none': return '无网络';
    case 'unknown': return '未知';
    default: return type;
  }
};

const NetworkMonitor: React.FC = () => {
  const [networkDetails, setNetworkDetails] = useState<NetworkDetails>({
    type: '检查中...',
    isConnected: false,
    isInternetReachable: false,
  });

  useEffect(() => {
    let subscription: NetInfoSubscription;
    let lastNotificationBody: string | null = null;

    const setupNotificationChannel = async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('network-status', {
          name: '网络状态',
          importance: Notifications.AndroidImportance.LOW,
          enableVibrate: false,
          showBadge: false,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      }
    };

    const updateNotification = async (state: NetInfoState) => {
      const networkType = getNetworkTypeText(state.type);
      const notificationBody = state.isConnected
        ? `已连接到${networkType}`
        : '网络已断开';

      if (notificationBody === lastNotificationBody) {
        return;
      }

      lastNotificationBody = notificationBody;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '网络状态监控',
          body: notificationBody,
          sound: null,
          badge: null,
          ...(Platform.OS === 'android' && {
            sticky: true,
            ongoing: true,
            priority: 'min',
          }),
        },
        trigger: null,
      });
    };

    const handleNetworkChange = async (state: NetInfoState) => {
      const details: NetworkDetails = {
        type: state.type,
        isConnected: state.isConnected || false,
        isInternetReachable: state.isInternetReachable || false,
      };

      setNetworkDetails(details);
      await updateNotification(state);
    };

    const init = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('未获得通知权限');
          return;
        }

        await setupNotificationChannel();
        
        const currentState = await NetInfo.fetch();
        await handleNetworkChange(currentState);

        subscription = NetInfo.addEventListener(handleNetworkChange);
      } catch (error) {
        console.error('初始化失败:', error);
      }
    };

    init();

    return () => {
      if (subscription) {
        subscription();
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>网络状态</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>网络类型</Text>
          <Text style={styles.value}>{getNetworkTypeText(networkDetails.type)}</Text>
        </View>
        
        <View style={[styles.row, styles.borderTop]}>
          <Text style={styles.label}>连接状态</Text>
          <Text style={[
            styles.value,
            networkDetails.isConnected ? styles.connected : styles.disconnected
          ]}>
            {networkDetails.isConnected ? '已连接' : '未连接'}
          </Text>
        </View>

        <View style={[styles.row, styles.borderTop]}>
          <Text style={styles.label}>网络可用</Text>
          <Text style={[
            styles.value,
            networkDetails.isInternetReachable ? styles.connected : styles.disconnected
          ]}>
            {networkDetails.isInternetReachable ? '是' : '否'}
          </Text>
        </View>
      </View>

      <Text style={styles.footer}>
        网络状态监控已启动
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  label: {
    fontSize: 17,
    color: '#000',
  },
  value: {
    fontSize: 17,
    color: '#666',
  },
  connected: {
    color: '#34C759',
  },
  disconnected: {
    color: '#FF3B30',
  },
  footer: {
    padding: 16,
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
  },
});

export default NetworkMonitor;

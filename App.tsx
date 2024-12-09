import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import NetworkMonitor from './components/NetworkMonitor';

export default function App() {
  return (
    <View style={styles.container}>
      <NetworkMonitor />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
});

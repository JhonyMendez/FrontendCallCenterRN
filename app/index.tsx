// app/index.tsx
import LoginPage from '@/src/pages/Login/LoginPage';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <LoginPage />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});
// app/(admin)/dashboard.tsx
import { ROLES } from '@/app/constants/roles';
import { ProtectedRoute } from '@/app/routes/ProtectedRoute';

import DashboardPageAdmin from '@/src/pages/Dashboard/DashboardPageAdmin';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

export default function AdminDashboard() {
  return (
    <ProtectedRoute rolesPermitidos={[ROLES.ADMIN]}> 
      <View style={styles.container}>
        <DashboardPageAdmin />
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});

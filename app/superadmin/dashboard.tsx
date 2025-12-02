// app/(superadmin)/dashboard.tsx
import { ROLES } from '@/app/constants/roles';
import { ProtectedRoute } from '@/app/routes/ProtectedRoute';

import DashboardPageSuperAdmin from '@/src/pages/Dashboard/DashboardPageSuperAdmin';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

export default function SuperAdminDashboard() {
  return (
    <ProtectedRoute rolesPermitidos={[ROLES.SUPER_ADMIN]}>
      <View style={styles.container}>
        <DashboardPageSuperAdmin />
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

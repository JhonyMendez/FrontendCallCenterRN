// app/(funcionario)/dashboard.tsx
import { ROLES } from '@/app/constants/roles';
import { ProtectedRoute } from '@/app/routes/ProtectedRoute';

import DashboardFuncionarioPage from '@/src/pages/Dashboard/DashboardFuncionarioPage';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

export default function FuncionarioDashboard() {
  return (
    <ProtectedRoute rolesPermitidos={[ROLES.FUNCIONARIO]}>
      <View style={styles.container}>
        <DashboardFuncionarioPage />
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

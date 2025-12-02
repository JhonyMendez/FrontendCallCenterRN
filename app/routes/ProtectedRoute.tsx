import { RolId } from '@/app/constants/roles';
import { useAuth } from '@/src/hooks/useAuth';
import { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface ProtectedRouteProps {
  children: ReactNode;
  rolesPermitidos?: RolId[];
}

export const ProtectedRoute = ({
  children,
  rolesPermitidos = [],
}: ProtectedRouteProps): React.ReactElement => {
  const { loading, authenticated } = useAuth(rolesPermitidos);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Verificando autenticación...</Text>
      </View>
    );
  }

  if (!authenticated) {
    return <View />;
  }

  return <View style={{ flex: 1 }}>{children}</View>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#555',
  },
});

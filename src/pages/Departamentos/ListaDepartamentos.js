import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { departamentoService } from '../../api/services/departamentoService';
import DepartamentoCard from '../../components/departamentos/DepartamentoCard';
import { departamentosStyles as styles } from '../../styles/departamentosStyles';

function ListaDepartamentos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDepartamentos();
  }, []);

  const cargarDepartamentos = async () => {
    try {
      setError(null);
      const data = await departamentoService.getAll();
      
      if (data && Array.isArray(data)) {
        setDepartamentos(data);
      } else {
        setDepartamentos([]);
      }
    } catch (error) {
      setError(error?.message || 'Error al cargar departamentos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarDepartamentos();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando departamentos...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Error al cargar</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={cargarDepartamentos}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (departamentos.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyTitle}>Sin departamentos</Text>
          <Text style={styles.emptyMessage}>
            No hay departamentos disponibles en este momento
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{departamentos.length}</Text>
          <Text style={styles.statLabel}>Departamentos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {departamentos.filter(d => d.activo).length}
          </Text>
          <Text style={styles.statLabel}>Activos</Text>
        </View>
      </View>

      <FlatList
        data={departamentos}
        keyExtractor={(item) => item.id_departamento.toString()}
        renderItem={({ item }) => <DepartamentoCard departamento={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

export default ListaDepartamentos;
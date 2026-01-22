// src/components/Dashboard/DashboardFuncionarioCard.js
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TouchableOpacity, View } from 'react-native';
import { dashboardFuncionarioStyles } from '../../styles/dashboardFuncionarioStyles';

export function HeaderCard({ username, role }) {
  return (
    <View style={dashboardFuncionarioStyles.headerCard}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={dashboardFuncionarioStyles.headerGradient}
      >
        <View style={dashboardFuncionarioStyles.logoContainer}>
          <Ionicons name="chatbubbles" size={32} color="#fff" />
        </View>
        <View style={dashboardFuncionarioStyles.headerInfo}>
          <Text style={dashboardFuncionarioStyles.headerTitle}>CALLCENTER</Text>
          <Text style={dashboardFuncionarioStyles.headerSubtitle}>Secretaría</Text>
        </View>
        <View style={dashboardFuncionarioStyles.userInfo}>
          <Text style={dashboardFuncionarioStyles.userName}>{username}</Text>
          <Text style={dashboardFuncionarioStyles.userRole}>{role}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}
  
export function FilterBar({ 
  selectedCategory, 
  selectedState, 
  onCategoryPress, 
  onStatePress 
}) {
  return (
    <View style={dashboardFuncionarioStyles.filterBar}>
      <TouchableOpacity 
        style={dashboardFuncionarioStyles.filterButton}
        onPress={onCategoryPress}
      >
        <Text style={dashboardFuncionarioStyles.filterButtonText}>
          {selectedCategory || 'Todas las categorías'}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#636e72" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={dashboardFuncionarioStyles.filterButton}
        onPress={onStatePress}
      >
        <Text style={dashboardFuncionarioStyles.filterButtonText}>
          {selectedState || 'Todos los estados'}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#636e72" />
      </TouchableOpacity>

      <TouchableOpacity style={dashboardFuncionarioStyles.menuButton}>
        <Ionicons name="menu" size={24} color="#2d3436" />
      </TouchableOpacity>
    </View>
  );
}

export function ContentRow({ 
  titulo, 
  categoria, 
  estado, 
  fechaActualizacion,
  onEdit,
  onDelete 
}) {
  const getEstadoStyle = () => {
    switch(estado) {
      case 'Publicado':
        return dashboardFuncionarioStyles.estadoPublicado;
      case 'Activo':
        return dashboardFuncionarioStyles.estadoActivo;
      case 'Inactivo':
        return dashboardFuncionarioStyles.estadoInactivo;
      default:
        return dashboardFuncionarioStyles.estadoDefault;
    }
  };

  const getCategoriaColor = () => {
    switch(categoria) {
      case 'Información académica':
        return '#667eea';
      case 'Requisitos Titulación':
        return '#4facfe';
      case 'Preguntas estudiantes':
        return '#43e97b';
      case 'Funcionales':
        return '#f093fb';
      default:
        return '#636e72';
    }
  };

  return (
    <View style={dashboardFuncionarioStyles.contentRow}>
      <View style={dashboardFuncionarioStyles.contentCell}>
        <Text style={dashboardFuncionarioStyles.contentTitle}>{titulo}</Text>
      </View>

      <View style={dashboardFuncionarioStyles.contentCell}>
        <View style={[
          dashboardFuncionarioStyles.categoriaBadge,
          { borderColor: getCategoriaColor() }
        ]}>
          <Text style={[
            dashboardFuncionarioStyles.categoriaText,
            { color: getCategoriaColor() }
          ]}>
            {categoria}
          </Text>
        </View>
      </View>

      <View style={dashboardFuncionarioStyles.contentCell}>
        <View style={[dashboardFuncionarioStyles.estadoBadge, getEstadoStyle()]}>
          <Text style={dashboardFuncionarioStyles.estadoText}>{estado}</Text>
        </View>
      </View>

      <View style={dashboardFuncionarioStyles.contentCell}>
        <Text style={dashboardFuncionarioStyles.fechaText}>{fechaActualizacion}</Text>
      </View>

      <View style={dashboardFuncionarioStyles.contentActions}>
        <TouchableOpacity 
          style={dashboardFuncionarioStyles.actionButton}
          onPress={onEdit}
        >
          <Ionicons name="create-outline" size={20} color="#4facfe" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={dashboardFuncionarioStyles.actionButton}
          onPress={onDelete}
        >
          <Ionicons name="trash-outline" size={20} color="#ff4757" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function AddContentButton({ onPress }) {
  return (
    <TouchableOpacity 
      style={dashboardFuncionarioStyles.addButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={dashboardFuncionarioStyles.addButtonGradient}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={dashboardFuncionarioStyles.addButtonText}>Nuevo contenido</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
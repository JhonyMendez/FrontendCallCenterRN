// ==================================================================================
// src/components/SuperAdministrador/UsuarioCard.js
// Tarjeta de usuario para el map en GestionUsuarioPage
// ==================================================================================

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import SecurityValidator from '../../components/utils/SecurityValidator';


const UsuarioCard = ({ usuario, onEditar, onEliminar, index }) => {
  const [expanded, setExpanded] = useState(false);

  // ==================== FUNCIONES DE UTILIDAD ====================
  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo': return '#10b981';
      case 'inactivo': return '#6b7280';
      case 'bloqueado': return '#ef4444';
      case 'suspendido': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getRolIcon = (nombreRol) => {
    const rol = nombreRol?.toLowerCase();
    if (rol?.includes('super')) return 'shield-checkmark';
    if (rol?.includes('admin')) return 'shield';
    if (rol?.includes('funcionario')) return 'briefcase';
    return 'person';
  };

  const getNivelColor = (nivel) => {
    if (nivel === 1) return '#dc2626'; // Super Admin
    if (nivel === 2) return '#ea580c'; // Admin
    if (nivel === 3) return '#2563eb'; // Funcionario
    return '#6b7280';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      const fechaSegura = SecurityValidator.sanitizeText(String(fecha));
      return new Date(fechaSegura).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatearFechaCompleta = (fecha) => {
    if (!fecha) return 'Nunca';
    try {
      const fechaSegura = SecurityValidator.sanitizeText(String(fecha));
      return new Date(fechaSegura).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };
  // ==================== RENDER ====================
  return (
    <View style={styles.card}>
      {/* Header de la tarjeta */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {usuario.persona?.nombre?.charAt(0)}{usuario.persona?.apellido?.charAt(0)}
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.mainInfo}>
          <Text style={styles.nombreCompleto}>
          {SecurityValidator.sanitizeText(usuario.persona?.nombre || '')} {SecurityValidator.sanitizeText(usuario.persona?.apellido || '')}
        </Text>
        <Text style={styles.username}>
          @{SecurityValidator.sanitizeText(usuario.username || '')}
        </Text>
        <Text style={styles.email}>
          {SecurityValidator.sanitizeText(usuario.email || '')}
        </Text>
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(usuario.estado) }]}>
            <Text style={styles.estadoText}>
              {SecurityValidator.sanitizeText(usuario.estado || 'N/A')}
            </Text>
          </View>
        </View>
      </View>

      {/* Roles del usuario */}
      <View style={styles.rolesContainer}>
        {usuario.roles && usuario.roles.length > 0 ? (
          usuario.roles.map((rol) => (
            <View
              key={rol.id_rol}
              style={[styles.rolChip, { borderColor: getNivelColor(rol.nivel_jerarquia) }]}
            >
              <Ionicons
                name={getRolIcon(rol.nombre_rol)}
                size={14}
                color={getNivelColor(rol.nivel_jerarquia)}
              />
              <Text style={[styles.rolText, { color: getNivelColor(rol.nivel_jerarquia) }]}>
                {SecurityValidator.sanitizeText(rol.nombre_rol || 'Sin nombre')}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.sinRoles}>Sin roles asignados</Text>
        )}
      </View>

      {/* Información adicional colapsable */}
      {expanded && (
        <View style={styles.expandedContent}>
          {/* Información Personal */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>📋 Información Personal</Text>
            <InfoRow icon="card" label="Cédula" value={usuario.persona?.cedula} />
            <InfoRow icon="call" label="Teléfono" value={usuario.persona?.celular || usuario.persona?.telefono} />
            <InfoRow icon="mail" label="Email Personal" value={usuario.persona?.email_personal} />
            <InfoRow icon="briefcase" label="Cargo" value={usuario.persona?.cargo} />
            <InfoRow icon="location" label="Ciudad" value={usuario.persona?.ciudad} />
            <InfoRow icon="person" label="Tipo" value={usuario.persona?.tipo_persona} />
          </View>

          {/* Departamento */}
          {usuario.departamento && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>🏢 Departamento</Text>
              <InfoRow 
                icon="business" 
                label="Nombre" 
                value={SecurityValidator.sanitizeText(usuario.departamento.nombre || '')} 
              />
              <InfoRow 
                icon="code-slash" 
                label="Código" 
                value={SecurityValidator.sanitizeText(usuario.departamento.codigo || '')} 
              />
              <InfoRow 
                icon="school" 
                label="Facultad" 
                value={SecurityValidator.sanitizeText(usuario.departamento.facultad || '')} 
              />
              <InfoRow 
                icon="location" 
                label="Ubicación" 
                value={SecurityValidator.sanitizeText(usuario.departamento.ubicacion || '')} 
              />
            </View>
          )}

          {/* Detalles de Roles */}
          {usuario.roles.map((rol) => (
            <View key={rol.id_rol} style={styles.rolDetail}>
              <View style={styles.rolDetailHeader}>
                <Text style={styles.rolDetailName}>
                  {SecurityValidator.sanitizeText(rol.nombre_rol || '')}
                </Text>
                <View style={[styles.nivelBadge, { backgroundColor: getNivelColor(rol.nivel_jerarquia) }]}>
                  <Text style={styles.nivelText}>Nivel {rol.nivel_jerarquia}</Text>
                </View>
              </View>
              <Text style={styles.rolDetailDesc}>
                {SecurityValidator.sanitizeText(rol.descripcion || '')}
              </Text>
              <Text style={styles.rolDetailFecha}>
                📅 Asignado: {formatearFecha(rol.fecha_asignacion)}
              </Text>
              {rol.fecha_expiracion && (
                <Text style={styles.rolDetailExpira}>
                  ⏰ Expira: {formatearFecha(rol.fecha_expiracion)}
                </Text>
              )}
            </View>
          ))}

          {/* Información de Sesión */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>📊 Información de Sesión</Text>
          <InfoRow 
            icon="time" 
            label="Último acceso" 
            value={formatearFechaCompleta(usuario.ultimo_acceso)} 
          />
          <InfoRow 
            icon="alert-circle" 
            label="Intentos fallidos" 
            value={`${parseInt(usuario.intentos_fallidos) || 0}`} 
          />
          <InfoRow 
            icon="globe" 
            label="Última IP" 
            value={SecurityValidator.sanitizeText(usuario.ultimo_ip || 'N/A')} 
          />
          <InfoRow 
            icon="calendar" 
            label="Creado" 
            value={formatearFecha(usuario.fecha_creacion)} 
          />
        </View>
        </View>
      )}

      {/* Botones de acción */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.btnExpand}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#667eea"
          />
          <Text style={styles.btnExpandText}>
            {expanded ? 'Menos' : 'Más'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnEdit}
          onPress={onEditar}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={20} color="#667eea" />
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnDelete}
          onPress={onEliminar}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
          <Text style={[styles.btnText, { color: '#ef4444' }]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ==================== COMPONENTE AUXILIAR ====================
const InfoRow = ({ icon, label, value }) => {
  if (!value || value === 'N/A') return null;
  
  // Sanitizar tanto label como value
  const labelSeguro = SecurityValidator.sanitizeText(String(label));
  const valueSeguro = SecurityValidator.sanitizeText(String(value));
  
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoRowLabel}>
        <Ionicons name={icon} size={16} color="#6b7280" />
        <Text style={styles.infoRowLabelText}>{labelSeguro}:</Text>
      </View>
      <Text style={styles.infoRowValue} numberOfLines={2}>
        {valueSeguro}
      </Text>
    </View>
  );
};

// ==================== ESTILOS ====================
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  mainInfo: {
    flex: 1,
  },
  nombreCompleto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#667eea',
    marginBottom: 2,
  },
  email: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  estadoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  rolChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: '#f9fafb',
    gap: 6,
  },
  rolText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sinRoles: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
    marginBottom: 12,
  },
  infoSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  infoRowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  infoRowLabelText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoRowValue: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  rolDetail: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#667eea',
  },
  rolDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rolDetailName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  nivelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  nivelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  rolDetailDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  rolDetailFecha: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 2,
  },
  rolDetailExpira: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  btnExpand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ede9fe',
    gap: 4,
  },
  btnExpandText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667eea',
  },
  btnEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ede9fe',
    gap: 4,
  },
  btnDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    gap: 4,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667eea',
  },
});

export default UsuarioCard;
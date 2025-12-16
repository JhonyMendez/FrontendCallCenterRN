import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { styles } from '../../styles/GestionAsignacionUsStyles';

// ============================================
// DEPARTAMENTO CARD
// ============================================
export const DepartamentoCard = ({ 
  departamento, 
  onPress, 
  isSelected = false,
  showRadio = false 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.deptCard,
        isSelected && styles.deptCardSelected
      ]}
      onPress={onPress}
    >
      <View style={styles.deptCardHeader}>
        {showRadio ? (
          <Ionicons 
            name={isSelected ? "radio-button-on" : "radio-button-off"} 
            size={24} 
            color={isSelected ? "#3b82f6" : "#94a3b8"}
          />
        ) : (
          <View style={styles.deptIconContainer}>
            <Ionicons name="business" size={24} color="#3b82f6" />
          </View>
        )}
        <Text style={styles.deptCardCode}>{departamento.codigo}</Text>
      </View>
      
      <Text style={styles.deptCardName}>{departamento.nombre}</Text>
      
      {departamento.facultad && (
        <View style={styles.deptFacultadBadge}>
          <Ionicons name="school" size={12} color="#8b5cf6" />
          <Text style={styles.deptFacultadText}>{departamento.facultad}</Text>
        </View>
      )}
      
      {!showRadio && (
        <View style={styles.deptCardFooter}>
          <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
        </View>
      )}
    </TouchableOpacity>
  );
};

// ============================================
// USUARIO CARD
// ============================================
export const UsuarioCard = ({ 
  usuario, 
  isSelected = false, 
  onPress,
  showCheckbox = false,
  showChevron = false,
  showNoDeptBadge = false,
  checkboxColor = "#3b82f6",
  selectedStyle = "blue",
  onPressEditPermisos = null,
  showEditPermisosButton = false
}) => {
  const selectedStyleClass = selectedStyle === "green" 
    ? styles.usuarioCardSelectedGreen 
    : styles.usuarioCardSelected;

  return (
    <TouchableOpacity
      style={[
        styles.usuarioCard,
        isSelected && selectedStyleClass
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {showCheckbox && (
        <Ionicons 
          name={isSelected ? "checkbox" : "square-outline"} 
          size={24} 
          color={isSelected ? checkboxColor : "#94a3b8"}
        />
      )}
      
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {usuario.persona?.nombre?.charAt(0)}{usuario.persona?.apellido?.charAt(0)}
        </Text>
      </View>
      
      <View style={styles.usuarioInfo}>
        <Text style={styles.usuarioNombre}>
          {usuario.persona?.nombre} {usuario.persona?.apellido}
        </Text>
        <View style={styles.usuarioMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="at" size={12} color="#64748b" />
            <Text style={styles.metaText}>{usuario.username}</Text>
          </View>
          <Text style={styles.metaDot}>•</Text>
          <View style={styles.metaItem}>
            <Ionicons name="mail" size={12} color="#64748b" />
            <Text style={styles.metaText}>{usuario.email}</Text>
          </View>
        </View>
        {usuario.persona?.cargo && (
          <Text style={styles.usuarioCargo}>{usuario.persona.cargo}</Text>
        )}
      </View>
      
      {showNoDeptBadge && (
        <View style={styles.noDeptBadge}>
          <Text style={styles.noDeptBadgeText}>Sin Depto</Text>
        </View>
      )}

      {showChevron && (
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color="#cbd5e1" 
        />
      )}
    </TouchableOpacity>
  );
};
// ============================================
// INFO CARD
// ============================================
export const InfoCard = ({ icon, color, text }) => {
  return (
    <View style={styles.infoCard}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.infoCardText}>{text}</Text>
    </View>
  );
};

// ============================================
// RESUMEN CARD
// ============================================
export const ResumenCard = ({ 
  selectedCount,
  departamentoOrigen,
  departamentoDestino,
  loading,
  onConfirm,
  confirmButtonText = "Confirmar cambio",
  confirmButtonColor = "#3b82f6",
  isAsignacion = false
}) => {
  return (
    <View style={styles.resumenCard}>
      <View style={styles.resumenHeader}>
        <Ionicons 
          name="information-circle" 
          size={24} 
          color={isAsignacion ? "#10b981" : "#3b82f6"} 
        />
        <Text style={styles.resumenTitle}>
          {isAsignacion ? "Resumen de Asignación" : "Resumen del Cambio"}
        </Text>
      </View>
      
      <View style={styles.resumenContent}>
        <View style={styles.resumenRow}>
          <Text style={styles.resumenLabel}>Usuarios seleccionados:</Text>
          <Text style={styles.resumenValue}>{selectedCount}</Text>
        </View>
        
        <View style={styles.resumenDivider} />
        
        {!isAsignacion && departamentoOrigen && (
          <>
            <View style={styles.resumenRow}>
              <View style={styles.resumenDept}>
                <Ionicons name="business" size={16} color="#64748b" />
                <View>
                  <Text style={styles.resumenDeptLabel}>Desde</Text>
                  <Text style={styles.resumenDeptValue}>{departamentoOrigen.nombre}</Text>
                  <Text style={styles.resumenDeptCode}>{departamentoOrigen.codigo}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.resumenArrow}>
              <Ionicons name="arrow-down" size={24} color="#3b82f6" />
            </View>
          </>
        )}
        
        <View style={styles.resumenRow}>
          <View style={styles.resumenDept}>
            <Ionicons 
              name="business" 
              size={16} 
              color={isAsignacion ? "#10b981" : "#3b82f6"} 
            />
            <View>
              <Text style={styles.resumenDeptLabel}>
                {isAsignacion ? "Asignar a" : "Hacia"}
              </Text>
              <Text style={styles.resumenDeptValue}>{departamentoDestino.nombre}</Text>
              <Text style={styles.resumenDeptCode}>{departamentoDestino.codigo}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.resumenDivider} />
      </View>

      <TouchableOpacity
        style={[
          styles.confirmarButton,
          { backgroundColor: confirmButtonColor },
          loading && { opacity: 0.5 }
        ]}
        onPress={onConfirm}
        disabled={loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
            <Text style={styles.confirmarButtonText}>
              {confirmButtonText}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

// ============================================
// USUARIO DETALLE MODAL
// ============================================
export const UsuarioDetalleModal = ({ usuario, onClose, onEditarPermisos }) => {  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <ScrollView style={styles.modalScroll}>
          
{/* Header del Modal */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>
                  {usuario.persona?.nombre?.charAt(0)}
                  {usuario.persona?.apellido?.charAt(0)}
                </Text>
              </View>
              <View>
                <Text style={styles.modalTitle}>
                  {usuario.persona?.nombre} {usuario.persona?.apellido}
                </Text>
                <Text style={styles.modalSubtitle}>
                  @{usuario.username}
                </Text>
              </View>
            </View>
            
            {/* Botones de Acción */}
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              {/* Botón Editar Permisos */}
              {onEditarPermisos && (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#f59e0b',
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    gap: 6
                  }}
                  onPress={() => onEditarPermisos(usuario)}
                >
                  <Ionicons name="shield-checkmark" size={18} color="white" />
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                    Editar Permisos
                  </Text>
                </TouchableOpacity>
              )}
              
              {/* Botón Cerrar */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Información Personal */}
          <View style={styles.modalSection}>
            <View style={styles.modalSectionHeader}>
              <Ionicons name="person" size={20} color="#3b82f6" />
              <Text style={styles.modalSectionTitle}>Información Personal</Text>
            </View>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Cédula</Text>
                <Text style={styles.infoValue}>
                  {usuario.persona?.cedula || 'N/A'}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{usuario.email}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>
                  {usuario.persona?.telefono || 'N/A'}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Cargo</Text>
                <Text style={styles.infoValue}>
                  {usuario.persona?.cargo || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Información de Usuario */}
          <View style={styles.modalSection}>
            <View style={styles.modalSectionHeader}>
              <Ionicons name="briefcase" size={20} color="#8b5cf6" />
              <Text style={styles.modalSectionTitle}>Información de Usuario</Text>
            </View>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Departamento</Text>
                <Text style={styles.infoValue}>
                  {usuario.departamento?.nombre || 'Sin departamento'}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Estado</Text>
                <View style={[
                  styles.estadoBadge,
                  usuario.estado === 'activo' && styles.estadoActivo,
                  usuario.estado === 'inactivo' && styles.estadoInactivo
                ]}>
                  <Text style={styles.estadoBadgeText}>
                    {usuario.estado?.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Roles</Text>
                <View style={styles.rolesContainer}>
                  {usuario.roles && usuario.roles.length > 0 ? (
                    usuario.roles.map((rol, index) => (
                      <View key={index} style={styles.rolBadge}>
                        <Ionicons name="shield-checkmark" size={12} color="#10b981" />
                        <Text style={styles.rolBadgeText}>{rol.nombre}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.infoValue}>Sin roles asignados</Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Permisos */}
          <View style={styles.modalSection}>
            <View style={styles.modalSectionHeader}>
              <Ionicons name="lock-closed" size={20} color="#ef4444" />
              <Text style={styles.modalSectionTitle}>Permisos del Usuario</Text>
            </View>
            
            <View style={styles.permisosGrid}>
              <PermisoItem 
                icon="eye" 
                color="#3b82f6" 
                label="Ver Contenido" 
                value={true} 
              />
              <PermisoItem 
                icon="add-circle" 
                color="#10b981" 
                label="Crear Contenido" 
                value={false} 
              />
              <PermisoItem 
                icon="create" 
                color="#f59e0b" 
                label="Editar Contenido" 
                value={true} 
              />
              <PermisoItem 
                icon="trash" 
                color="#ef4444" 
                label="Eliminar Contenido" 
                value={false} 
              />
              <PermisoItem 
                icon="paper-plane" 
                color="#8b5cf6" 
                label="Publicar Contenido" 
                value={true} 
              />
              <PermisoItem 
                icon="stats-chart" 
                color="#06b6d4" 
                label="Ver Métricas" 
                value={false} 
              />
              <PermisoItem 
                icon="download" 
                color="#14b8a6" 
                label="Exportar Datos" 
                value={true} 
              />
              <PermisoItem 
                icon="settings" 
                color="#6366f1" 
                label="Configurar Agente" 
                value={false} 
              />
              <PermisoItem 
                icon="key" 
                color="#dc2626" 
                label="Gestionar Permisos" 
                value={false} 
              />
              <PermisoItem 
                icon="list" 
                color="#f59e0b" 
                label="Gestionar Categorías" 
                value={true} 
              />
              <PermisoItem 
                icon="grid" 
                color="#8b5cf6" 
                label="Gestionar Widgets" 
                value={false} 
              />
            </View>

            {/* Notas */}
            <View style={styles.notasContainer}>
              <View style={styles.notasHeader}>
                <Ionicons name="document-text" size={18} color="#64748b" />
                <Text style={styles.notasLabel}>Notas sobre permisos</Text>
              </View>
              <View style={styles.notasBox}>
                <Text style={styles.notasText}>
                  Este usuario tiene permisos básicos de visualización y edición.
                  No puede eliminar contenido ni gestionar configuraciones avanzadas.
                </Text>
              </View>
            </View>
          </View>

        </ScrollView>
      </View>
    </View>
  );
};

// ============================================
// PERMISO ITEM (Componente auxiliar)
// ============================================
const PermisoItem = ({ icon, color, label, value }) => {
  return (
    <View style={styles.permisoItem}>
      <View style={styles.permisoHeader}>
        <Ionicons name={icon} size={18} color={color} />
        <Text style={styles.permisoLabel}>{label}</Text>
      </View>
      <View style={[
        styles.permisoToggle, 
        value ? styles.permisoTrue : styles.permisoFalse
      ]}>
        <Ionicons 
          name={value ? "checkmark-circle" : "close-circle"} 
          size={16} 
          color={value ? "#10b981" : "#ef4444"} 
        />
        <Text style={value ? styles.permisoValueTrue : styles.permisoValueFalse}>
          {value ? "TRUE" : "FALSE"}
        </Text>
      </View>
    </View>
  );
};
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { styles } from '../../styles/GestionAsignacionUsStyles';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
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
  showEditPermisosButton = false,
  showRevokeButton = false,
  onPressRevoke = null
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

      {/* Botones de Acción */}
      {(showEditPermisosButton || showRevokeButton) && (
        <View style={{ flexDirection: 'row', gap: 8, marginLeft: 8 }}>
          {showEditPermisosButton && onPressEditPermisos && (
            <TouchableOpacity
              style={{
                backgroundColor: '#667eea',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
              onPress={(e) => {
                e.stopPropagation();
                onPressEditPermisos(usuario);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={14} color="#ffffff" />
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
                Editar
              </Text>
            </TouchableOpacity>
          )}

          {showRevokeButton && onPressRevoke && (
            <TouchableOpacity
              style={{
                backgroundColor: '#ef4444',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
              onPress={(e) => {
                e.stopPropagation();
                onPressRevoke(usuario);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle-outline" size={14} color="#ffffff" />
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
                Revocar
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
export const UsuarioDetalleModal = ({ usuario, onClose, onEditarPermisos, onRevocarAsignacion }) => {
  const [permisos, setPermisos] = React.useState(null);
  const [loadingPermisos, setLoadingPermisos] = React.useState(true);

  React.useEffect(() => {
    cargarPermisosReales();
  }, [usuario]);

  const cargarPermisosReales = async () => {
    try {
      setLoadingPermisos(true);

      // Importar el servicio (añade esto al inicio del archivo si no está)
      const { usuarioAgenteService } = require('../../api/services/usuarioAgenteService');
      const { agenteService } = require('../../api/services/agenteService');

      // Obtener agentes del departamento del usuario
      const idDepartamento = usuario.departamento?.id_departamento || usuario.id_departamento;
      const idUsuario = usuario.id_usuario;

      console.log(`📋 Cargando permisos para usuario ${idUsuario}, departamento ${idDepartamento}`);

      if (!idDepartamento) {
        console.warn('⚠️ No hay id_departamento disponible');
        setPermisos(null);
        setLoadingPermisos(false);
        return;
      }

      const agentesResponse = await agenteService.getAll({ id_departamento: idDepartamento });

      let agentes = [];
      if (Array.isArray(agentesResponse)) {
        agentes = agentesResponse;
      } else if (agentesResponse?.agentes) {
        agentes = agentesResponse.agentes;
      } else if (agentesResponse?.data) {
        agentes = agentesResponse.data;
      }

      const agentesFiltrados = agentes.filter(a =>
        a.id_departamento === idDepartamento ||
        a.id_departamento === Number(idDepartamento)
      );

      if (agentesFiltrados.length === 0) {
        console.warn('⚠️ No hay agentes para este departamento');
        setPermisos(null);
        setLoadingPermisos(false);
        return;
      }

      // Tomar el primer agente para obtener permisos
      const agente = agentesFiltrados[0];
      console.log(`🔍 Intentando obtener permisos para usuario ${idUsuario} - agente ${agente.id_agente}`);

      const permisosResponse = await usuarioAgenteService.obtenerPorUsuarioYAgente(
        idUsuario,
        agente.id_agente
      );

      if (permisosResponse) {
        console.log('✅ Permisos obtenidos exitosamente');
        setPermisos({
          puede_ver_contenido: permisosResponse.puede_ver_contenido || false,
          puede_crear_contenido: permisosResponse.puede_crear_contenido || false,
          puede_editar_contenido: permisosResponse.puede_editar_contenido || false,
          puede_eliminar_contenido: permisosResponse.puede_eliminar_contenido || false,
          puede_publicar_contenido: permisosResponse.puede_publicar_contenido || false,
          puede_ver_metricas: permisosResponse.puede_ver_metricas || false,
          puede_exportar_datos: permisosResponse.puede_exportar_datos || false,
          puede_configurar_agente: permisosResponse.puede_configurar_agente || false,
          puede_gestionar_permisos: permisosResponse.puede_gestionar_permisos || false,
          puede_gestionar_categorias: permisosResponse.puede_gestionar_categorias || false,
          puede_gestionar_widgets: permisosResponse.puede_gestionar_widgets || false,
        });
      } else {
        console.log('ℹ️ No hay permisos asignados');
        setPermisos(null);
      }

      setLoadingPermisos(false);
    } catch (error) {
      // Verificar si es un error 404 (asignación no existe)
      if (error?.response?.status === 404) {
        console.log('ℹ️ No hay asignación usuario-agente:', error?.response?.data?.detail);
        setPermisos(null);
      } else {
        console.error('❌ Error cargando permisos reales:', error);
        setPermisos(null);
      }
      setLoadingPermisos(false);
    }
  };

  return (
    <View style={[
      styles.modalOverlay,
      !isWeb && {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }
    ]}>
      <View style={[
        styles.modalContent,
        !isWeb && {
          width: width * 0.95,
          maxWidth: width * 0.95,
          height: height * 0.90,
          maxHeight: height * 0.90,
          margin: 10,
        }
      ]}>
        <ScrollView
          style={[
            styles.modalScroll,
            !isWeb && { flex: 1 }
          ]}
          contentContainerStyle={!isWeb ? {
            paddingBottom: 30,
            paddingHorizontal: 0,
          } : {}}
          showsVerticalScrollIndicator={true}
        >
          {/* Header del Modal */}
          <View style={[
            styles.modalHeader,
            !isWeb && {
              flexDirection: 'column',
              alignItems: 'flex-start',
              paddingBottom: 8,
            }
          ]}>
            <View style={[
              styles.modalHeaderLeft,
              !isWeb && {
                width: '100%',
                marginBottom: 12,
                paddingRight: 40,
              }
            ]}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>
                  {usuario.persona?.nombre?.charAt(0)}
                  {usuario.persona?.apellido?.charAt(0)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[
                  styles.modalTitle,
                  !isWeb && { fontSize: 17, lineHeight: 22 }
                ]}>
                  {usuario.persona?.nombre} {usuario.persona?.apellido}
                </Text>
                <Text style={[
                  styles.modalSubtitle,
                  !isWeb && { fontSize: 13, marginTop: 2 }
                ]}>
                  @{usuario.username}
                </Text>
              </View>
            </View>

            {/* Botón Cerrar SOLO para móvil */}
            {!isWeb && (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  padding: 8,
                  zIndex: 10,
                }}
                onPress={onClose}
              >
                <Ionicons name="close" size={28} color="#64748b" />
              </TouchableOpacity>
            )}

            {/* Botones de Acción */}
            <View style={[
              { flexDirection: 'row', gap: 12, alignItems: 'center' },
              !isWeb && {
                flexDirection: 'column',
                alignItems: 'stretch',
                width: '100%',
                gap: 10,
              }
            ]}>
              {/* Botón Editar Permisos */}
              {onEditarPermisos && (
                <TouchableOpacity
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#667eea',
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      gap: 6,
                    },
                    !isWeb && {
                      justifyContent: 'center',
                      paddingVertical: 12,
                      width: '100%',
                    }
                  ]}
                  onPress={() => onEditarPermisos(usuario)}
                >
                  <Ionicons name="shield-checkmark" size={18} color="white" />
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                    Editar Permisos
                  </Text>
                </TouchableOpacity>
              )}

              {/* Botón Revocar Asignación */}
              {onRevocarAsignacion && usuario.departamento && (
                <TouchableOpacity
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#ef4444',
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      gap: 6,
                    },
                    !isWeb && {
                      justifyContent: 'center',
                      paddingVertical: 12,
                      width: '100%',
                    }
                  ]}
                  onPress={() => {
                    onClose();
                    onRevocarAsignacion(usuario);
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="white" />
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                    Revocar Asignación
                  </Text>
                </TouchableOpacity>
              )}

              {/* Botón Cerrar - Solo en WEB */}
              {isWeb && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Información Personal */}
          <View style={[
            styles.modalSection,
            !isWeb && { paddingHorizontal: 12, marginBottom: 16 }
          ]}>
            <View style={styles.modalSectionHeader}>
              <Ionicons name="person" size={20} color="#3b82f6" />
              <Text style={[
                styles.modalSectionTitle,
                !isWeb && { fontSize: 15 }
              ]}>Información Personal</Text>
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
            </View>
          </View>

          {/* Permisos */}
          <View style={[
            styles.modalSection,
            !isWeb && { paddingHorizontal: 12, marginBottom: 16 }
          ]}>
            <View style={styles.modalSectionHeader}>
              <Ionicons name="lock-closed" size={20} color="#ef4444" />
              <Text style={[
                styles.modalSectionTitle,
                !isWeb && { fontSize: 15 }
              ]}>Permisos del Usuario</Text>
            </View>

            {loadingPermisos ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={{ marginTop: 10, color: '#64748b' }}>Cargando permisos...</Text>
              </View>
            ) : permisos ? (
              <View style={styles.permisosGrid}>
                <PermisoItem
                  icon="eye"
                  color="#3b82f6"
                  label="Ver Contenido"
                  value={permisos.puede_ver_contenido}
                />
                <PermisoItem
                  icon="add-circle"
                  color="#10b981"
                  label="Crear Contenido"
                  value={permisos.puede_crear_contenido}
                />
                <PermisoItem
                  icon="create"
                  color="#f59e0b"
                  label="Editar Contenido"
                  value={permisos.puede_editar_contenido}
                />
                <PermisoItem
                  icon="trash"
                  color="#ef4444"
                  label="Eliminar Contenido"
                  value={permisos.puede_eliminar_contenido}
                />
                <PermisoItem
                  icon="stats-chart"
                  color="#06b6d4"
                  label="Ver Métricas"
                  value={permisos.puede_ver_metricas}
                />
                <PermisoItem
                  icon="download"
                  color="#14b8a6"
                  label="Exportar Datos"
                  value={permisos.puede_exportar_datos}
                />
                <PermisoItem
                  icon="settings"
                  color="#6366f1"
                  label="Configurar Agente"
                  value={permisos.puede_configurar_agente}
                />
                <PermisoItem
                  icon="list"
                  color="#f59e0b"
                  label="Gestionar Categorías"
                  value={permisos.puede_gestionar_categorias}
                />
              </View>
            ) : (
              <View style={{
                padding: 16,
                backgroundColor: '#fef3c7',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#fbbf24'
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="information-circle" size={20} color="#f59e0b" />
                  <Text style={{ color: '#92400e', fontSize: 13 }}>
                    No hay permisos configurados para este usuario
                  </Text>
                </View>
              </View>
            )}

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
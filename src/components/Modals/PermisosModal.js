import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const PermisosModal = ({ isOpen, onClose, onConfirm, selectedCount, departamentoDestino, permisosIniciales = null, modoEdicion = false, usuarioEditando = null }) => {
  const [permisos, setPermisos] = useState(permisosIniciales || {
    puede_ver_contenido: true,
    puede_crear_contenido: true,
    puede_editar_contenido: true,
    puede_eliminar_contenido: false,
    puede_publicar_contenido: false,
    puede_ver_metricas: true,
    puede_exportar_datos: false,
    puede_configurar_agente: false,
    puede_gestionar_permisos: false,
    puede_gestionar_categorias: false,
    puede_gestionar_widgets: false,
  });

  useEffect(() => {
    if (permisosIniciales) {
      setPermisos(permisosIniciales);
    }
  }, [permisosIniciales]);

  const togglePermiso = (key) => {
    setPermisos(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleConfirmar = () => {
    const hayPermisoActivo = Object.values(permisos).some(valor => valor === true);

    if (!hayPermisoActivo) {
      Alert.alert(
        '⚠️ Validación',
        'Debes activar al menos un permiso para continuar.',
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }

    onConfirm(permisos);
  };

  const permisosConfig = [
    {
      categoria: 'Contenido',
      icon: 'document-text',
      color: '#3b82f6',
      permisos: [
        {
          key: 'puede_ver_contenido',
          label: 'Ver contenido',
          icon: 'eye',
          description: 'Permite visualizar el contenido del agente'
        },
        {
          key: 'puede_crear_contenido',
          label: 'Crear contenido',
          icon: 'add-circle',
          description: 'Permite crear nuevo contenido'
        },
        {
          key: 'puede_editar_contenido',
          label: 'Editar contenido',
          icon: 'create',
          description: 'Permite modificar contenido existente'
        },
        {
          key: 'puede_eliminar_contenido',
          label: 'Eliminar contenido',
          icon: 'trash',
          description: 'Permite eliminar contenido',
          critical: true
        },
      ]
    },
    {
      categoria: 'Métricas y Datos',
      icon: 'bar-chart',
      color: '#10b981',
      permisos: [
        {
          key: 'puede_ver_metricas',
          label: 'Ver métricas',
          icon: 'stats-chart',
          description: 'Permite ver estadísticas y métricas'
        },
        {
          key: 'puede_exportar_datos',
          label: 'Exportar datos',
          icon: 'download',
          description: 'Permite exportar información y reportes'
        },
      ]
    },
    {
      categoria: 'Configuración',
      icon: 'settings',
      color: '#f59e0b',
      permisos: [
        {
          key: 'puede_configurar_agente',
          label: 'Configurar agente',
          icon: 'construct',
          description: 'Permite modificar configuración del agente',
          critical: true
        },
        {
          key: 'puede_gestionar_categorias',
          label: 'Gestionar categorías',
          icon: 'grid',
          description: 'Permite crear y modificar categorías'
        },
      ]
    }
  ];

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: isWeb ? 20 : 10
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 16,
          width: isWeb ? '100%' : width * 0.95,
          maxWidth: isWeb ? 600 : width * 0.95,
          height: isWeb ? 'auto' : height * 0.85,
          maxHeight: isWeb ? '90%' : height * 0.85,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <View style={{
            padding: isWeb ? 20 : 16,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
            backgroundColor: '#f9fafb'
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Ionicons name="shield-checkmark" size={24} color="#3b82f6" />
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>
                    {modoEdicion ? 'Editar Permisos' : 'Configurar Permisos'}
                  </Text>
                </View>
                <Text style={{ marginTop: 8, fontSize: 13, color: '#6b7280' }}>
                  {modoEdicion ? (
                    <>
                      Editando permisos de{'\n'}
                      <Text style={{ fontWeight: 'bold' }}>
                        {usuarioEditando?.persona?.nombre} {usuarioEditando?.persona?.apellido}
                      </Text>
                    </>
                  ) : (
                    <>
                      Asignando {selectedCount} usuario(s) a{'\n'}
                      <Text style={{ fontWeight: 'bold' }}>{departamentoDestino?.nombre}</Text>
                    </>
                  )}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
          {/* Info Banner */}
          <View style={{
            margin: 16,
            padding: 12,
            backgroundColor: '#eff6ff',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#bfdbfe',
            flexDirection: 'row',
            gap: 10
          }}>
            <Ionicons name="information-circle" size={18} color="#3b82f6" style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: '#1e40af', fontWeight: '600' }}>
                Configura los permisos sobre agentes del departamento
              </Text>
              <Text style={{ marginTop: 4, fontSize: 12, color: '#3b82f6' }}>
                Los permisos críticos deben otorgarse con precaución
              </Text>
            </View>
          </View>

          {/* Banner de advertencia si no hay permisos */}
          {!Object.values(permisos).some(valor => valor === true) && (
            <View style={{
              marginHorizontal: 16,
              marginBottom: 16,
              padding: 12,
              backgroundColor: '#fef2f2',
              borderRadius: 12,
              borderWidth: 2,
              borderColor: '#dc2626',
              flexDirection: 'row',
              gap: 10,
              alignItems: 'center'
            }}>
              <Ionicons name="warning" size={20} color="#dc2626" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: '#991b1b', fontWeight: '700' }}>
                  ⚠️ Debes seleccionar al menos un permiso
                </Text>
                <Text style={{ marginTop: 4, fontSize: 12, color: '#dc2626' }}>
                  Activa al menos un permiso para continuar
                </Text>
              </View>
            </View>
          )}

          {/* DEBUG: Contador de permisos */}
          <View style={{
            marginHorizontal: 16,
            marginBottom: 8,
            padding: 8,
            backgroundColor: '#e0f2fe',
            borderRadius: 8
          }}>
            <Text style={{ fontSize: 11, color: '#0369a1' }}>
              📋 Cargando {permisosConfig.reduce((acc, cat) => acc + cat.permisos.length, 0)} permisos en {permisosConfig.length} categorías
            </Text>
          </View>

          {/* Permisos Content */}
          <View style={{
            flex: 1,
            width: '100%',
            backgroundColor: '#f9fafb'
          }}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                padding: 16,
                paddingBottom: 20
              }}
              showsVerticalScrollIndicator={true}
            >
              {permisosConfig.map((categoria, idx) => (
                <View key={idx} style={{
                  marginBottom: 20
                }}>
                  {/* Header de Categoría */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                    paddingBottom: 8,
                    borderBottomWidth: 2,
                    borderBottomColor: categoria.color
                  }}>
                    <View style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: `${categoria.color}20`,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 10
                    }}>
                      <Ionicons name={categoria.icon} size={18} color={categoria.color} />
                    </View>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: '#111827'
                    }}>
                      {categoria.categoria}
                    </Text>
                  </View>

                  {/* Lista de Permisos */}
                  {categoria.permisos.map((permiso) => {
                    const isActive = permisos[permiso.key];

                    return (
                      <View
                        key={permiso.key}
                        style={{
                          backgroundColor: 'white',
                          borderRadius: 12,
                          padding: 14,
                          marginBottom: 10,
                          borderWidth: 2,
                          borderColor: isActive ? categoria.color : '#e5e7eb',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.05,
                          shadowRadius: 2,
                          elevation: 1
                        }}
                      >
                        <View style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          {/* Lado Izquierdo: Info */}
                          <View style={{
                            flex: 1,
                            paddingRight: 12
                          }}>
                            {/* Título del permiso */}
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginBottom: 6,
                              flexWrap: 'wrap'
                            }}>
                              <Ionicons
                                name={permiso.icon}
                                size={16}
                                color={isActive ? categoria.color : '#6b7280'}
                                style={{ marginRight: 6 }}
                              />
                              <Text style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: isActive ? '#111827' : '#4b5563'
                              }}>
                                {permiso.label}
                              </Text>

                              {/* Badge CRÍTICO */}
                              {permiso.critical && (
                                <View style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  backgroundColor: '#fef2f2',
                                  paddingHorizontal: 6,
                                  paddingVertical: 2,
                                  borderRadius: 4,
                                  marginLeft: 6
                                }}>
                                  <Ionicons name="lock-closed" size={9} color="#dc2626" />
                                  <Text style={{
                                    fontSize: 9,
                                    color: '#dc2626',
                                    fontWeight: '700',
                                    marginLeft: 3
                                  }}>
                                    CRÍTICO
                                  </Text>
                                </View>
                              )}
                            </View>

                            {/* Descripción */}
                            <Text style={{
                              fontSize: 12,
                              color: '#6b7280',
                              lineHeight: 16
                            }}>
                              {permiso.description}
                            </Text>
                          </View>

                          {/* Lado Derecho: Switch */}
                          <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingLeft: 8
                          }}>
                            <Switch
                              value={isActive}
                              onValueChange={() => togglePermiso(permiso.key)}
                              trackColor={{
                                false: '#d1d5db',
                                true: categoria.color
                              }}
                              thumbColor="#ffffff"
                              ios_backgroundColor="#d1d5db"
                            />
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Footer */}
          <View style={{
            padding: isWeb ? 16 : 14,
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            flexDirection: 'row',
            gap: 10,
            justifyContent: 'flex-end',
            backgroundColor: '#f9fafb'
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#d1d5db',
                backgroundColor: 'white'
              }}
            >
              <Text style={{
                color: '#374151',
                fontSize: 14,
                fontWeight: '600'
              }}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirmar}
              disabled={!Object.values(permisos).some(valor => valor === true)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
                backgroundColor: Object.values(permisos).some(valor => valor === true)
                  ? '#3b82f6'
                  : '#9ca3af',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                opacity: Object.values(permisos).some(valor => valor === true) ? 1 : 0.5
              }}
            >
              <Ionicons name="checkmark" size={16} color="white" />
              <Text style={{
                color: 'white',
                fontSize: 14,
                fontWeight: '600'
              }}>
                {modoEdicion ? 'Guardar Cambios' : 'Confirmar y Asignar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PermisosModal;
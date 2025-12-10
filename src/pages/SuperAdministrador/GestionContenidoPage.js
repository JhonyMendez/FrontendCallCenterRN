import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { agenteService } from '../../api/services/agenteService';
import { categoriaService } from '../../api/services/categoriaService';
import { contenidoService } from '../../api/services/contenidoService';
import { departamentoService } from '../../api/services/departamentoService';
import Sidebar from '../../components/Sidebar/sidebarSuperAdmin';
import GestionContenidoCard from '../../components/SuperAdministrador/GestionContenidoCard';
import { styles } from '../../styles/GestionContenidoStyles';

const ESTADOS = ['borrador', 'revision', 'activo', 'inactivo', 'archivado'];

const GestionContenidoPage = () => {
  const [contenidos, setContenidos] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState(false);
  const [selectedAgente, setSelectedAgente] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [searchEstado, setSearchEstado] = useState('');
  const [searchAgente, setSearchAgente] = useState('');

  const [formData, setFormData] = useState({
    id_contenido: null,
    id_agente: '',
    id_categoria: '',
    id_departamento: '',
    titulo: '',
    contenido: '',
    resumen: '',
    palabras_clave: '',
    etiquetas: '',
    prioridad: 5,
    estado: 'borrador'
  });

  const sanitizeInput = (text) => {
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  };


  const filteredEstados = ESTADOS.filter((estado) => {
    const search = searchEstado.toLowerCase();
    return !search || estado.toLowerCase().includes(search);
  });

  const filteredAgentes = agentes.filter((agente) => {
  const search = searchAgente.toLowerCase();
  return !search || agente.nombre?.toLowerCase().includes(search);
});


  useEffect(() => {
    if (formData.id_categoria && categorias.length > 0) {
      const categoriaSeleccionada = categorias.find(
        cat => cat.id_categoria === formData.id_categoria
      );
      
      if (categoriaSeleccionada && categoriaSeleccionada.id_agente) {
        setFormData(prev => ({
          ...prev,
          id_agente: categoriaSeleccionada.id_agente
        }));
      }
    }
  }, [formData.id_categoria, categorias]);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    if (selectedAgente) {
      cargarContenidos();
    }
  }, [selectedAgente, filtroEstado]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      const [agentesData, departamentosData] = await Promise.all([
        agenteService.getAll(),
        departamentoService.getAll()
      ]);
      setAgentes(agentesData);
      setDepartamentos(departamentosData);
      
      if (agentesData.length > 0) {
        setSelectedAgente(agentesData[0].id_agente);
        const categoriasData = await categoriaService.getByAgente(agentesData[0].id_agente);
        setCategorias(categoriasData);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const cargarContenidos = async () => {
    try {
      const params = filtroEstado ? { estado: filtroEstado } : {};
      const data = await contenidoService.getByAgente(selectedAgente, params);
      setContenidos(data);
    } catch (error) {
      console.error('Error cargando contenidos:', error);
      Alert.alert('Error', 'No se pudieron cargar los contenidos');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarContenidos();
    setRefreshing(false);
  };

  const handleAgenteChange = async (idAgente) => {
    setSelectedAgente(idAgente);
    try {
      const categoriasData = await categoriaService.getByAgente(idAgente);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const abrirModal = (contenido = null) => {
    if (contenido) {
      setEditando(true);
      setFormData({
        id_contenido: contenido.id_contenido,
        id_agente: contenido.id_agente,
        id_categoria: contenido.id_categoria,
        id_departamento: contenido.id_departamento || '',
        titulo: contenido.titulo,
        contenido: contenido.contenido,
        resumen: contenido.resumen || '',
        palabras_clave: contenido.palabras_clave || '',
        etiquetas: contenido.etiquetas || '',
        prioridad: contenido.prioridad,
        estado: contenido.estado
      });
    } else {
      setEditando(false);
      setFormData({
        id_contenido: null,
        id_agente: selectedAgente || '',
        id_categoria: '',
        id_departamento: '',
        titulo: '',
        contenido: '',
        resumen: '',
        palabras_clave: '',
        etiquetas: '',
        prioridad: 5,
        estado: 'borrador'
      });
    }
    setModalVisible(true);
  };

const cerrarModal = () => {
    setModalVisible(false);
    setEditando(false);
    setSearchAgente('');
    setSearchEstado('');
};

  const guardarContenido = async () => {
    // 🔥 Validaciones mejoradas
    if (!formData.id_categoria) {
      Alert.alert('Error', 'Debes seleccionar una categoría');
      return;
    }

    if (!formData.id_agente) {
      Alert.alert('Error', 'No se pudo determinar el agente. Selecciona una categoría válida.');
      return;
    }

    if (!formData.id_departamento) {
      Alert.alert('Error', 'Debes seleccionar un departamento');
      return;
    }

    if (!formData.titulo || !formData.contenido) {
      Alert.alert('Error', 'Título y contenido son obligatorios');
      return;
    }

    try {
      const dataToSend = {
        id_agente: parseInt(formData.id_agente),
        id_categoria: parseInt(formData.id_categoria),
        id_departamento: formData.id_departamento ? parseInt(formData.id_departamento) : null,
        titulo: formData.titulo,
        contenido: formData.contenido,
        resumen: formData.resumen,
        palabras_clave: formData.palabras_clave,
        etiquetas: formData.etiquetas,
        prioridad: parseInt(formData.prioridad),
        estado: formData.estado
      };

      if (editando) {
        await contenidoService.update(formData.id_contenido, dataToSend);
        Alert.alert('Éxito', 'Contenido actualizado correctamente');
      } else {
        await contenidoService.create(dataToSend);
        Alert.alert('Éxito', 'Contenido creado correctamente');
      }

      cerrarModal();
      cargarContenidos();
    } catch (error) {
      console.error('Error guardando contenido:', error);
      Alert.alert('Error', error.message || 'No se pudo guardar el contenido');
    }
  };

  const publicarContenido = async (id) => {
    Alert.alert(
      'Confirmar publicación',
      '¿Estás seguro de publicar este contenido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Publicar',
          onPress: async () => {
            try {
              await contenidoService.publicar(id);
              Alert.alert('Éxito', 'Contenido publicado correctamente');
              cargarContenidos();
            } catch (error) {
              console.error('Error publicando:', error);
              Alert.alert('Error', 'No se pudo publicar el contenido');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Sidebar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Sidebar />
      
      <View style={styles.content}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Gestión de Contenidos</Text>
              <Text style={styles.headerSubtitle}>
                Administra el contenido de conocimiento de los agentes
              </Text>
            </View>

            {/* Filtros */}
            <View style={styles.filtrosContainer}>
              <View style={styles.filtrosRow}>
                <View style={styles.filtroItem}>
                <Text style={styles.filtroLabel}>Agente</Text>
                
                {/* Campo de búsqueda */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  marginBottom: 8,
                  borderRadius: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}>
                  <Text style={{ fontSize: 16 }}>🔍</Text>
                  <TextInput
                    style={{
                      flex: 1,
                      color: 'white',
                      fontSize: 13,
                      paddingVertical: 4,
                    }}
                    placeholder="Buscar agente..."
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={searchAgente}
                    onChangeText={(text) => setSearchAgente(sanitizeInput(text))}
                  />
                  {searchAgente.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchAgente('')}>
                      <Text style={{ fontSize: 16 }}>❌</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Lista de agentes filtrados */}
                <ScrollView 
                  style={{ maxHeight: 200 }}
                  nestedScrollEnabled={true}
                >
                  {filteredAgentes.length === 0 ? (
                    <View style={{
                      padding: 16,
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 8,
                    }}>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 13 }}>
                        No se encontraron agentes
                      </Text>
                    </View>
                  ) : (
                    filteredAgentes.map((agente) => (
                      <TouchableOpacity
                        key={agente.id_agente}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                          padding: 12,
                          borderRadius: 8,
                          borderWidth: 2,
                          borderColor: selectedAgente === agente.id_agente 
                            ? '#3498db' 
                            : 'rgba(255, 255, 255, 0.1)',
                          backgroundColor: selectedAgente === agente.id_agente 
                            ? 'rgba(52, 152, 219, 0.2)' 
                            : 'rgba(255, 255, 255, 0.05)',
                          marginBottom: 8,
                        }}
                        onPress={() => handleAgenteChange(agente.id_agente)}
                        activeOpacity={0.7}
                      >
                        <View style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          backgroundColor: agente.color_tema || '#3498db',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                          <Text style={{ fontSize: 18 }}>👤</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{
                            color: selectedAgente === agente.id_agente ? '#3498db' : 'white',
                            fontWeight: '600',
                            fontSize: 14,
                          }}>
                            {agente.nombre}
                          </Text>
                          {agente.area_especialidad && (
                            <Text style={{
                              color: 'rgba(255, 255, 255, 0.5)',
                              fontSize: 11,
                              marginTop: 2,
                            }}>
                              {agente.area_especialidad}
                            </Text>
                          )}
                        </View>
                        {selectedAgente === agente.id_agente && (
                          <Text style={{ fontSize: 20 }}>✅</Text>
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>

              <View style={styles.filtroItem}>
                <Text style={styles.filtroLabel}>Estado</Text>
                
                {/* Campo de búsqueda */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  marginBottom: 8,
                  borderRadius: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}>
                  <Text style={{ fontSize: 16 }}>🔍</Text>
                  <TextInput
                    style={{
                      flex: 1,
                      color: 'white',
                      fontSize: 13,
                      paddingVertical: 4,
                    }}
                    placeholder="Buscar estado..."
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={searchEstado}
                    onChangeText={(text) => setSearchEstado(sanitizeInput(text))}
                  />
                  {searchEstado.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchEstado('')}>
                      <Text style={{ fontSize: 16 }}>❌</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Lista de estados filtrados */}
                <ScrollView 
                  style={{ maxHeight: 250 }}
                  nestedScrollEnabled={true}
                >
                  {/* Opción "Todos" */}
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      padding: 12,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: filtroEstado === '' 
                        ? '#3498db' 
                        : 'rgba(255, 255, 255, 0.1)',
                      backgroundColor: filtroEstado === '' 
                        ? 'rgba(52, 152, 219, 0.2)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      marginBottom: 8,
                    }}
                    onPress={() => setFiltroEstado('')}
                    activeOpacity={0.7}
                  >
                    <View style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: '#3498db',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{ fontSize: 18 }}>🌐</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: filtroEstado === '' ? '#3498db' : 'white',
                        fontWeight: '600',
                        fontSize: 14,
                      }}>
                        Todos los estados
                      </Text>
                    </View>
                    {filtroEstado === '' && (
                      <Text style={{ fontSize: 20 }}>✅</Text>
                    )}
                  </TouchableOpacity>

                  {filteredEstados.length === 0 ? (
                    <View style={{
                      padding: 16,
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 8,
                    }}>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 13 }}>
                        No se encontraron estados
                      </Text>
                    </View>
                  ) : (
                    filteredEstados.map((estado) => {
                      const estadoColors = {
                        borrador: { icon: '📝', color: '#9ca3af' },
                        revision: { icon: '🔍', color: '#fbbf24' },
                        activo: { icon: '✅', color: '#10b981' },
                        inactivo: { icon: '❌', color: '#ef4444' },
                        archivado: { icon: '📦', color: '#6b7280' },
                      };
                      const estadoInfo = estadoColors[estado] || { icon: '📄', color: '#667eea' };

                      return (
                        <TouchableOpacity
                          key={estado}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10,
                            padding: 12,
                            borderRadius: 8,
                            borderWidth: 2,
                            borderColor: filtroEstado === estado 
                              ? estadoInfo.color 
                              : 'rgba(255, 255, 255, 0.1)',
                            backgroundColor: filtroEstado === estado 
                              ? `${estadoInfo.color}33` 
                              : 'rgba(255, 255, 255, 0.05)',
                            marginBottom: 8,
                          }}
                          onPress={() => setFiltroEstado(estado)}
                          activeOpacity={0.7}
                        >
                          <View style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            backgroundColor: estadoInfo.color,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                            <Text style={{ fontSize: 18 }}>{estadoInfo.icon}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{
                              color: filtroEstado === estado ? estadoInfo.color : 'white',
                              fontWeight: '600',
                              fontSize: 14,
                            }}>
                              {estado.charAt(0).toUpperCase() + estado.slice(1)}
                            </Text>
                          </View>
                          {filtroEstado === estado && (
                            <Text style={{ fontSize: 20 }}>✅</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              </View>
              </View>

              <TouchableOpacity
                onPress={() => abrirModal()}
                style={styles.btnNuevo}
              >
                <Text style={styles.btnNuevoText}>+ Nuevo Contenido</Text>
              </TouchableOpacity>
            </View>

            {/* Lista de contenidos */}
            <View>
              <Text style={styles.listaHeader}>
                Contenidos ({contenidos.length})
              </Text>

              {contenidos.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No hay contenidos disponibles
                  </Text>
                </View>
              ) : (
                contenidos.map(contenido => (
                  <GestionContenidoCard
                    key={contenido.id_contenido}
                    contenido={contenido}
                    onEdit={abrirModal}
                    onPublish={publicarContenido}
                    onView={(cont) => console.log('Ver contenido:', cont)}
                  />
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Modal de creación/edición */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={cerrarModal}
      >
        <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          {/* ============ HEADER DEL MODAL ============ */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 24,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(102, 126, 234, 0.2)',
            backgroundColor: 'rgba(102, 126, 234, 0.05)',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            marginTop: -28,
            marginHorizontal: -28,
            marginBottom: 20,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: 'rgba(102, 126, 234, 0.3)',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#667eea',
                shadowOpacity: 0.5,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
              }}>
                <Text style={{ fontSize: 28 }}>
                  {editando ? '✏️' : '➕'}
                </Text>
              </View>
              <View>
                <Text style={{
                  fontSize: 22,
                  fontWeight: '900',
                  color: '#fff',
                  letterSpacing: 0.5,
                }}>
                  {editando ? 'Editar Contenido' : 'Nuevo Contenido'}
                </Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginTop: 2 }}>
                  {editando ? 'Modifica la información del contenido' : 'Completa los campos requeridos'}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={cerrarModal}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(239, 68, 68, 0.3)',
              }}
            >
              <Text style={{ fontSize: 22 }}>❌</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

          {/* ============ CATEGORÍA - AHORA ES LO PRIMERO ============ */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Text style={{ fontSize: 18 }}>📁</Text>
            <Text style={styles.formLabel}>
              Categoría <Text style={{ color: '#ef4444' }}>*</Text>
            </Text>
          </View>
          <View style={styles.formPickerContainer}>
            <Picker
              selectedValue={formData.id_categoria}
              onValueChange={(value) => setFormData({ ...formData, id_categoria: value })}
              style={styles.formPicker}
            >
              <Picker.Item label="Seleccionar categoría" value="" />
              {categorias.map(cat => (
                <Picker.Item 
                  key={cat.id_categoria} 
                  label={cat.nombre} 
                  value={cat.id_categoria} 
                />
              ))}
            </Picker>
          </View>

          {/* ============ INFORMACIÓN DEL AGENTE (READONLY) ============ */}
          {formData.id_categoria && (() => {
            const categoriaSeleccionada = categorias.find(
              cat => cat.id_categoria === formData.id_categoria
            );
            const agenteSeleccionado = agentes.find(
              ag => ag.id_agente === categoriaSeleccionada?.id_agente
            );
            
            return agenteSeleccionado ? (
              <View style={{
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                padding: 16,
                borderRadius: 12,
                marginBottom: 20,
                marginTop: 10,
                borderWidth: 1,
                borderColor: 'rgba(52, 152, 219, 0.3)',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Text style={{ fontSize: 18 }}>ℹ️</Text>
                  <Text style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: 12,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}>
                    Agente asociado (automático)
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: agenteSeleccionado.color_tema || '#3498db',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{ fontSize: 22 }}>👤</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      color: '#3498db',
                      fontWeight: '700',
                      fontSize: 16,
                    }}>
                      {agenteSeleccionado.nombre}
                    </Text>
                    {agenteSeleccionado.area_especialidad && (
                      <Text style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: 12,
                        marginTop: 2,
                      }}>
                        {agenteSeleccionado.area_especialidad}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ) : null;
          })()}

          {/* ============ DEPARTAMENTO ============ */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Text style={{ fontSize: 18 }}>🏢</Text>
            <Text style={styles.formLabel}>
              Departamento <Text style={{ color: '#ef4444' }}>*</Text>
            </Text>
          </View>

              <ScrollView style={{ maxHeight: 200, marginBottom: 16 }}>
                {/* Opción "Sin departamento" */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 14,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: formData.id_departamento === '' 
                      ? '#3498db' 
                      : 'rgba(255, 255, 255, 0.15)',
                    backgroundColor: formData.id_departamento === '' 
                      ? 'rgba(52, 152, 219, 0.2)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    marginBottom: 8,
                  }}
                  onPress={() => setFormData({ ...formData, id_departamento: '' })}
                  activeOpacity={0.7}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: '#3498db',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{ fontSize: 22 }}>🏢</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      color: formData.id_departamento === '' ? '#3498db' : 'white',
                      fontWeight: '700',
                      fontSize: 15,
                    }}>
                      Sin departamento
                    </Text>
                  </View>
                  {formData.id_departamento === '' && (
                    <Text style={{ fontSize: 24 }}>✅</Text>
                  )}
                </TouchableOpacity>

                {/* Lista de departamentos */}
                {departamentos.map((dept) => (
                  <TouchableOpacity
                    key={dept.id_departamento}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 14,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: formData.id_departamento === dept.id_departamento 
                        ? '#3498db' 
                        : 'rgba(255, 255, 255, 0.15)',
                      backgroundColor: formData.id_departamento === dept.id_departamento 
                        ? 'rgba(52, 152, 219, 0.2)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      marginBottom: 8,
                    }}
                    onPress={() => setFormData({ ...formData, id_departamento: dept.id_departamento })}
                    activeOpacity={0.7}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: '#667eea',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{ fontSize: 22 }}>🏢</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: formData.id_departamento === dept.id_departamento ? '#3498db' : 'white',
                        fontWeight: '700',
                        fontSize: 15,
                      }}>
                        {dept.nombre}
                      </Text>
                    </View>
                    {formData.id_departamento === dept.id_departamento && (
                      <Text style={{ fontSize: 24 }}>✅</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Text style={{ fontSize: 18 }}>📝</Text>
                <Text style={styles.formLabel}>
                  Título <Text style={{ color: '#ef4444' }}>*</Text>
                </Text>
              </View>
              <TextInput
                value={formData.titulo}
                onChangeText={(text) => setFormData({ ...formData, titulo: text })}
                placeholder="Título del contenido"
                style={styles.formInput}
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Text style={{ fontSize: 18 }}>📄</Text>
                <Text style={styles.formLabel}>
                  Contenido <Text style={{ color: '#ef4444' }}>*</Text>
                </Text>
              </View>
              <TextInput
                value={formData.contenido}
                onChangeText={(text) => setFormData({ ...formData, contenido: text })}
                placeholder="Contenido detallado"
                multiline
                numberOfLines={6}
                style={styles.formInputMultiline}
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Text style={{ fontSize: 18 }}>📋</Text>
                <Text style={styles.formLabel}>Resumen</Text>
              </View>
              <TextInput
                value={formData.resumen}
                onChangeText={(text) => setFormData({ ...formData, resumen: text })}
                placeholder="Resumen breve"
                multiline
                numberOfLines={3}
                style={styles.formInputMultiline}
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Text style={{ fontSize: 18 }}>🔑</Text>
                <Text style={styles.formLabel}>Palabras clave</Text>
              </View>
              <TextInput
                value={formData.palabras_clave}
                onChangeText={(text) => setFormData({ ...formData, palabras_clave: text })}
                placeholder="Separadas por comas"
                style={styles.formInput}
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Text style={{ fontSize: 18 }}>🏷️</Text>
                <Text style={styles.formLabel}>Etiquetas</Text>
              </View>
              <TextInput
                value={formData.etiquetas}
                onChangeText={(text) => setFormData({ ...formData, etiquetas: text })}
                placeholder="Separadas por comas"
                style={styles.formInput}
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Text style={{ fontSize: 18 }}>🚩</Text>
                <Text style={styles.formLabel}>Prioridad</Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                {[1,2,3,4,5,6,7,8,9,10].map(num => {
                  const getColor = (n) => {
                    if (n >= 8) return '#ef4444';
                    if (n >= 5) return '#fbbf24';
                    return '#22c55e';
                  };
                  const color = getColor(num);
                  
                  return (
                    <TouchableOpacity
                      key={num}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: formData.prioridad === num ? color : 'rgba(255, 255, 255, 0.15)',
                        backgroundColor: formData.prioridad === num ? `${color}33` : 'rgba(255, 255, 255, 0.05)',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onPress={() => setFormData({ ...formData, prioridad: num })}
                      activeOpacity={0.7}
                    >
                      <Text style={{
                        color: formData.prioridad === num ? color : 'white',
                        fontWeight: '800',
                        fontSize: 18,
                      }}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Text style={{ fontSize: 18 }}>📊</Text>
              <Text style={styles.formLabel}>Estado</Text>
            </View>
              <View style={{ gap: 10, marginBottom: 16 }}>
                {ESTADOS.map((estado) => {
                  const estadoColors = {
                    borrador: { icon: '📝', color: '#9ca3af', label: 'Borrador' },
                    revision: { icon: '🔍', color: '#fbbf24', label: 'En Revisión' },
                    activo: { icon: '✅', color: '#10b981', label: 'Activo' },
                    inactivo: { icon: '❌', color: '#ef4444', label: 'Inactivo' },
                    archivado: { icon: '📦', color: '#6b7280', label: 'Archivado' },
                  };
                  const info = estadoColors[estado];

                  return (
                    <TouchableOpacity
                      key={estado}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        padding: 14,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: formData.estado === estado ? info.color : 'rgba(255, 255, 255, 0.15)',
                        backgroundColor: formData.estado === estado ? `${info.color}33` : 'rgba(255, 255, 255, 0.05)',
                      }}
                      onPress={() => setFormData({ ...formData, estado: estado })}
                      activeOpacity={0.7}
                    >
                      <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        backgroundColor: info.color,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <Text style={{ fontSize: 20 }}>{info.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          color: formData.estado === estado ? info.color : 'white',
                          fontWeight: '700',
                          fontSize: 15,
                        }}>
                          {info.label}
                        </Text>
                      </View>
                      {formData.estado === estado && (
                        <Text style={{ fontSize: 24 }}>✅</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* ============ FOOTER DEL MODAL ============ */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: 12,
                padding: 24,
                borderTopWidth: 1,
                borderTopColor: 'rgba(255, 255, 255, 0.1)',
                marginHorizontal: -28,
                marginBottom: -28,
                marginTop: 20,
              }}>
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 14,
                    borderRadius: 16,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onPress={cerrarModal}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 18 }}>❌</Text>
                  <Text style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: '700',
                    fontSize: 16,
                  }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: '#667eea',
                    paddingHorizontal: 24,
                    paddingVertical: 14,
                    borderRadius: 16,
                    shadowColor: '#667eea',
                    shadowOpacity: 0.6,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 10,
                  }}
                  onPress={guardarContenido}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 18 }}>
                    {editando ? '✅' : '➕'}
                  </Text>
                  <Text style={{
                    color: 'white',
                    fontWeight: '700',
                    fontSize: 16,
                    letterSpacing: 0.5,
                  }}>
                    {editando ? 'Actualizar' : 'Crear'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GestionContenidoPage;
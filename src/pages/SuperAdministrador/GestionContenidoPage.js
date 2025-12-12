import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
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
import SuperAdminSidebar from '../../components/Sidebar/sidebarSuperAdmin';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';
import GestionContenidoCard from '../../components/SuperAdministrador/GestionContenidoCard';
import { styles } from '../../styles/GestionContenidoStyles';

const ESTADOS = ['borrador', 'revision', 'activo', 'inactivo', 'archivado'];

// 🔥 NUEVO: Información de prioridades
const PRIORITY_LABELS = {
  10: { label: '🔴 Crítico', desc: 'Máxima prioridad', color: '#ef4444' },
  9:  { label: '🔴 Muy Alto', desc: 'Prioridad muy alta', color: '#f97316' },
  8:  { label: '🟠 Alto', desc: 'Alta prioridad', color: '#f59e0b' },
  7:  { label: '🟠 Moderado+', desc: 'Prioridad elevada', color: '#eab308' },
  6:  { label: '🟡 Moderado', desc: 'Prioridad media-alta', color: '#84cc16' },
  5:  { label: '🟡 Normal', desc: 'Prioridad estándar', color: '#22c55e' },
  4:  { label: '🟢 Bajo', desc: 'Prioridad baja', color: '#10b981' },
  3:  { label: '🟢 Muy Bajo', desc: 'Prioridad muy baja', color: '#14b8a6' },
  2:  { label: '🔵 Mínimo', desc: 'Prioridad mínima', color: '#06b6d4' },
  1:  { label: '🔵 Opcional', desc: 'Información complementaria', color: '#0ea5e9' }
};

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
  const [searchCategoria, setSearchCategoria] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [modalViewVisible, setModalViewVisible] = useState(false);
const [contenidoView, setContenidoView] = useState(null);

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

  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [errores, setErrores] = useState({
    id_categoria: '',
    titulo: '',
    contenido: '',
    resumen: '',
    palabras_clave: '',
    etiquetas: '',
    prioridad: '',
    estado: ''
  });

  const cerrarModalView = () => {
    setModalViewVisible(false);
    setContenidoView(null);
  };

  const mostrarNotificacionExito = (mensaje) => {
    setSuccessMessage(mensaje);
    setShowSuccessNotification(true);
    
    setTimeout(() => {
      setShowSuccessNotification(false);
    }, 3000);
  };

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


/*
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
*/

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
      
      // 🔥 Cargar TODAS las categorías de TODOS los agentes
      if (agentesData.length > 0) {
        setSelectedAgente(agentesData[0].id_agente);
        
        const todasLasCategorias = [];
        for (const agente of agentesData) {
          const cats = await categoriaService.getByAgente(agente.id_agente);
          todasLasCategorias.push(...cats);
        }
        setCategorias(todasLasCategorias);
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

const abrirModal = async (contenido = null) => {
  if (contenido) {
    setEditando(true);
    
    // 🔥 PRIMERO: Cargar categorías del agente del contenido
    try {
      const categoriasData = await categoriaService.getByAgente(contenido.id_agente);
      setCategorias(categoriasData);
      
      // 🔥 SEGUNDO: Después de cargar categorías, cargar el formulario
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
      
      // 🔥 TERCERO: Abrir el modal DESPUÉS de cargar todo
      setModalVisible(true);
      
    } catch (error) {
      console.error('Error cargando categorías para edición:', error);
      Alert.alert('Error', 'No se pudieron cargar las categorías del agente');
    }
  } else {
    // Crear nuevo contenido
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
    setModalVisible(true);
  }
};

  const cerrarModal = () => {
    setModalVisible(false);
    setEditando(false);
    setSearchAgente('');
    setSearchEstado('');
    setSearchCategoria('');
    setErrores({ 
      id_categoria: '', 
      titulo: '', 
      contenido: '',
      resumen: '',
      palabras_clave: '',
      etiquetas: '',
      prioridad: '',
      estado: ''
    });
  };

  const guardarContenido = async () => {
    console.log('🚀 ========== INICIO guardarContenido ==========');
    
    // 🔥 NUEVA: Función de validación con mensajes
  const validarFormulario = () => {
    const nuevosErrores = {
      id_categoria: '',
      titulo: '',
      contenido: '',
      resumen: '',
      palabras_clave: '',
      etiquetas: '',
      prioridad: '',
      estado: ''
    };
    
    let hayErrores = false;
    
    // Validar categoría
    if (!formData.id_categoria) {
      nuevosErrores.id_categoria = '⚠️ Debes seleccionar una categoría';
      hayErrores = true;
    }
    
    // Validar título
    if (!formData.titulo || formData.titulo.trim() === '') {
      nuevosErrores.titulo = '⚠️ El título es obligatorio';
      hayErrores = true;
    } else if (formData.titulo.trim().length < 5) {
      nuevosErrores.titulo = `⚠️ El título debe tener al menos 5 caracteres (actual: ${formData.titulo.trim().length})`;
      hayErrores = true;
    }
    
    // 🔥 NUEVA: Validar contenido con longitud mínima
    if (!formData.contenido || formData.contenido.trim() === '') {
      nuevosErrores.contenido = '⚠️ El contenido es obligatorio';
      hayErrores = true;
    } else if (formData.contenido.trim().length < 50) {
      nuevosErrores.contenido = `⚠️ El contenido debe tener al menos 50 caracteres (actual: ${formData.contenido.trim().length})`;
      hayErrores = true;
    }
    
    // Validar resumen
    if (!formData.resumen || formData.resumen.trim() === '') {
      nuevosErrores.resumen = '⚠️ El resumen es obligatorio';
      hayErrores = true;
    } else if (formData.resumen.trim().length < 10) {
      nuevosErrores.resumen = `⚠️ El resumen debe tener al menos 10 caracteres (actual: ${formData.resumen.trim().length})`;
      hayErrores = true;
    }
    
    // Validar palabras clave
    if (!formData.palabras_clave || formData.palabras_clave.trim() === '') {
      nuevosErrores.palabras_clave = '⚠️ Las palabras clave son obligatorias';
      hayErrores = true;
    }
    
    // Validar etiquetas
    if (!formData.etiquetas || formData.etiquetas.trim() === '') {
      nuevosErrores.etiquetas = '⚠️ Las etiquetas son obligatorias';
      hayErrores = true;
    }
    
    // Validar prioridad
    if (!formData.prioridad || formData.prioridad < 1 || formData.prioridad > 10) {
      nuevosErrores.prioridad = '⚠️ Selecciona una prioridad válida (1-10)';
      hayErrores = true;
    }
    
    // Validar estado
    if (!formData.estado) {
      nuevosErrores.estado = '⚠️ Debes seleccionar un estado';
      hayErrores = true;
    }
    
    setErrores(nuevosErrores);
    return !hayErrores;
  };
    
    // 🔥 FUNCIÓN INTERNA para el guardado real
    const guardarContenidoReal = async () => {
      try {
        const categoriaSeleccionada = categorias.find(
          cat => cat.id_categoria === formData.id_categoria
        );
        
        const agenteSeleccionado = agentes.find(
          ag => ag.id_agente === categoriaSeleccionada?.id_agente
        );

        const id_departamento = agenteSeleccionado?.id_departamento || null;

        const dataToSend = {
          id_agente: parseInt(categoriaSeleccionada.id_agente),
          id_categoria: parseInt(formData.id_categoria),
          id_departamento: id_departamento ? parseInt(id_departamento) : null,
          titulo: formData.titulo.trim(),
          contenido: formData.contenido.trim(),
          resumen: formData.resumen,
          palabras_clave: formData.palabras_clave,
          etiquetas: formData.etiquetas,
          prioridad: parseInt(formData.prioridad),
          estado: formData.estado
        };

        console.log('📤 Datos a enviar:', JSON.stringify(dataToSend, null, 2));

        if (editando) {
          console.log('✏️ Modo EDICIÓN - ID:', formData.id_contenido);
          await contenidoService.update(formData.id_contenido, dataToSend);
          mostrarNotificacionExito(' Contenido actualizado correctamente');
        } else {
          console.log('➕ Modo CREACIÓN');
          await contenidoService.create(dataToSend);
          mostrarNotificacionExito('Contenido creado correctamente');
        }

        console.log('🔄 Cerrando modal y recargando...');
        cerrarModal();
        await cargarContenidos();
        console.log('✅ Contenidos recargados');
        
      } catch (error) {
        console.error('❌ Error:', error);
        Alert.alert('Error', error.message || 'No se pudo guardar el contenido');
      }
    };
    
    // 🔥 VALIDAR PRIMERO
    if (!validarFormulario()) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos obligatorios marcados en rojo');
      return;
    }
    
    // 🔥 VALIDACIÓN DE PRIORIDAD ALTA
    if (formData.prioridad >= 8) {
      const count = contenidos.filter(c => 
        c.prioridad === formData.prioridad && 
        c.estado === 'activo' &&
        c.id_contenido !== formData.id_contenido
      ).length;
      
      if (count >= 5) {
        Alert.alert(
          '⚠️ Muchos contenidos con esta prioridad',
          `Ya tienes ${count} contenidos activos con prioridad ${formData.prioridad}. La prioridad será menos efectiva.\n\n¿Deseas continuar?`,
          [
            { text: 'Cambiar prioridad', style: 'cancel' },
            { text: 'Continuar', onPress: guardarContenidoReal }
          ]
        );
        return;
      }
    }
    
    // Si todo está bien, guardar
    await guardarContenidoReal();
    
    console.log('🏁 ========== FIN guardarContenido ==========');
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
      <View style={contentStyles.wrapper}>
        <SuperAdminSidebar isOpen={sidebarOpen} />
        <View style={[contentStyles.mainContent, sidebarOpen && contentStyles.mainContentWithSidebar]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        </View>
      </View>
    );
  }

return (
    <View style={contentStyles.wrapper}>
      
      {/* ============ SIDEBAR ============ */}
      <SuperAdminSidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* ============ BOTÓN TOGGLE SIDEBAR ============ */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 16,
          left: sidebarOpen ? 296 : 16,
          zIndex: 1001,
          backgroundColor: '#1e1b4b',
          padding: 12,
          borderRadius: 12,
          shadowColor: '#667eea',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => setSidebarOpen(!sidebarOpen)}
      >
        <Ionicons name={sidebarOpen ? "close" : "menu"} size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* ============ CONTENIDO PRINCIPAL ============ */}
      <View style={[
        contentStyles.mainContent, 
        sidebarOpen && contentStyles.mainContentWithSidebar
      ]}>
        <View style={styles.container}>
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
          {/* ============ FILTROS ============ */}
          <View style={styles.filtrosContainer}>
            {/* Filtro por Estado */}
            <View style={styles.filterContainer}>
              {[
                { key: '', label: 'Todos', icon: 'apps' },
                { key: 'borrador', label: 'Borrador', icon: 'create' },
                { key: 'revision', label: 'Revisión', icon: 'eye' },
                { key: 'activo', label: 'Activo', icon: 'checkmark-circle' },
                { key: 'inactivo', label: 'Inactivo', icon: 'close-circle' },
                { key: 'archivado', label: 'Archivado', icon: 'archive' }
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterButton,
                    filtroEstado === filter.key && styles.filterButtonActive,
                  ]}
                  onPress={() => setFiltroEstado(filter.key)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons 
                      name={filter.icon} 
                      size={14} 
                      color={filtroEstado === filter.key ? 'white' : 'rgba(255, 255, 255, 0.6)'} 
                    />
                    <Text
                      style={[
                        styles.filterText,
                        filtroEstado === filter.key && styles.filterTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Filtro por Agente */}
            <View style={{ marginTop: 12 }}>
              {/* 🔍 Búsqueda compacta */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginBottom: 8,
                borderRadius: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}>
                <Ionicons name="search" size={16} color="rgba(255, 255, 255, 0.4)" />
                <TextInput
                  style={{
                    flex: 1,
                    color: 'white',
                    fontSize: 13,
                    paddingVertical: 2,
                  }}
                  placeholder="Buscar agente..."
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={searchAgente}
                  onChangeText={(text) => setSearchAgente(sanitizeInput(text))}
                />
                {searchAgente.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchAgente('')}>
                    <Ionicons name="close-circle" size={16} color="rgba(255, 255, 255, 0.4)" />
                  </TouchableOpacity>
                )}
              </View>

{/* Scroll horizontal de agentes con drag */}
              <View
                ref={scrollRef}
                onStartShouldSetResponder={() => true}
                style={{
                  flexDirection: 'row',
                  overflowX: 'scroll',
                  overflowY: 'hidden',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  userSelect: 'none',
                  paddingHorizontal: 16,
                  paddingVertical: 4,
                  gap: 8,
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
                onMouseDown={(e) => {
                  setIsDragging(true);
                  setStartX(e.pageX - scrollRef.current.offsetLeft);
                  setScrollLeft(scrollRef.current.scrollLeft);
                }}
                onMouseLeave={() => {
                  setIsDragging(false);
                }}
                onMouseUp={() => {
                  setIsDragging(false);
                }}
                onMouseMove={(e) => {
                  if (!isDragging) return;
                  e.preventDefault();
                  const x = e.pageX - scrollRef.current.offsetLeft;
                  const walk = (x - startX) * 2;
                  scrollRef.current.scrollLeft = scrollLeft - walk;
                }}
              >
                {filteredAgentes.length === 0 ? (
                  <View style={{
                    padding: 16,
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 8,
                    minWidth: 200,
                  }}>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 13 }}>
                      No se encontraron agentes
                    </Text>
                  </View>
                ) : (
                  filteredAgentes.map((agente) => (
                    <TouchableOpacity
                      key={agente.id_agente}
                      style={[
                        styles.filterButton,
                        selectedAgente === agente.id_agente && styles.filterButtonActive,
                      ]}
                      onPress={() => handleAgenteChange(agente.id_agente)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons 
                          name="person" 
                          size={14} 
                          color={selectedAgente === agente.id_agente ? 'white' : 'rgba(255, 255, 255, 0.6)'} 
                        />
                        <Text
                          style={[
                            styles.filterText,
                            selectedAgente === agente.id_agente && styles.filterTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          {agente.nombre_agente}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>

            {/* Botón Nuevo */}
            <TouchableOpacity
              onPress={() => abrirModal()}
              style={styles.btnNuevo}
            >
              <Ionicons name="add-circle" size={22} color="white" />
              <Text style={styles.btnNuevoText}>Nuevo Contenido</Text>
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
                    onView={(cont) => {
                      setContenidoView(cont);
                      setModalViewVisible(true);
                    }}
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
          <View style={styles.formGroup}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Ionicons name="folder" size={16} color="#667eea" />
              <Text style={styles.label}>
                Categoría <Text style={styles.required}>*</Text>
              </Text>
            </View>

            {/* Campo de búsqueda */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
              marginBottom: 12,
            }}>
              <Ionicons name="search" size={18} color="rgba(255, 255, 255, 0.5)" />
              <TextInput
                style={{
                  flex: 1,
                  color: 'white',
                  fontSize: 14,
                  paddingVertical: 4,
                }}
                placeholder="Buscar categoría..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={searchCategoria}
                onChangeText={(text) => setSearchCategoria(sanitizeInput(text))}
              />
              {searchCategoria.length > 0 && (
                <TouchableOpacity onPress={() => setSearchCategoria('')}>
                  <Ionicons name="close-circle" size={18} color="rgba(255, 255, 255, 0.5)" />
                </TouchableOpacity>
              )}
            </View>

            {/* Lista de categorías */}
            <ScrollView 
              style={{ maxHeight: 250 }}
              nestedScrollEnabled={true}
            >
              {categorias
                .filter(cat => {
                  const search = searchCategoria.toLowerCase();
                  return !search || cat.nombre.toLowerCase().includes(search);
                })
                .map((categoria) => (
                  <TouchableOpacity
                    key={categoria.id_categoria}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 14,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: formData.id_categoria === categoria.id_categoria 
                        ? '#667eea' 
                        : 'rgba(255, 255, 255, 0.15)',
                      backgroundColor: formData.id_categoria === categoria.id_categoria 
                        ? 'rgba(102, 126, 234, 0.2)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      marginBottom: 10,
                    }}
                    onPress={() => setFormData({ ...formData, id_categoria: categoria.id_categoria })}
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
                      <Ionicons name="folder" size={22} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: formData.id_categoria === categoria.id_categoria ? '#667eea' : 'white',
                        fontWeight: '700',
                        fontSize: 15,
                      }}>
                        {categoria.nombre}
                      </Text>
                      {categoria.descripcion && (
                        <Text style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: 11,
                          marginTop: 2,
                        }}
                        numberOfLines={1}
                        >
                          {categoria.descripcion}
                        </Text>
                      )}
                    </View>
                    {formData.id_categoria === categoria.id_categoria && (
                      <Ionicons name="checkmark-circle" size={24} color="#667eea" />
                    )}
                  </TouchableOpacity>
                ))}
              
              {categorias.filter(cat => {
                const search = searchCategoria.toLowerCase();
                return !search || cat.nombre.toLowerCase().includes(search);
              }).length === 0 && (
                <View style={{
                  padding: 20,
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 12,
                }}>
                  <Ionicons name="search-outline" size={40} color="rgba(255, 255, 255, 0.3)" />
                  <Text style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: 8, fontSize: 13 }}>
                    No se encontraron categorías
                  </Text>
                </View>
              )}
            </ScrollView>

             {/* 🔥 MENSAJE DE ERROR DE CATEGORÍA - AHORA SÍ DENTRO DEL MODAL */}
              {errores.id_categoria && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  padding: 10,
                  marginTop: 8,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: 8,
                  borderLeftWidth: 3,
                  borderLeftColor: '#ef4444',
                }}>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                    {errores.id_categoria}
                  </Text>
                </View>
              )}
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
                      {agenteSeleccionado.nombre_agente}
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

          {/* ============ INFORMACIÓN DEL DEPARTAMENTO (READONLY) ============ */}
          {formData.id_categoria && (() => {
            const categoriaSeleccionada = categorias.find(
              cat => cat.id_categoria === formData.id_categoria
            );
            const agenteSeleccionado = agentes.find(
              ag => ag.id_agente === categoriaSeleccionada?.id_agente
            );
            const departamentoDelAgente = departamentos.find(
              dept => dept.id_departamento === agenteSeleccionado?.id_departamento
            );
            
            return departamentoDelAgente ? (
              <View style={{
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                padding: 16,
                borderRadius: 12,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: 'rgba(102, 126, 234, 0.3)',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Text style={{ fontSize: 18 }}>ℹ️</Text>
                  <Text style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: 12,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}>
                    Departamento del agente (automático)
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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
                      color: '#667eea',
                      fontWeight: '700',
                      fontSize: 16,
                    }}>
                      {departamentoDelAgente.nombre}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null;
          })()}

           {/* ============ TÍTULO ============ */}
          <View style={styles.formGroup}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Text style={{ fontSize: 18 }}>✏️</Text>
              <Text style={styles.formLabel}>
                Título <Text style={{ color: '#ef4444' }}>*</Text>
              </Text>
            </View>
            <TextInput
              value={formData.titulo}
              onChangeText={(text) => {
                setFormData({ ...formData, titulo: text });
                if (text.trim()) setErrores({ ...errores, titulo: '' });
              }}
              placeholder="Título del contenido"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              style={styles.formInput}
            />
            
            {/* Mensaje de error */}
            {errores.titulo && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                padding: 10,
                marginTop: 8,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 8,
                borderLeftWidth: 3,
                borderLeftColor: '#ef4444',
              }}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                  {errores.titulo}
                </Text>
              </View>
            )}
          </View>

             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Text style={{ fontSize: 18 }}>📋</Text>
              <Text style={styles.formLabel}>Resumen <Text style={{ color: '#ef4444' }}>*</Text></Text>
            </View>
            <TextInput
              value={formData.resumen}
              onChangeText={(text) => {
                setFormData({ ...formData, resumen: text });
                // 🔥 LIMPIAR ERROR AL ESCRIBIR
                if (text.trim()) setErrores({ ...errores, resumen: '' });
              }}
              placeholder="Resumen breve"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              multiline
              numberOfLines={3}
              style={styles.formInputMultiline}
            />

            {/* 🔥 MENSAJE DE ERROR DE RESUMEN */}
            {errores.resumen && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                padding: 10,
                marginTop: 8,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 8,
                borderLeftWidth: 3,
                borderLeftColor: '#ef4444',
              }}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                  {errores.resumen}
                </Text>
              </View>
            )}

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Text style={{ fontSize: 18 }}>📄</Text>
                <Text style={styles.formLabel}>
                  Contenido <Text style={{ color: '#ef4444' }}>*</Text>
                </Text>
              </View>
              <TextInput
                value={formData.contenido}
                onChangeText={(text) => {
                  setFormData({ ...formData, contenido: text });
                  // 🔥 LIMPIAR ERROR AL ESCRIBIR
                  if (text.trim()) setErrores({ ...errores, contenido: '' });
                }}
                placeholder="Contenido detallado"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                multiline
                numberOfLines={6}
                style={styles.formInputMultiline}
              />

              {/* 🔥 AGREGAR ESTE MENSAJE DE ERROR */}
              {errores.contenido && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  padding: 10,
                  marginTop: 8,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: 8,
                  borderLeftWidth: 3,
                  borderLeftColor: '#ef4444',
                }}>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                    {errores.contenido}
                  </Text>
                </View>
              )}



              


              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Text style={{ fontSize: 18 }}>🔑</Text>
                <Text style={styles.formLabel}>Palabras clave <Text style={{ color: '#ef4444' }}>*</Text></Text>
              </View>
              <TextInput
                value={formData.palabras_clave}
                onChangeText={(text) => {
                  setFormData({ ...formData, palabras_clave: text });
                  // 🔥 LIMPIAR ERROR AL ESCRIBIR
                  if (text.trim()) setErrores({ ...errores, palabras_clave: '' });
                }}
                placeholder="Separadas por comas"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                style={styles.formInput}
              />

              {/* 🔥 MENSAJE DE ERROR DE PALABRAS CLAVE */}
              {errores.palabras_clave && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  padding: 10,
                  marginTop: 8,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: 8,
                  borderLeftWidth: 3,
                  borderLeftColor: '#ef4444',
                }}>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                    {errores.palabras_clave}
                  </Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Text style={{ fontSize: 18 }}>🏷️</Text>
              <Text style={styles.formLabel}>Etiquetas <Text style={{ color: '#ef4444' }}>*</Text></Text>
            </View>
            <TextInput
              value={formData.etiquetas}
              onChangeText={(text) => {
                setFormData({ ...formData, etiquetas: text });
                // 🔥 LIMPIAR ERROR AL ESCRIBIR
                if (text.trim()) setErrores({ ...errores, etiquetas: '' });
              }}
              placeholder="Separadas por comas"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              style={styles.formInput}
            />

            {/* 🔥 MENSAJE DE ERROR DE ETIQUETAS */}
            {errores.etiquetas && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                padding: 10,
                marginTop: 8,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 8,
                borderLeftWidth: 3,
                borderLeftColor: '#ef4444',
              }}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                  {errores.etiquetas}
                </Text>
              </View>
            )}

              {/* 🔥 MEJORADO: Header de prioridad con info */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 18 }}>🚩</Text>
                  <Text style={styles.formLabel}>Prioridad</Text>
                </View>
                
                {/* Badge con prioridad seleccionada */}
                {formData.prioridad && PRIORITY_LABELS[formData.prioridad] && (
                  <View style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                    backgroundColor: `${PRIORITY_LABELS[formData.prioridad].color}33`,
                    borderWidth: 1,
                    borderColor: PRIORITY_LABELS[formData.prioridad].color,
                  }}>
                    <Text style={{ 
                      color: PRIORITY_LABELS[formData.prioridad].color, 
                      fontSize: 11, 
                      fontWeight: '700' 
                    }}>
                      {PRIORITY_LABELS[formData.prioridad].label}
                    </Text>
                  </View>
                )}
              </View>

              {/* Descripción de la prioridad seleccionada */}
              {formData.prioridad && PRIORITY_LABELS[formData.prioridad] && (
                <View style={{
                  padding: 10,
                  marginBottom: 12,
                  borderRadius: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderLeftWidth: 3,
                  borderLeftColor: PRIORITY_LABELS[formData.prioridad].color,
                }}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}>
                    {PRIORITY_LABELS[formData.prioridad].desc}
                  </Text>
                </View>
              )}
              {/* 🔥 MEJORADO: Estadísticas de distribución */}
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 6,
              padding: 10,
              marginBottom: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 8,
            }}>
              <Text style={{ 
                width: '100%',
                color: 'rgba(255, 255, 255, 0.5)', 
                fontSize: 11,
                marginBottom: 6,
              }}>
                Distribución actual (contenidos activos):
              </Text>
              {(() => {
                // Calcular distribución
                const distribution = contenidos
                  .filter(c => c.estado === 'activo' && c.id_contenido !== formData.id_contenido)
                  .reduce((acc, c) => {
                    acc[c.prioridad] = (acc[c.prioridad] || 0) + 1;
                    return acc;
                  }, {});
                
                // Mostrar stats
                return Object.entries(distribution)
                  .sort(([a], [b]) => parseInt(b) - parseInt(a))
                  .map(([priority, count]) => (
                    <View key={priority} style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                      backgroundColor: `${PRIORITY_LABELS[priority]?.color || '#666'}22`,
                      borderWidth: 1,
                      borderColor: `${PRIORITY_LABELS[priority]?.color || '#666'}44`,
                    }}>
                      <Text style={{
                        color: PRIORITY_LABELS[priority]?.color || '#999',
                        fontSize: 10,
                        fontWeight: '600',
                      }}>
                        P{priority}: {count}
                      </Text>
                    </View>
                  ));
              })()}
              {contenidos.filter(c => c.estado === 'activo').length === 0 && (
                <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 10 }}>
                  No hay contenidos activos
                </Text>
              )}
            </View>

            {/* 🔥 MEJORADO: Botones de prioridad con badges */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              {[1,2,3,4,5,6,7,8,9,10].map(num => {
                const info = PRIORITY_LABELS[num];
                
                // 🔥 Contar contenidos activos con esta prioridad
                const countWithSamePriority = contenidos.filter(c => 
                  c.prioridad === num && 
                  c.estado === 'activo' &&
                  c.id_contenido !== formData.id_contenido // Excluir el actual si es edición
                ).length;
                
                return (
                  <TouchableOpacity
                    key={num}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: formData.prioridad === num ? info.color : 'rgba(255, 255, 255, 0.15)',
                      backgroundColor: formData.prioridad === num ? `${info.color}33` : 'rgba(255, 255, 255, 0.05)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                    }}
                    onPress={() => setFormData({ ...formData, prioridad: num })}
                    activeOpacity={0.7}
                  >
                    <Text style={{
                      color: formData.prioridad === num ? info.color : 'white',
                      fontWeight: '800',
                      fontSize: 18,
                    }}>
                      {num}
                    </Text>
                    
                    {/* 🔥 NUEVO: Badge con contador */}
                    {countWithSamePriority > 0 && (
                      <View style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        backgroundColor: info.color,
                        borderRadius: 10,
                        minWidth: 20,
                        height: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 4,
                        borderWidth: 2,
                        borderColor: '#1a1a2e',
                      }}>
                        <Text style={{
                          color: 'white',
                          fontSize: 10,
                          fontWeight: '700',
                        }}>
                          {countWithSamePriority}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 🔥 NUEVO: Advertencia si hay muchos con prioridad alta */}
            {formData.prioridad >= 8 && (() => {
              const count = contenidos.filter(c => 
                c.prioridad === formData.prioridad && 
                c.estado === 'activo' &&
                c.id_contenido !== formData.id_contenido
              ).length;
              
              if (count >= 5) {
                return (
                  <View style={{
                    padding: 12,
                    marginBottom: 16,
                    borderRadius: 10,
                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                    borderLeftWidth: 4,
                    borderLeftColor: '#fbbf24',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 20 }}>⚠️</Text>
                      <Text style={{ 
                        color: '#fbbf24', 
                        fontWeight: '700', 
                        fontSize: 13,
                        flex: 1,
                      }}>
                        Ya tienes {count} contenidos activos con prioridad {formData.prioridad}
                      </Text>
                    </View>
                    <Text style={{ 
                      color: 'rgba(255, 255, 255, 0.5)', 
                      fontSize: 11, 
                      marginTop: 4,
                      marginLeft: 28,
                    }}>
                      Considera usar una prioridad diferente para mejor distribución
                    </Text>
                  </View>
                );
              }
              return null;
            })()}
               {/* 🔥 MENSAJE DE ERROR DE PRIORIDAD */}
            {errores.prioridad && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                padding: 10,
                marginTop: 8,
                marginBottom: 16,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 8,
                borderLeftWidth: 3,
                borderLeftColor: '#ef4444',
              }}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                  {errores.prioridad}
                </Text>
              </View>
            )}

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

               {/* 🔥 MENSAJE DE ERROR DE ESTADO */}
            {errores.estado && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                padding: 10,
                marginTop: 8,
                marginBottom: 16,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 8,
                borderLeftWidth: 3,
                borderLeftColor: '#ef4444',
              }}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                  {errores.estado}
                </Text>
              </View>
            )}

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


{/* Modal de visualización */}
<Modal
  visible={modalViewVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={cerrarModalView}
>
  <View style={styles.modalOverlay}>
    <View style={[styles.modalContent, { maxWidth: 800 }]}>
      
      {/* Header */}
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
            backgroundColor: 'rgba(52, 152, 219, 0.3)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 28 }}>👁️</Text>
          </View>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#fff' }}>
              Detalles del Contenido
            </Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginTop: 2 }}>
              Visualización completa
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={cerrarModalView}
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

      {contenidoView && (
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* Título */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Text style={{ fontSize: 18 }}>✏️</Text>
              <Text style={styles.formLabel}>Título</Text>
            </View>
            <View style={{
              padding: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              borderLeftWidth: 3,
              borderLeftColor: '#667eea',
            }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                {contenidoView.titulo}
              </Text>
            </View>
          </View>

          {/* Agente y Categoría */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            {/* Agente */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Text style={{ fontSize: 18 }}>👤</Text>
                <Text style={styles.formLabel}>Agente</Text>
              </View>
              <View style={{
                padding: 14,
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(52, 152, 219, 0.3)',
              }}>
                <Text style={{ color: '#3498db', fontSize: 14, fontWeight: '600' }}>
                  {agentes.find(a => a.id_agente === contenidoView.id_agente)?.nombre_agente || 'N/A'}
                </Text>
              </View>
            </View>

            {/* Categoría */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Text style={{ fontSize: 18 }}>📁</Text>
                <Text style={styles.formLabel}>Categoría</Text>
              </View>
              <View style={{
                padding: 14,
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(102, 126, 234, 0.3)',
              }}>
                <Text style={{ color: '#667eea', fontSize: 14, fontWeight: '600' }}>
                  {categorias.find(c => c.id_categoria === contenidoView.id_categoria)?.nombre || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Resumen */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Text style={{ fontSize: 18 }}>📋</Text>
              <Text style={styles.formLabel}>Resumen</Text>
            </View>
            <View style={{
              padding: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
            }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, lineHeight: 20 }}>
                {contenidoView.resumen || 'Sin resumen'}
              </Text>
            </View>
          </View>

          {/* Contenido */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Text style={{ fontSize: 18 }}>📄</Text>
              <Text style={styles.formLabel}>Contenido</Text>
            </View>
            <View style={{
              padding: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              maxHeight: 300,
            }}>
              <ScrollView nestedScrollEnabled={true}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, lineHeight: 22 }}>
                  {contenidoView.contenido}
                </Text>
              </ScrollView>
            </View>
          </View>

          {/* Palabras clave y Etiquetas */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            {/* Palabras clave */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Text style={{ fontSize: 18 }}>🔑</Text>
                <Text style={styles.formLabel}>Palabras clave</Text>
              </View>
              <View style={{
                padding: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 12,
              }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 13 }}>
                  {contenidoView.palabras_clave || 'Sin palabras clave'}
                </Text>
              </View>
            </View>

            {/* Etiquetas */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Text style={{ fontSize: 18 }}>🏷️</Text>
                <Text style={styles.formLabel}>Etiquetas</Text>
              </View>
              <View style={{
                padding: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 12,
              }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 13 }}>
                  {contenidoView.etiquetas || 'Sin etiquetas'}
                </Text>
              </View>
            </View>
          </View>

          {/* Prioridad y Estado */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            {/* Prioridad */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Text style={{ fontSize: 18 }}>🚩</Text>
                <Text style={styles.formLabel}>Prioridad</Text>
              </View>
              <View style={{
                padding: 14,
                backgroundColor: `${PRIORITY_LABELS[contenidoView.prioridad]?.color || '#666'}22`,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: PRIORITY_LABELS[contenidoView.prioridad]?.color || '#666',
              }}>
                <Text style={{ 
                  color: PRIORITY_LABELS[contenidoView.prioridad]?.color || '#999',
                  fontSize: 14, 
                  fontWeight: '700' 
                }}>
                  {PRIORITY_LABELS[contenidoView.prioridad]?.label || `Prioridad ${contenidoView.prioridad}`}
                </Text>
              </View>
            </View>

            {/* Estado */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Text style={{ fontSize: 18 }}>📊</Text>
                <Text style={styles.formLabel}>Estado</Text>
              </View>
              <View style={{
                padding: 14,
                backgroundColor: (() => {
                  const colors = {
                    borrador: '#9ca3af22',
                    revision: '#fbbf2422',
                    activo: '#10b98122',
                    inactivo: '#ef444422',
                    archivado: '#6b728022',
                  };
                  return colors[contenidoView.estado] || 'rgba(255, 255, 255, 0.1)';
                })(),
                borderRadius: 12,
                borderWidth: 2,
                borderColor: (() => {
                  const colors = {
                    borrador: '#9ca3af',
                    revision: '#fbbf24',
                    activo: '#10b981',
                    inactivo: '#ef4444',
                    archivado: '#6b7280',
                  };
                  return colors[contenidoView.estado] || '#666';
                })(),
              }}>
                <Text style={{ 
                  color: (() => {
                    const colors = {
                      borrador: '#9ca3af',
                      revision: '#fbbf24',
                      activo: '#10b981',
                      inactivo: '#ef4444',
                      archivado: '#6b7280',
                    };
                    return colors[contenidoView.estado] || '#999';
                  })(),
                  fontSize: 14, 
                  fontWeight: '700',
                  textTransform: 'capitalize'
                }}>
                  {contenidoView.estado}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer */}
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
                backgroundColor: '#667eea',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                shadowColor: '#667eea',
                shadowOpacity: 0.6,
                shadowRadius: 12,
                elevation: 10,
              }}
              onPress={cerrarModalView}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 18 }}>✅</Text>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      )}
    </View>
  </View>
</Modal>

      {/* 🔥 NUEVO: Notificación de éxito flotante */}
      {showSuccessNotification && (
        <View style={{
          position: 'absolute',
          top: 80,
          right: 20,
          backgroundColor: '#10b981',
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderRadius: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          shadowColor: '#10b981',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.6,
          shadowRadius: 16,
          elevation: 12,
          zIndex: 9999,
          minWidth: 300,
        }}>
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 24 }}>✅</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              color: 'white',
              fontWeight: '700',
              fontSize: 15,
              letterSpacing: 0.3,
            }}>
              {successMessage}
            </Text>
            <Text style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 11,
              marginTop: 2,
            }}>
              Se cerró automáticamente
            </Text>
          </View>
        </View>
      )}
      </View>
    </View>
  );
};

export default GestionContenidoPage;
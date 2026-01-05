import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
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
import AdminSidebar from '../../components/Sidebar/sidebarAdmin';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';
import GestionContenidoCard from '../../components/SuperAdministrador/GestionContenidoCard';
import { styles } from '../../styles/GestionContenidoStyles';

const ESTADOS = ['borrador', 'revision', 'activo', 'inactivo', 'archivado'];

// 🔥 NUEVO: Información de prioridades
const PRIORITY_LABELS = {
  10: { label: '🔴 Crítico', desc: 'Máxima prioridad', color: '#ef4444' },
  9: { label: '🔴 Muy Alto', desc: 'Prioridad muy alta', color: '#f97316' },
  8: { label: '🟠 Alto', desc: 'Alta prioridad', color: '#f59e0b' },
  7: { label: '🟠 Moderado+', desc: 'Prioridad elevada', color: '#eab308' },
  6: { label: '🟡 Moderado', desc: 'Prioridad media-alta', color: '#84cc16' },
  5: { label: '🟡 Normal', desc: 'Prioridad estándar', color: '#22c55e' },
  4: { label: '🟢 Bajo', desc: 'Prioridad baja', color: '#10b981' },
  3: { label: '🟢 Muy Bajo', desc: 'Prioridad muy baja', color: '#14b8a6' },
  2: { label: '🔵 Mínimo', desc: 'Prioridad mínima', color: '#06b6d4' },
  1: { label: '🔵 Opcional', desc: 'Información complementaria', color: '#0ea5e9' }
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
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [contenidoAEliminar, setContenidoAEliminar] = useState(null);
  const [modalDuplicadoVisible, setModalDuplicadoVisible] = useState(false);
  const [contenidoDuplicado, setContenidoDuplicado] = useState(null);
  const [showPickerInicio, setShowPickerInicio] = useState(false);
  const [showPickerFin, setShowPickerFin] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
    estado: 'borrador',
    fecha_vigencia_inicio: null,
    fecha_vigencia_fin: null
  });

  // 🔥 NUEVO: Componente de notificación de éxito
  const SuccessNotification = ({ message, onClose }) => {
    if (!message) return null;

    return (
      <View style={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 9999,
        backgroundColor: 'rgba(16, 185, 129, 0.95)',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#10b981',
        shadowOpacity: 0.5,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 10,
        maxWidth: 400,
      }}>
        <View style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 20 }}>✅</Text>
        </View>
        <Text style={{
          flex: 1,
          color: 'white',
          fontWeight: '700',
          fontSize: 14,
        }}>
          {message}
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  };



  const [errores, setErrores] = useState({
    id_categoria: '',
    titulo: '',
    contenido: '',
    resumen: '',
    palabras_clave: '',
    etiquetas: '',
    prioridad: '',
    estado: '',
    fecha_vigencia_inicio: '',
    fecha_vigencia_fin: ''
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
          estado: contenido.estado,
          fecha_vigencia_inicio: contenido.fecha_vigencia_inicio || null,
          fecha_vigencia_fin: contenido.fecha_vigencia_fin || null
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
        estado: 'borrador',
        fecha_vigencia_inicio: null,
        fecha_vigencia_fin: null
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

    setFormData({
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
      estado: 'borrador',
      fecha_vigencia_inicio: null,
      fecha_vigencia_fin: null
    });

    setErrores({
      id_categoria: '',
      titulo: '',
      contenido: '',
      resumen: '',
      palabras_clave: '',
      etiquetas: '',
      prioridad: '',
      estado: '',
      fecha_vigencia_inicio: '',
      fecha_vigencia_fin: ''
    });
  };

  const guardarContenido = async () => {
    console.log('🚀 ========== INICIO guardarContenido ==========');

    // 🔥 FUNCIÓN DE VALIDACIÓN
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

      if (!formData.id_categoria) {
        nuevosErrores.id_categoria = '⚠️ Debes seleccionar una categoría';
        hayErrores = true;
      }

      if (!formData.titulo || formData.titulo.trim() === '') {
        nuevosErrores.titulo = '⚠️ El título es obligatorio';
        hayErrores = true;
      } else if (formData.titulo.trim().length < 5) {
        nuevosErrores.titulo = `⚠️ El título debe tener al menos 5 caracteres (actual: ${formData.titulo.trim().length})`;
        hayErrores = true;
      }

      if (!formData.contenido || formData.contenido.trim() === '') {
        nuevosErrores.contenido = '⚠️ El contenido es obligatorio';
        hayErrores = true;
      } else if (formData.contenido.trim().length < 50) {
        nuevosErrores.contenido = `⚠️ El contenido debe tener al menos 50 caracteres (actual: ${formData.contenido.trim().length})`;
        hayErrores = true;
      }

      if (!formData.resumen || formData.resumen.trim() === '') {
        nuevosErrores.resumen = '⚠️ El resumen es obligatorio';
        hayErrores = true;
      } else if (formData.resumen.trim().length < 10) {
        nuevosErrores.resumen = `⚠️ El resumen debe tener al menos 10 caracteres (actual: ${formData.resumen.trim().length})`;
        hayErrores = true;
      }

      if (!formData.palabras_clave || formData.palabras_clave.trim() === '') {
        nuevosErrores.palabras_clave = '⚠️ Las palabras clave son obligatorias';
        hayErrores = true;
      }

      if (!formData.etiquetas || formData.etiquetas.trim() === '') {
        nuevosErrores.etiquetas = '⚠️ Las etiquetas son obligatorias';
        hayErrores = true;
      }

      if (!formData.prioridad || formData.prioridad < 1 || formData.prioridad > 10) {
        nuevosErrores.prioridad = '⚠️ Selecciona una prioridad válida (1-10)';
        hayErrores = true;
      }

      if (!formData.estado) {
        nuevosErrores.estado = '⚠️ Debes seleccionar un estado';
        hayErrores = true;
      }

      if (formData.fecha_vigencia_inicio && !formData.fecha_vigencia_fin) {
        nuevosErrores.fecha_vigencia_fin = '⚠️ Si defines fecha de inicio, debes definir fecha de fin';
        hayErrores = true;
      }

      if (!formData.fecha_vigencia_inicio && formData.fecha_vigencia_fin) {
        nuevosErrores.fecha_vigencia_inicio = '⚠️ Si defines fecha de fin, debes definir fecha de inicio';
        hayErrores = true;
      }

      if (formData.fecha_vigencia_inicio && formData.fecha_vigencia_fin) {
        const inicio = new Date(formData.fecha_vigencia_inicio);
        const fin = new Date(formData.fecha_vigencia_fin);

        if (fin < inicio) {
          nuevosErrores.fecha_vigencia_fin = '⚠️ La fecha de fin no puede ser anterior a la fecha de inicio';
          hayErrores = true;
        }
      }

      setErrores(nuevosErrores);
      return !hayErrores;
    };

    const detectarContenidoSimilar = () => {
      const tituloNormalizado = formData.titulo.toLowerCase().trim();
      const contenidoNormalizado = formData.contenido.toLowerCase().trim();

      const similares = contenidos.filter(c => {
        if (editando && c.id_contenido === formData.id_contenido) {
          return false;
        }

        const tituloExistente = c.titulo.toLowerCase().trim();
        const contenidoExistente = c.contenido.toLowerCase().trim();

        if (tituloNormalizado === tituloExistente) {
          return true;
        }

        const fragmentoNuevo = contenidoNormalizado.substring(0, 200);
        const fragmentoExistente = contenidoExistente.substring(0, 200);

        if (fragmentoNuevo === fragmentoExistente) {
          return true;
        }

        const palabrasTituloNuevo = tituloNormalizado.split(' ');
        const palabrasTituloExistente = tituloExistente.split(' ');
        const coincidencias = palabrasTituloNuevo.filter(palabra =>
          palabrasTituloExistente.includes(palabra)
        ).length;

        const porcentajeSimilitud = coincidencias / Math.max(palabrasTituloNuevo.length, palabrasTituloExistente.length);

        if (porcentajeSimilitud > 0.8) {
          return true;
        }

        return false;
      });

      return similares;
    };

    // 🔥 FUNCIÓN INTERNA para el guardado real
    const guardarContenidoReal = async () => {
      try {
        const categoriaSeleccionada = categorias.find(
          (cat) => Number(cat.id_categoria) === Number(formData.id_categoria)
        );

        if (!categoriaSeleccionada) {
          Alert.alert('Error', 'La categoría seleccionada no existe o no se pudo cargar');
          return;
        }

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
          estado: formData.estado,
          fecha_vigencia_inicio: formData.fecha_vigencia_inicio || null,
          fecha_vigencia_fin: formData.fecha_vigencia_fin || null
        };

        console.log('📤 Datos a enviar:', JSON.stringify(dataToSend, null, 2));

        if (editando) {
          console.log('✏️ Modo EDICIÓN - ID:', formData.id_contenido);
          await contenidoService.update(formData.id_contenido, dataToSend);
          mostrarNotificacionExito('Contenido actualizado correctamente');
        } else {
          console.log('➕ Modo CREACIÓN');
          await contenidoService.create(dataToSend);
          mostrarNotificacionExito('Contenido creado correctamente');
        }

        console.log('🔄 Cerrando modal y recargando...');
        cerrarModal();
        await cargarContenidos();
        console.log('Contenidos recargados');

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

    // 🔥 NUEVO: Detectar contenido duplicado/similar
    const similares = detectarContenidoSimilar();
    if (similares.length > 0) {
      setContenidoDuplicado(similares[0]);
      setModalDuplicadoVisible(true);
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
  const eliminarContenido = (id) => {
    console.log('🗑️ Abriendo modal de eliminación para ID:', id);
    setContenidoAEliminar(id);
    setModalEliminarVisible(true);
  };

  const confirmarEliminacion = async () => {
    console.log('✅ Confirmando eliminación del ID:', contenidoAEliminar);

    try {
      const resultado = await contenidoService.softDelete(contenidoAEliminar);
      console.log('✅ Contenido eliminado:', resultado);

      mostrarNotificacionExito('🗑️ Contenido eliminado correctamente');

      setModalEliminarVisible(false);
      setContenidoAEliminar(null);

      await cargarContenidos();
    } catch (error) {
      console.error('❌ Error eliminando:', error);
      setModalEliminarVisible(false);
      Alert.alert('Error', 'No se pudo eliminar el contenido');
    }
  };

  if (loading) {
    return (
      <View style={contentStyles.wrapper}>
        <AdminSidebar isOpen={sidebarOpen} />
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
      <AdminSidebar
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
                {/* 🔥 NUEVO: Botón Actualizar Vigencias */}
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      setLoading(true);

                      const result = await contenidoService.actualizarVigencias();

                      mostrarNotificacionExito(
                        `✅ Vigencias actualizadas: ${result.actualizados} de ${result.total_revisados} contenidos`
                      );
                      await cargarContenidos();

                    } catch (error) {
                      console.error('❌ Error actualizando vigencias:', error);
                      mostrarNotificacionExito('❌ Error al actualizar vigencias');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(52, 152, 219, 0.4)',
                    marginTop: 8,
                  }}
                >
                  <Ionicons name="sync" size={18} color="#3498db" />
                  <Text style={{ color: '#3498db', fontWeight: '600', fontSize: 14 }}>
                    🔄 Actualizar Vigencias
                  </Text>
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
                      onDelete={eliminarContenido}
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
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
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
                {/* ============ VIGENCIA TEMPORAL ============ */}
                <View style={{ marginBottom: 20, marginTop: 10 }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 16,
                    paddingBottom: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: 'rgba(255, 255, 255, 0.1)'
                  }}>
                    <Text style={{ fontSize: 20 }}>📅</Text>
                    <Text style={{
                      color: 'white',
                      fontSize: 16,
                      fontWeight: '700',
                      letterSpacing: 0.5
                    }}>
                      Vigencia Temporal
                    </Text>
                  </View>

                  {/* Info de vigencia automática */}
                  <View style={{
                    padding: 14,
                    marginBottom: 16,
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderRadius: 10,
                    borderLeftWidth: 3,
                    borderLeftColor: '#3498db',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Text style={{ fontSize: 16 }}>ℹ️</Text>
                      <Text style={{ color: '#3498db', fontWeight: '700', fontSize: 13 }}>
                        Estado automático por vigencia
                      </Text>
                    </View>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, lineHeight: 18 }}>
                      • Antes de la fecha de inicio → <Text style={{ color: '#ef4444', fontWeight: '600' }}>inactivo</Text>{'\n'}
                      • Durante el rango de fechas → <Text style={{ color: '#10b981', fontWeight: '600' }}>activo</Text>{'\n'}
                      • Después de la fecha de fin → <Text style={{ color: '#ef4444', fontWeight: '600' }}>inactivo</Text>
                    </Text>
                  </View>

                  {/* Fecha de inicio */}
                  <View style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Text style={{ fontSize: 16 }}>📆</Text>
                      <Text style={styles.formLabel}>Fecha de inicio de vigencia</Text>
                    </View>

                    {Platform.OS === 'web' ? (
                      // 🌐 VERSIÓN WEB - Input nativo HTML
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderWidth: 1,
                        borderColor: formData.fecha_vigencia_inicio
                          ? '#3498db'
                          : 'rgba(255, 255, 255, 0.15)',
                      }}>
                        <Ionicons name="calendar" size={20} color={formData.fecha_vigencia_inicio ? '#3498db' : 'rgba(255, 255, 255, 0.4)'} />

                        <input
                          type="date"
                          value={formData.fecha_vigencia_inicio || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData({ ...formData, fecha_vigencia_inicio: value || null });
                            if (value) setErrores({ ...errores, fecha_vigencia_inicio: '' });
                          }}
                          style={{
                            flex: 1,
                            color: 'white',
                            fontSize: 15,
                            backgroundColor: 'transparent',
                            border: 'none',
                            outline: 'none',
                            fontWeight: formData.fecha_vigencia_inicio ? '600' : '400',
                            colorScheme: 'dark',
                          }}
                        />

                        {formData.fecha_vigencia_inicio && (
                          <TouchableOpacity
                            onPress={() => {
                              setFormData({ ...formData, fecha_vigencia_inicio: null });
                              setErrores({ ...errores, fecha_vigencia_inicio: '' });
                            }}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              backgroundColor: 'rgba(239, 68, 68, 0.2)',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Ionicons name="close" size={18} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : (
                      // 📱 VERSIÓN MÓVIL - TouchableOpacity + DateTimePicker
                      <>
                        <TouchableOpacity
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 16,
                            borderRadius: 12,
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderWidth: 1,
                            borderColor: formData.fecha_vigencia_inicio
                              ? '#3498db'
                              : 'rgba(255, 255, 255, 0.15)',
                          }}
                          onPress={() => setShowPickerInicio(true)}
                          activeOpacity={0.7}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={{
                              color: formData.fecha_vigencia_inicio
                                ? 'white'
                                : 'rgba(255, 255, 255, 0.4)',
                              fontSize: 15,
                              fontWeight: formData.fecha_vigencia_inicio ? '600' : '400'
                            }}>
                              {formData.fecha_vigencia_inicio
                                ? new Date(formData.fecha_vigencia_inicio).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                                : 'Seleccionar fecha de inicio'}
                            </Text>
                          </View>

                          {formData.fecha_vigencia_inicio ? (
                            <TouchableOpacity
                              onPress={() => {
                                setFormData({ ...formData, fecha_vigencia_inicio: null });
                                setErrores({ ...errores, fecha_vigencia_inicio: '' });
                              }}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginLeft: 8
                              }}
                            >
                              <Ionicons name="close" size={18} color="#ef4444" />
                            </TouchableOpacity>
                          ) : (
                            <Ionicons name="calendar" size={20} color="rgba(255, 255, 255, 0.4)" />
                          )}
                        </TouchableOpacity>

                        {showPickerInicio && (
                          <DateTimePicker
                            value={formData.fecha_vigencia_inicio
                              ? new Date(formData.fecha_vigencia_inicio)
                              : new Date()}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                              setShowPickerInicio(false);
                              if (selectedDate) {
                                const dateStr = selectedDate.toISOString().split('T')[0];
                                setFormData({ ...formData, fecha_vigencia_inicio: dateStr });
                                setErrores({ ...errores, fecha_vigencia_inicio: '' });
                              }
                            }}
                          />
                        )}
                      </>
                    )}

                    {errores.fecha_vigencia_inicio && (
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
                          {errores.fecha_vigencia_inicio}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Fecha de fin */}
                  <View style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Text style={{ fontSize: 16 }}>📆</Text>
                      <Text style={styles.formLabel}>Fecha de fin de vigencia</Text>
                    </View>

                    {Platform.OS === 'web' ? (
                      // 🌐 VERSIÓN WEB - Input nativo HTML
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderWidth: 1,
                        borderColor: formData.fecha_vigencia_fin
                          ? '#3498db'
                          : 'rgba(255, 255, 255, 0.15)',
                      }}>
                        <Ionicons name="calendar" size={20} color={formData.fecha_vigencia_fin ? '#3498db' : 'rgba(255, 255, 255, 0.4)'} />

                        <input
                          type="date"
                          value={formData.fecha_vigencia_fin || ''}
                          min={formData.fecha_vigencia_inicio || undefined}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData({ ...formData, fecha_vigencia_fin: value || null });
                            if (value) setErrores({ ...errores, fecha_vigencia_fin: '' });
                          }}
                          style={{
                            flex: 1,
                            color: 'white',
                            fontSize: 15,
                            backgroundColor: 'transparent',
                            border: 'none',
                            outline: 'none',
                            fontWeight: formData.fecha_vigencia_fin ? '600' : '400',
                            colorScheme: 'dark',
                          }}
                        />

                        {formData.fecha_vigencia_fin && (
                          <TouchableOpacity
                            onPress={() => {
                              setFormData({ ...formData, fecha_vigencia_fin: null });
                              setErrores({ ...errores, fecha_vigencia_fin: '' });
                            }}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              backgroundColor: 'rgba(239, 68, 68, 0.2)',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Ionicons name="close" size={18} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : (
                      // 📱 VERSIÓN MÓVIL - TouchableOpacity + DateTimePicker
                      <>
                        <TouchableOpacity
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 16,
                            borderRadius: 12,
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderWidth: 1,
                            borderColor: formData.fecha_vigencia_fin
                              ? '#3498db'
                              : 'rgba(255, 255, 255, 0.15)',
                          }}
                          onPress={() => setShowPickerFin(true)}
                          activeOpacity={0.7}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={{
                              color: formData.fecha_vigencia_fin
                                ? 'white'
                                : 'rgba(255, 255, 255, 0.4)',
                              fontSize: 15,
                              fontWeight: formData.fecha_vigencia_fin ? '600' : '400'
                            }}>
                              {formData.fecha_vigencia_fin
                                ? new Date(formData.fecha_vigencia_fin).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                                : 'Seleccionar fecha de fin'}
                            </Text>
                          </View>

                          {formData.fecha_vigencia_fin ? (
                            <TouchableOpacity
                              onPress={() => {
                                setFormData({ ...formData, fecha_vigencia_fin: null });
                                setErrores({ ...errores, fecha_vigencia_fin: '' });
                              }}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginLeft: 8
                              }}
                            >
                              <Ionicons name="close" size={18} color="#ef4444" />
                            </TouchableOpacity>
                          ) : (
                            <Ionicons name="calendar" size={20} color="rgba(255, 255, 255, 0.4)" />
                          )}
                        </TouchableOpacity>

                        {showPickerFin && (
                          <DateTimePicker
                            value={formData.fecha_vigencia_fin
                              ? new Date(formData.fecha_vigencia_fin)
                              : new Date()}
                            mode="date"
                            display="default"
                            minimumDate={formData.fecha_vigencia_inicio
                              ? new Date(formData.fecha_vigencia_inicio)
                              : new Date()}
                            onChange={(event, selectedDate) => {
                              setShowPickerFin(false);
                              if (selectedDate) {
                                const dateStr = selectedDate.toISOString().split('T')[0];
                                setFormData({ ...formData, fecha_vigencia_fin: dateStr });
                                setErrores({ ...errores, fecha_vigencia_fin: '' });
                              }
                            }}
                          />
                        )}
                      </>
                    )}

                    {errores.fecha_vigencia_fin && (
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
                          {errores.fecha_vigencia_fin}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Vista previa del rango */}
                  {formData.fecha_vigencia_inicio && formData.fecha_vigencia_fin && (
                    <View style={{
                      padding: 14,
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: 'rgba(16, 185, 129, 0.3)',
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Text style={{ fontSize: 16 }}>✅</Text>
                        <Text style={{ color: '#10b981', fontWeight: '700', fontSize: 13 }}>
                          Rango de vigencia configurado
                        </Text>
                      </View>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}>
                        {new Date(formData.fecha_vigencia_inicio + 'T00:00:00').toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                        {' → '}
                        {new Date(formData.fecha_vigencia_fin + 'T00:00:00').toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                      <Text style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: 11,
                        marginTop: 4
                      }}>
                        {(() => {
                          const inicio = new Date(formData.fecha_vigencia_inicio + 'T00:00:00');
                          const fin = new Date(formData.fecha_vigencia_fin + 'T00:00:00');
                          const dias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
                          return `Duración: ${dias} día${dias !== 1 ? 's' : ''}`;
                        })()}
                      </Text>
                    </View>
                  )}
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
        {/* 🔥 NUEVO: Modal de contenido duplicado */}
        <Modal
          visible={modalDuplicadoVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setModalDuplicadoVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxWidth: 600 }]}>

              {/* Header */}
              <View style={{
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(251, 191, 36, 0.2)',
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: 'rgba(251, 191, 36, 0.3)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{ fontSize: 28 }}>⚠️</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: '900', color: '#fbbf24' }}>
                      Contenido Similar Detectado
                    </Text>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, marginTop: 2 }}>
                      Ya existe un contenido muy parecido
                    </Text>
                  </View>
                </View>
              </View>

              {/* Contenido */}
              {contenidoDuplicado && (
                <View style={{ padding: 20 }}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, marginBottom: 16 }}>
                    Se encontró un contenido similar que ya existe en el sistema:
                  </Text>

                  <View style={{
                    padding: 16,
                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(251, 191, 36, 0.3)',
                    marginBottom: 20,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Text style={{ fontSize: 16 }}>📄</Text>
                      <Text style={{ color: '#fbbf24', fontWeight: '700', fontSize: 14 }}>
                        Contenido Existente
                      </Text>
                    </View>

                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 15, marginBottom: 6 }}>
                      {contenidoDuplicado.titulo}
                    </Text>

                    <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, marginBottom: 8 }} numberOfLines={3}>
                      {contenidoDuplicado.contenido}
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                      <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                      }}>
                        <Text style={{ color: '#667eea', fontSize: 11, fontWeight: '600' }}>
                          {categorias.find(c => c.id_categoria === contenidoDuplicado.id_categoria)?.nombre || 'N/A'}
                        </Text>
                      </View>

                      <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor: (() => {
                          const colors = {
                            activo: 'rgba(16, 185, 129, 0.2)',
                            borrador: 'rgba(156, 163, 175, 0.2)',
                            revision: 'rgba(251, 191, 36, 0.2)',
                          };
                          return colors[contenidoDuplicado.estado] || 'rgba(255, 255, 255, 0.1)';
                        })(),
                      }}>
                        <Text style={{
                          color: (() => {
                            const colors = {
                              activo: '#10b981',
                              borrador: '#9ca3af',
                              revision: '#fbbf24',
                            };
                            return colors[contenidoDuplicado.estado] || '#999';
                          })(),
                          fontSize: 11,
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {contenidoDuplicado.estado}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 13, marginBottom: 16 }}>
                    ¿Qué deseas hacer?
                  </Text>

                  <View style={{ gap: 10 }}>
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                        borderWidth: 1,
                        borderColor: 'rgba(102, 126, 234, 0.4)',
                      }}
                      onPress={() => {
                        setModalDuplicadoVisible(false);
                        abrirModal(contenidoDuplicado);
                      }}
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
                        <Text style={{ fontSize: 20 }}>✏️</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#667eea', fontWeight: '700', fontSize: 14 }}>
                          Actualizar contenido existente
                        </Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11, marginTop: 2 }}>
                          Editar el contenido que ya existe
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        borderWidth: 1,
                        borderColor: 'rgba(239, 68, 68, 0.4)',
                      }}
                      onPress={() => {
                        setModalDuplicadoVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        backgroundColor: '#ef4444',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <Text style={{ fontSize: 20 }}>❌</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 14 }}>
                          Cancelar y revisar
                        </Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11, marginTop: 2 }}>
                          Volver a editar mi contenido
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* 🔥 Modal de confirmación de eliminación */}
        <Modal
          visible={modalEliminarVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setModalEliminarVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxWidth: 500 }]}>

              <View style={{
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(239, 68, 68, 0.2)',
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: 'rgba(239, 68, 68, 0.3)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{ fontSize: 28 }}>⚠️</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 20, fontWeight: '900', color: '#ef4444' }}>
                      Eliminar Contenido
                    </Text>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginTop: 2 }}>
                      Esta acción es reversible
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ padding: 24 }}>
                <Text style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: 15,
                  textAlign: 'center',
                  marginBottom: 8,
                  lineHeight: 22
                }}>
                  ¿Estás seguro de que deseas eliminar este contenido?
                </Text>

                <View style={{
                  padding: 14,
                  backgroundColor: 'rgba(251, 191, 36, 0.1)',
                  borderRadius: 12,
                  borderLeftWidth: 3,
                  borderLeftColor: '#fbbf24',
                  marginBottom: 24,
                }}>
                  <Text style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: 13,
                    textAlign: 'center',
                    lineHeight: 20
                  }}>
                    ℹ️ Esta acción eliminará el contenido de manera permanente y sin posibilidad de recuperación.
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      borderRadius: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                    onPress={() => {
                      setModalEliminarVisible(false);
                      setContenidoAEliminar(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 16 }}>✖️</Text>
                    <Text style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: '700',
                      fontSize: 15
                    }}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      borderRadius: 12,
                      backgroundColor: '#ef4444',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      shadowColor: '#ef4444',
                      shadowOpacity: 0.6,
                      shadowRadius: 12,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 8,
                    }}
                    onPress={confirmarEliminacion}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 16 }}>🗑️</Text>
                    <Text style={{
                      color: 'white',
                      fontWeight: '700',
                      fontSize: 15,
                      letterSpacing: 0.5
                    }}>
                      Eliminar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* 🔥 Notificación flotante mejorada */}
        {showSuccessNotification && (
          <View style={{
            position: 'absolute',
            top: 80,
            right: 20,
            backgroundColor: successMessage.includes('❌') ? '#ef4444' : '#10b981',
            paddingHorizontal: 24,
            paddingVertical: 16,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            shadowColor: successMessage.includes('❌') ? '#ef4444' : '#10b981',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.6,
            shadowRadius: 16,
            elevation: 12,
            zIndex: 9999,
            minWidth: 300,
            maxWidth: 400,
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 24 }}>
                {successMessage.includes('❌') ? '❌' : '✅'}
              </Text>
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
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default GestionContenidoPage;
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
import SuperAdminSidebar from '../../components/Sidebar/sidebarSuperAdmin';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';
import GestionContenidoCard from '../../components/SuperAdministrador/GestionContenidoCard';
import { styles } from '../../styles/GestionContenidoStyles';

const ESTADOS = ['activo', 'inactivo'];

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


const isWeb = Platform.OS === 'web';

// ============ COMPONENTE TOOLTIP ============
function TooltipIcon({ text }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  const isMobile = Platform.OS !== 'web';
  const { width } = Dimensions.get('window');

  const handlePress = () => {
    if (isMobile && buttonRef.current) {
      buttonRef.current.measure((fx, fy, width, height, px, py) => {
        setPosition({ x: px, y: py });
        setShowTooltip(true);
      });
    } else {
      setShowTooltip(!showTooltip);
    }
  };

  return (
    <View style={{ position: 'relative', marginLeft: 6 }}>
      <TouchableOpacity
        ref={buttonRef}
        onPress={handlePress}
        onMouseEnter={() => !isMobile && setShowTooltip(true)}
        onMouseLeave={() => !isMobile && setShowTooltip(false)}
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: 'rgba(102, 126, 234, 0.2)',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: 'rgba(102, 126, 234, 0.4)',
        }}
      >
        <Text style={{ color: '#667eea', fontSize: 12, fontWeight: 'bold' }}>?</Text>
      </TouchableOpacity>

      {/* Tooltip para WEB */}
      {showTooltip && !isMobile && (
        <View style={{
          position: 'absolute',
          top: -5,
          left: 25,
          minWidth: 200,
          maxWidth: 280,
          backgroundColor: '#1a1a2e',
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: 'rgba(102, 126, 234, 0.3)',
          zIndex: 1000,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}>
          <View style={{
            position: 'absolute',
            top: 8,
            left: -6,
            width: 12,
            height: 12,
            backgroundColor: '#1a1a2e',
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderColor: 'rgba(102, 126, 234, 0.3)',
            transform: [{ rotate: '-45deg' }],
          }} />

          <Text style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: 12,
            lineHeight: 18,
          }}>
            {text}
          </Text>
        </View>
      )}

      {/* Tooltip para MÓVIL */}
      {showTooltip && isMobile && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTooltip(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
            activeOpacity={1}
            onPress={() => setShowTooltip(false)}
          >
            <View style={{
              position: 'absolute',
              top: position.y + 25,
              left: Math.min(position.x - 50, width - 270),
              width: 250,
              backgroundColor: '#1a1a2e',
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(102, 126, 234, 0.3)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 10,
            }}>
              <View style={{
                position: 'absolute',
                top: -6,
                left: Math.max(50, position.x - Math.min(position.x - 50, width - 270)),
                width: 12,
                height: 12,
                backgroundColor: '#1a1a2e',
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderColor: 'rgba(102, 126, 234, 0.3)',
                transform: [{ rotate: '45deg' }],
              }} />

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
                paddingBottom: 10,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(102, 126, 234, 0.2)',
              }}>
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: 'rgba(102, 126, 234, 0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 14 }}>💡</Text>
                </View>
                <Text style={{
                  color: '#667eea',
                  fontSize: 13,
                  fontWeight: '700',
                  flex: 1,
                }}>
                  Información
                </Text>
                <TouchableOpacity
                  onPress={() => setShowTooltip(false)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="close" size={14} color="#ef4444" />
                </TouchableOpacity>
              </View>

              <Text style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: 12,
                lineHeight: 18,
              }}>
                {text}
              </Text>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalViewVisible, setModalViewVisible] = useState(false);
  const [contenidoView, setContenidoView] = useState(null);
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [contenidoAEliminar, setContenidoAEliminar] = useState(null);
  const [showPickerInicio, setShowPickerInicio] = useState(false);
  const [showPickerFin, setShowPickerFin] = useState(false);
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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
    estado: 'activo',
    fecha_vigencia_inicio: null,
    fecha_vigencia_fin: null
  });

  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [modalDuplicadoVisible, setModalDuplicadoVisible] = useState(false);
  const [contenidoDuplicado, setContenidoDuplicado] = useState(null);

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

  const mostrarNotificacionExito = (mensaje, tipo = 'success') => {
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

  const safeNorm = (s) => {
    const txt = (s ?? '').toString().toLowerCase().trim();
    try {
      return txt.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    } catch {
      return txt;
    }
  };

  const filteredAgentes = agentes.filter((agente) => {
    const search = safeNorm(searchAgente);
    const nombre = safeNorm(agente.nombre_agente ?? agente.nombre ?? agente.nombreAgente);
    return !search || nombre.includes(search);
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
        id_agente: '',
        id_categoria: '',
        id_departamento: '',
        titulo: '',
        contenido: '',
        resumen: '',
        palabras_clave: '',
        etiquetas: '',
        prioridad: 5,
        estado: 'activo',
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
    setSearchCategoria(''); // 🔥 Limpiar búsqueda de categorías

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
      estado: 'activo',
      // 🔥 NUEVOS CAMPOS
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
      // 🔥 NUEVOS CAMPOS
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

      // Estado se maneja automáticamente por vigencia - no requiere validación

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
        // 🔥 Si estamos editando, excluir el contenido actual
        if (editando && c.id_contenido === formData.id_contenido) {
          return false;
        }

        const tituloExistente = c.titulo.toLowerCase().trim();
        const contenidoExistente = c.contenido.toLowerCase().trim();

        // 🔥 1. COINCIDENCIA EXACTA DE TÍTULO (muy probable que sea duplicado)
        if (tituloNormalizado === tituloExistente) {
          return true;
        }

        // 🔥 2. COINCIDENCIA DE PRIMERAS 200 PALABRAS DEL CONTENIDO
        const fragmentoNuevo = contenidoNormalizado.substring(0, 200);
        const fragmentoExistente = contenidoExistente.substring(0, 200);

        if (fragmentoNuevo === fragmentoExistente && fragmentoNuevo.length > 50) {
          return true;
        }

        // 🔥 3. SIMILITUD DE TÍTULO POR PALABRAS (>80% de palabras coinciden)
        const palabrasTituloNuevo = tituloNormalizado.split(/\s+/).filter(p => p.length > 3);
        const palabrasTituloExistente = tituloExistente.split(/\s+/).filter(p => p.length > 3);

        if (palabrasTituloNuevo.length >= 3 && palabrasTituloExistente.length >= 3) {
          const coincidencias = palabrasTituloNuevo.filter(palabra =>
            palabrasTituloExistente.includes(palabra)
          ).length;

          const porcentajeSimilitud = coincidencias / Math.max(palabrasTituloNuevo.length, palabrasTituloExistente.length);

          if (porcentajeSimilitud > 0.8) {
            return true;
          }
        }

        // 🔥 4. SIMILITUD DE CONTENIDO (primeras 500 caracteres con >85% de coincidencia)
        const palabrasContenidoNuevo = contenidoNormalizado.substring(0, 500).split(/\s+/);
        const palabrasContenidoExistente = contenidoExistente.substring(0, 500).split(/\s+/);

        if (palabrasContenidoNuevo.length >= 20 && palabrasContenidoExistente.length >= 20) {
          const coincidenciasContenido = palabrasContenidoNuevo.filter(palabra =>
            palabrasContenidoExistente.includes(palabra) && palabra.length > 3
          ).length;

          const similitudContenido = coincidenciasContenido / Math.max(palabrasContenidoNuevo.length, palabrasContenidoExistente.length);

          if (similitudContenido > 0.85) {
            return true;
          }
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
          // 🔥 NUEVOS CAMPOS
          fecha_vigencia_inicio: formData.fecha_vigencia_inicio || null,
          fecha_vigencia_fin: formData.fecha_vigencia_fin || null
        };

        console.log('📤 Datos a enviar:', JSON.stringify(dataToSend, null, 2));

        if (editando) {
          console.log('✏️ Modo EDICIÓN - ID:', formData.id_contenido);
          await contenidoService.update(formData.id_contenido, dataToSend);
          mostrarNotificacionExito('✅ Contenido actualizado correctamente');
        } else {
          console.log('➕ Modo CREACIÓN');
          await contenidoService.create(dataToSend);
          mostrarNotificacionExito('✅ Contenido creado correctamente');
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

    // 🔥 NUEVO: Detectar contenido duplicado/similar
    const similares = detectarContenidoSimilar();
    if (similares.length > 0) {
      setContenidoDuplicado(similares[0]);
      setModalDuplicadoVisible(true);
      return; // Detener el proceso y mostrar el modal
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

      // Cerrar modal
      setModalEliminarVisible(false);
      setContenidoAEliminar(null);

      // Recargar contenidos
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

      {/* ============ SIDEBAR WEB ============ */}
      {Platform.OS === 'web' && (
        <SuperAdminSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onNavigate={() => setSidebarOpen(false)}
        />
      )}

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
      <View style={contentStyles.mainContent}>
        <View style={styles.container}>
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.scrollContent}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>     Gestión de Contenidos</Text>
              </View>

              {/* ============ FILTROS Y ACCIONES - SIN CARD ============ */}
              <View style={{ marginBottom: 24 }}>

                {/* 1️⃣ Filtros por Estado */}
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 4,
                    paddingVertical: 4,
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  {[
                    { key: '', label: 'Todos', icon: 'apps' },
                    { key: 'activo', label: 'Activo', icon: 'checkmark-circle' },
                    { key: 'inactivo', label: 'Inactivo', icon: 'close-circle' }
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
                </ScrollView>

                {/* 2️⃣ Búsqueda de Agente */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginBottom: 12,
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
                    onChangeText={setSearchAgente}
                  />
                  {searchAgente.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchAgente('')}>
                      <Ionicons name="close-circle" size={16} color="rgba(255, 255, 255, 0.4)" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* 3️⃣ Scroll horizontal de agentes */}
                {Platform.OS === 'web' ? (
                  // 🌐 VERSIÓN WEB - Con drag del mouse
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
                      marginBottom: 16,
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
                ) : (
                  // 📱 VERSIÓN MÓVIL - ScrollView horizontal nativo
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingHorizontal: 16,
                      paddingVertical: 4,
                    }}
                    style={{ marginBottom: 16 }}
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
                        <View key={agente.id_agente} style={{ marginRight: 8 }}>
                          <TouchableOpacity
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
                        </View>
                      ))
                    )}
                  </ScrollView>
                )}

                {/* 4️⃣ Botones de Acción */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {/* Botón Nuevo Contenido */}
                  <TouchableOpacity
                    onPress={() => abrirModal()}
                    style={[styles.btnNuevo, { flex: 1 }]}
                  >
                    <Ionicons name="add-circle" size={22} color="white" />
                    <Text style={styles.btnNuevoText}>Nuevo Contenido</Text>
                  </TouchableOpacity>

                  {/* Botón Actualizar Vigencias */}
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        setLoading(true);
                        const result = await contenidoService.actualizarVigencias();
                        mostrarNotificacionExito(
                          `✅ ${result.actualizados} de ${result.total_revisados} actualizados`
                        );
                        await cargarContenidos();
                      } catch (error) {
                        console.error('Error:', error);
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
                      minWidth: 140,
                    }}
                  >
                    <Ionicons name="sync" size={18} color="#3498db" />
                    <Text style={{ color: '#3498db', fontWeight: '600', fontSize: 13 }}>
                      Actualizar
                    </Text>
                  </TouchableOpacity>
                </View>
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
      </View>

      {/* Modal de creación/edición */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={cerrarModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { marginHorizontal: 20 }]}>

            {/* ============ HEADER DEL MODAL ============ */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: Platform.OS === 'web' ? 16 : 8,
              paddingVertical: Platform.OS === 'web' ? 16 : 12,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(102, 126, 234, 0.2)',
              backgroundColor: 'rgba(102, 126, 234, 0.05)',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
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
                    fontSize: Platform.OS === 'web' ? 22 : 18,
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
                  <TooltipIcon text="Selecciona la categoría a la que pertenece este contenido. La categoría determina cómo se organiza y busca la información." />
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
                        onPress={() => setFormData({ ...formData, id_categoria: Number(categoria.id_categoria) })}
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
                  (cat) => Number(cat.id_categoria) === Number(formData.id_categoria)
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
                  (cat) => Number(cat.id_categoria) === Number(formData.id_categoria)
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
                  <TooltipIcon text="Escribe un título claro y descriptivo (mínimo 5 caracteres). Este será el identificador principal del contenido." />
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
                <TooltipIcon text="Proporciona un resumen breve del contenido (mínimo 10 caracteres). Ayuda a los usuarios a entender rápidamente de qué trata." />
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
                <TooltipIcon text="Escribe el contenido completo y detallado (mínimo 50 caracteres). Esta es la información que el agente utilizará para responder." />
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
                <TooltipIcon text="Ingresa palabras clave separadas por comas. Ayudan a encontrar este contenido más fácilmente en las búsquedas." />
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
                <TooltipIcon text="Agrega etiquetas separadas por comas para clasificar y filtrar el contenido por temas o categorías." />
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
                  <TooltipIcon text="Define la importancia del contenido (1-10). Mayor prioridad significa que este contenido será más relevante en las respuestas del agente." />
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

              {/* ============ INFORMACIÓN DE ESTADO AUTOMÁTICO ============ */}
              <View style={{
                padding: 16,
                marginBottom: 20,
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderRadius: 12,
                borderLeftWidth: 3,
                borderLeftColor: '#3498db',
              }}>

                {/* Mostrar estado actual previsto */}
                <View style={{
                  marginTop: 12,
                  padding: 12,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 8,
                }}>
                  <Text style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: 12,
                    marginBottom: 4
                  }}>
                    Estado actual previsto:
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <View style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: (() => {
                        if (!formData.fecha_vigencia_inicio && !formData.fecha_vigencia_fin) {
                          return '#10b981';
                        }
                        const hoy = new Date().toISOString().split('T')[0];
                        if (formData.fecha_vigencia_inicio && hoy < formData.fecha_vigencia_inicio) {
                          return '#ef4444';
                        }
                        if (formData.fecha_vigencia_fin && hoy > formData.fecha_vigencia_fin) {
                          return '#ef4444';
                        }
                        return '#10b981';
                      })(),
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{ fontSize: 16 }}>
                        {(() => {
                          if (!formData.fecha_vigencia_inicio && !formData.fecha_vigencia_fin) {
                            return '✅';
                          }
                          const hoy = new Date().toISOString().split('T')[0];
                          if (formData.fecha_vigencia_inicio && hoy < formData.fecha_vigencia_inicio) {
                            return '❌';
                          }
                          if (formData.fecha_vigencia_fin && hoy > formData.fecha_vigencia_fin) {
                            return '❌';
                          }
                          return '✅';
                        })()}
                      </Text>
                    </View>
                    <Text style={{
                      color: (() => {
                        if (!formData.fecha_vigencia_inicio && !formData.fecha_vigencia_fin) {
                          return '#10b981';
                        }
                        const hoy = new Date().toISOString().split('T')[0];
                        if (formData.fecha_vigencia_inicio && hoy < formData.fecha_vigencia_inicio) {
                          return '#ef4444';
                        }
                        if (formData.fecha_vigencia_fin && hoy > formData.fecha_vigencia_fin) {
                          return '#ef4444';
                        }
                        return '#10b981';
                      })(),
                      fontWeight: '700',
                      fontSize: 14,
                    }}>
                      {(() => {
                        if (!formData.fecha_vigencia_inicio && !formData.fecha_vigencia_fin) {
                          return 'Activo (sin restricciones)';
                        }
                        const hoy = new Date().toISOString().split('T')[0];
                        if (formData.fecha_vigencia_inicio && hoy < formData.fecha_vigencia_inicio) {
                          return 'Inactivo (aún no comienza)';
                        }
                        if (formData.fecha_vigencia_fin && hoy > formData.fecha_vigencia_fin) {
                          return 'Inactivo (ya finalizó)';
                        }
                        return 'Activo (dentro de vigencia)';
                      })()}
                    </Text>
                  </View>
                </View>
              </View>

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
                    <TooltipIcon text="Opcional: Define desde qué fecha este contenido estará activo. Antes de esta fecha estará inactivo automáticamente." />
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
                    <TooltipIcon text="Opcional: Define hasta qué fecha este contenido estará activo. Después de esta fecha se desactivará automáticamente." />
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

                      <Text style={{ color: '#10b981', fontWeight: '700', fontSize: 13 }}>
                        Rango de vigencia configurado
                      </Text>
                    </View>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}>
                      {/* 🔥 FIX: Agregar 'T00:00:00' para evitar desfase de zona horaria */}
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
                        // 🔥 FIX: Calcular días correctamente
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
                justifyContent: 'space-between',
                gap: 10,
                paddingHorizontal: Platform.OS === 'web' ? 20 : 12,
                paddingVertical: Platform.OS === 'web' ? 20 : 14,
                borderTopWidth: 1,
                borderTopColor: 'rgba(255, 255, 255, 0.1)',
                marginTop: 20,
              }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
                    paddingVertical: 14,
                    borderRadius: 16,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: '#667eea',
                    paddingHorizontal: Platform.OS === 'web' ? 24 : 12,
                    paddingVertical: 14,
                    justifyContent: 'center',
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
          <View style={[styles.modalContent, { maxWidth: 800, marginHorizontal: 20 }]}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: Platform.OS === 'web' ? 16 : 8,
              paddingVertical: Platform.OS === 'web' ? 16 : 12,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(102, 126, 234, 0.2)',
              backgroundColor: 'rgba(102, 126, 234, 0.05)',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
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
                  <Text style={{ fontSize: Platform.OS === 'web' ? 28 : 22 }}>👁️</Text>
                </View>
                <View>
                  <Text style={{ fontSize: Platform.OS === 'web' ? 22 : 18, fontWeight: '900', color: '#fff' }}>
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
                      backgroundColor: contenidoView.estado === 'activo'
                        ? '#10b98122'
                        : '#ef444422',
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: contenidoView.estado === 'activo'
                        ? '#10b981'
                        : '#ef4444',
                    }}>
                      <Text style={{
                        color: contenidoView.estado === 'activo'
                          ? '#10b981'
                          : '#ef4444',
                        fontSize: 14,
                        fontWeight: '700',
                        textTransform: 'capitalize'
                      }}>
                        {contenidoView.estado}
                      </Text>
                    </View>
                  </View>
                </View>

              </ScrollView>
            )}


            {/* ============ FOOTER DEL MODAL ============ */}
            {contenidoView && (
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: Platform.OS === 'web' ? 16 : 8,
                paddingVertical: Platform.OS === 'web' ? 16 : 12,
                borderTopWidth: 1,
                borderTopColor: 'rgba(255, 255, 255, 0.1)',
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
            )}
          </View>
        </View>
      </Modal>

      {/* 🔥 NUEVO: Modal de contenido duplicado MEJORADO */}
      <Modal
        visible={modalDuplicadoVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalDuplicadoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: 700 }]}>

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
                  width: Platform.OS === 'web' ? 48 : 36,
                  height: Platform.OS === 'web' ? 48 : 36,
                  borderRadius: 14,
                  backgroundColor: 'rgba(251, 191, 36, 0.3)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 28 }}>⚠️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: '#fbbf24' }}>
                    ⚠️ Contenido Similar Detectado
                  </Text>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, marginTop: 2 }}>
                    Evita duplicar información en el sistema
                  </Text>
                </View>
              </View>
            </View>

            {/* Contenido */}
            {contenidoDuplicado && (
              <ScrollView style={{ maxHeight: 600 }}>
                <View style={{ padding: 20 }}>

                  {/* Mensaje principal */}
                  <View style={{
                    padding: 16,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: '#ef4444',
                    marginBottom: 20,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Text style={{ fontSize: 18 }}>🚫</Text>
                      <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 14 }}>
                        No se puede crear contenido duplicado
                      </Text>
                    </View>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 13, lineHeight: 20 }}>
                      Ya existe un contenido muy similar en el sistema. Esto puede causar confusión
                      y respuestas inconsistentes del agente.
                    </Text>
                  </View>

                  {/* Comparación lado a lado */}
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 13, marginBottom: 12, fontWeight: '600' }}>
                      📊 Comparación de contenidos:
                    </Text>

                    <View style={{ gap: 12 }}>
                      {/* Tu contenido nuevo */}
                      <View style={{
                        padding: 16,
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: 'rgba(52, 152, 219, 0.3)',
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <Text style={{ fontSize: 16 }}>📝</Text>
                          <Text style={{ color: '#3498db', fontWeight: '700', fontSize: 13 }}>
                            Tu contenido (nuevo)
                          </Text>
                        </View>
                        <Text style={{ color: 'white', fontWeight: '600', fontSize: 14, marginBottom: 8 }}>
                          {formData.titulo}
                        </Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }} numberOfLines={3}>
                          {formData.contenido.substring(0, 200)}...
                        </Text>
                      </View>

                      {/* Contenido existente */}
                      <View style={{
                        padding: 16,
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: 'rgba(251, 191, 36, 0.3)',
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <Text style={{ fontSize: 16 }}>📄</Text>
                          <Text style={{ color: '#fbbf24', fontWeight: '700', fontSize: 13 }}>
                            Contenido existente en la base de datos
                          </Text>
                        </View>
                        <Text style={{ color: 'white', fontWeight: '600', fontSize: 14, marginBottom: 8 }}>
                          {contenidoDuplicado.titulo}
                        </Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, marginBottom: 10 }} numberOfLines={3}>
                          {contenidoDuplicado.contenido.substring(0, 200)}...
                        </Text>

                        {/* Metadata del contenido existente */}
                        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                          <View style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 6,
                            backgroundColor: 'rgba(102, 126, 234, 0.2)',
                          }}>
                            <Text style={{ color: '#667eea', fontSize: 10, fontWeight: '600' }}>
                              📁 {categorias.find(c => c.id_categoria === contenidoDuplicado.id_categoria)?.nombre || 'N/A'}
                            </Text>
                          </View>

                          <View style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 6,
                            backgroundColor: contenidoDuplicado.estado === 'activo'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'rgba(239, 68, 68, 0.2)',
                          }}>
                            <Text style={{
                              color: contenidoDuplicado.estado === 'activo' ? '#10b981' : '#ef4444',
                              fontSize: 10,
                              fontWeight: '600',
                              textTransform: 'capitalize'
                            }}>
                              📊 {contenidoDuplicado.estado}
                            </Text>
                          </View>

                          <View style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 6,
                            backgroundColor: 'rgba(251, 191, 36, 0.2)',
                          }}>
                            <Text style={{ color: '#fbbf24', fontSize: 10, fontWeight: '600' }}>
                              🚩 Prioridad {contenidoDuplicado.prioridad}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Opciones */}
                  <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 13, marginBottom: 16, fontWeight: '600' }}>
                    🤔 ¿Qué deseas hacer?
                  </Text>

                  <View style={{ gap: 10 }}>
                    {/* 🔥 OPCIÓN 1: Actualizar existente - GUARDADO DIRECTO */}
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        borderWidth: 2,
                        borderColor: 'rgba(16, 185, 129, 0.4)',
                      }}
                      onPress={async () => {
                        console.log('🔄 Actualizando contenido existente directamente...');

                        try {
                          // Cerrar modal de duplicado
                          setModalDuplicadoVisible(false);

                          // 🔥 Preparar datos para actualización directa
                          const categoriaSeleccionada = categorias.find(
                            (cat) => Number(cat.id_categoria) === Number(formData.id_categoria)
                          );

                          if (!categoriaSeleccionada) {
                            Alert.alert('Error', 'No se pudo encontrar la categoría seleccionada');
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
                            resumen: formData.resumen.trim(),
                            palabras_clave: formData.palabras_clave.trim(),
                            etiquetas: formData.etiquetas.trim(),
                            prioridad: parseInt(formData.prioridad),
                            estado: formData.estado,
                            fecha_vigencia_inicio: formData.fecha_vigencia_inicio || null,
                            fecha_vigencia_fin: formData.fecha_vigencia_fin || null
                          };

                          console.log('📤 Actualizando contenido ID:', contenidoDuplicado.id_contenido);
                          console.log('📦 Datos:', dataToSend);

                          // 🔥 Actualizar directamente en la base de datos
                          await contenidoService.update(contenidoDuplicado.id_contenido, dataToSend);

                          mostrarNotificacionExito('✅ Contenido actualizado correctamente');

                          // Limpiar estados
                          setContenidoDuplicado(null);
                          cerrarModal();

                          // Recargar contenidos
                          await cargarContenidos();

                          console.log('✅ Actualización completada');

                        } catch (error) {
                          console.error('❌ Error actualizando:', error);
                          Alert.alert('Error', error.message || 'No se pudo actualizar el contenido');
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        backgroundColor: '#10b981',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <Text style={{ fontSize: 20 }}>✏️</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#10b981', fontWeight: '700', fontSize: 14 }}>
                          ✅ Actualizar contenido existente (Recomendado)
                        </Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 11, marginTop: 2 }}>
                          Actualizar directamente el contenido existente con tus cambios
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* 🔥 OPCIÓN 2: Revisar y modificar mi contenido */}
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: 'rgba(52, 152, 219, 0.2)',
                        borderWidth: 2,
                        borderColor: 'rgba(52, 152, 219, 0.4)',
                      }}
                      onPress={() => {
                        console.log('🔍 Usuario eligió: Revisar y modificar mi contenido');
                        setModalDuplicadoVisible(false);
                        setContenidoDuplicado(null);
                        // NO cerrar el modal de edición, solo ocultar el modal de duplicado
                        // El usuario vuelve al formulario con sus datos intactos
                      }}
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
                        <Text style={{ fontSize: 20 }}>🔍</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#3498db', fontWeight: '700', fontSize: 14 }}>
                          🔍 Revisar y modificar mi contenido
                        </Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 11, marginTop: 2 }}>
                          Volver al formulario y hacer cambios para que sea diferente
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* 🔥 OPCIÓN 3: Cancelar creación */}
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        borderWidth: 2,
                        borderColor: 'rgba(239, 68, 68, 0.4)',
                      }}
                      onPress={() => {
                        console.log('❌ Usuario eligió: Cancelar creación');
                        setModalDuplicadoVisible(false);
                        setContenidoDuplicado(null);
                        cerrarModal(); // Cerrar todo y volver al listado
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
                          ❌ Cancelar creación
                        </Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 11, marginTop: 2 }}>
                          Descartar este contenido y volver al listado
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Info adicional */}
                  <View style={{
                    marginTop: 16,
                    padding: 12,
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderRadius: 10,
                    borderLeftWidth: 3,
                    borderLeftColor: '#3498db',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Text style={{ fontSize: 14 }}>💡</Text>
                      <Text style={{ color: '#3498db', fontWeight: '700', fontSize: 12 }}>
                        Consejo
                      </Text>
                    </View>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 11, lineHeight: 16 }}>
                      Mantener el contenido organizado evita confusiones y mejora la calidad
                      de las respuestas del agente. Actualizar contenido existente es mejor
                      que crear duplicados.
                    </Text>
                  </View>
                </View>
              </ScrollView>
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

            {/* Header */}
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
                  width: Platform.OS === 'web' ? 48 : 36,
                  height: Platform.OS === 'web' ? 48 : 36,
                  borderRadius: 14,
                  backgroundColor: 'rgba(239, 68, 68, 0.3)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: Platform.OS === 'web' ? 28 : 22 }}>⚠️</Text>
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

            {/* Contenido */}
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

              {/* Botones */}
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
                    console.log('❌ Usuario canceló la eliminación');
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

      {/* ============ SIDEBAR MÓVIL ============ */}
      {Platform.OS !== 'web' && sidebarOpen && (
        <>
          {/* Overlay oscuro */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 998,
            }}
            onPress={() => setSidebarOpen(false)}
            activeOpacity={1}
          />

          {/* Sidebar deslizante */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '80%',
            maxWidth: 320,
            zIndex: 999,
          }}>
            <SuperAdminSidebar
              isOpen={sidebarOpen}
              onNavigate={() => setSidebarOpen(false)}
            />
          </View>
        </>
      )}

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
  );
};

export default GestionContenidoPage;
// UBICACIÓN: src/pages/administrador/GestionAgenteAdminPage.js
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  Switch,
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
import GestionAgenteCard from '../../components/SuperAdministrador/GestionAgenteCard';
import { getUserIdFromToken } from "../../components/utils/authHelper";
import SecurityValidator from '../../components/utils/SecurityValidator';
import { getStatIconColor, modalStyles, styles } from '../../styles/gestionAgenteStyles';


const isWeb = Platform.OS === 'web';

export default function GestionAgentePage() {
  // ============ STATE ============
  const [agentes, setAgentes] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Modales
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedAgente, setSelectedAgente] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agenteToDelete, setAgenteToDelete] = useState(null);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [agenteToToggle, setAgenteToToggle] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    nombre_agente: '',
    tipo_agente: 'especializado',
    area_especialidad: '',
    descripcion: '',
    modelo_ia: 'llama3:8b',
    temperatura: '0.7',
    max_tokens: '4000',
    prompt_mision: '',
    prompt_reglas: ['', ''],
    prompt_tono: 'amigable',
    prompt_especializado: '',
    herramientas_disponibles: '',
    idioma_principal: 'es',
    zona_horaria: 'America/Guayaquil',
    activo: true,
    icono: '🤖',
    id_departamento: '',
    avatar_url: '',
    color_tema: '#667eea',
    mensaje_bienvenida: '',
    mensaje_despedida: '',
    mensaje_derivacion: '',
    mensaje_fuera_horario: '',
    palabras_clave_trigger: '',
    prioridad_routing: '0',
    puede_ejecutar_acciones: false,
    acciones_disponibles: '',
    requiere_autenticacion: false,
    horarios: {
      lunes: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
      martes: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
      miercoles: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
      jueves: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
      viernes: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
      sabado: { activo: false, bloques: [] },
      domingo: { activo: false, bloques: [] }
    },
  });
  const [formErrors, setFormErrors] = useState({});
  const [showDeptPicker, setShowDeptPicker] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    router: 0,
    especializados: 0,
  });

  // ============ CONSTANTES ============
  const iconos = ['🤖', '🧠', '💼', '📊', '🎯', '🔧', '📚', '💡', '🌟', '⚡', '🎨', '🔬'];

  // ============ EFFECTS ============
  useEffect(() => {
    cargarAgentes();
    cargarEstadisticas();
  }, [filterTipo, filterEstado]);

  useEffect(() => {
    cargarDepartamentos();
  }, []);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        // Intentar TODAS las posibles claves
        const posiblesClaves = [
          '@datos_sesion',
          'datos_sesion',
          '@user_session',
          'user_data',
          'currentUser'
        ];

        let usuarioEncontrado = null;

        for (const clave of posiblesClaves) {
          const data = await AsyncStorage.getItem(clave); // ✅ AsyncStorage

          if (data) {
            try {
              const parsed = JSON.parse(data);

              // Buscar el usuario en diferentes estructuras
              if (parsed.usuario) {
                usuarioEncontrado = parsed.usuario;
                break;
              } else if (parsed.user) {
                usuarioEncontrado = parsed.user;
                break;
              } else if (parsed.id_usuario) {
                usuarioEncontrado = parsed;
                break;
              }
            } catch (e) {
              console.log('Error parseando:', clave);
            }
          }
        }

        if (usuarioEncontrado) {
          console.log('✅ Usuario encontrado:', usuarioEncontrado);
          setUsuarioActual(usuarioEncontrado);
        } else {
          console.log('⚠️ No se encontró usuario en AsyncStorage');

          // Debug: Mostrar TODAS las claves disponibles
          const allKeys = await AsyncStorage.getAllKeys();
          console.log('📋 Claves disponibles en AsyncStorage:', allKeys);

          for (const key of allKeys) {
            const val = await AsyncStorage.getItem(key);
            console.log(`  ${key}:`, val?.substring(0, 100) + '...'); // Mostrar primeros 100 chars
          }
        }
      } catch (error) {
        console.error('❌ Error al cargar usuario:', error);
      }
    };

    cargarUsuario();
  }, []);

  // ============ HELPERS ============
  // Validar URLs de imagen usando SecurityValidator
  const isValidImageUrl = (url) => {
    if (!url) return false;

    // Primero verificar que sea una URL segura
    if (!SecurityValidator.isSecureUrl(url)) {
      return false;
    }

    // Luego verificar que sea una imagen válida
    return SecurityValidator.isValidImageUrl(url);
  };

  // ============ FUNCIONES DE CARGA ============
  const cargarAgentes = async () => {
    try {
      setLoading(true);
      const params = {};

      if (filterTipo !== 'todos') {
        params.tipo_agente = filterTipo;
      }

      // Solo aplicar filtro si filterEstado está definido como 'activo' o 'inactivo'
      if (filterEstado === 'activo') {
        params.activo = true;
      } else if (filterEstado === 'inactivo') {
        params.activo = false;
      }

      const data = await agenteService.getAll(params);

      // Manejar diferentes estructuras de respuesta
      const agentesArray = Array.isArray(data) ? data : (data?.data || []);
      setAgentes(agentesArray);

    } catch (err) {
      console.error('Error al cargar agentes:', err);
      Alert.alert('Error', 'No se pudieron cargar los agentes');
      setAgentes([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      console.log('📊 Cargando estadísticas desde agentes...');

      const todosAgentes = await agenteService.getAll({});

      const agentesArray = Array.isArray(todosAgentes)
        ? todosAgentes
        : (todosAgentes?.data || []);

      const calculadas = {
        total: agentesArray.length,
        activos: agentesArray.filter(a => a.activo === true || a.activo === 1).length,
        router: agentesArray.filter(a => a.tipo_agente === 'router').length,
        especializados: agentesArray.filter(a => a.tipo_agente === 'especializado').length,
      };

      console.log('✅ Estadísticas calculadas:', calculadas);
      setStats(calculadas);

    } catch (err) {
      console.error('❌ Error al cargar estadísticas:', err);
      setStats({
        total: 0,
        activos: 0,
        router: 0,
        especializados: 0,
      });
    }
  };

  // ============  Cargar departamentos para el formulario ===========

  const cargarDepartamentos = async () => {
    try {
      const data = await departamentoService.getAll({ activo: true });
      setDepartamentos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar departamentos:', err);
      setDepartamentos([]);
    }
  };

  // ============ FUNCIONES DE FORMULARIO ============
  const resetForm = () => {
    setFormData({
      nombre_agente: '',
      tipo_agente: 'especializado',
      area_especialidad: '',
      descripcion: '',
      modelo_ia: 'llama3:8b',
      temperatura: '0.7',
      max_tokens: '4000',
      prompt_mision: '',
      prompt_reglas: ['', ''],
      prompt_tono: 'amigable',
      prompt_especializado: '',
      herramientas_disponibles: '',
      idioma_principal: 'es',
      zona_horaria: 'America/Guayaquil',
      activo: true,
      icono: '🤖',
      id_departamento: '',
      avatar_url: '',
      color_tema: '#667eea',
      mensaje_bienvenida: '',
      mensaje_despedida: '',
      mensaje_derivacion: '',
      mensaje_fuera_horario: '',
      palabras_clave_trigger: '',
      prioridad_routing: '0',
      puede_ejecutar_acciones: false,
      acciones_disponibles: '',
      requiere_autenticacion: false,
      creado_por: null,
      actualizado_por: null,
      horarios: {
        lunes: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
        martes: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
        miercoles: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
        jueves: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
        viernes: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
        sabado: { activo: false, bloques: [] },
        domingo: { activo: false, bloques: [] }
      },
    });
    setFormErrors({});
  };

  // Validar formulario
  // Validar formulario con SecurityValidator
  const validateForm = () => {

    // Usar el validador de seguridad
    const validation = SecurityValidator.validateAgenteForm(formData, formMode);
    ({
      isValid: validation.isValid,
      errorsCount: Object.keys(validation.errors).length,
      errors: validation.errors
    });

    // Si hay errores de departamento duplicado en modo creación
    if (formMode === 'create' && formData.id_departamento) {
      const departamentoYaTieneAgente = agentes.some(
        a => a.id_departamento &&
          a.id_departamento.toString() === formData.id_departamento.toString()
      );

      if (departamentoYaTieneAgente) {
        validation.errors.id_departamento = '⚠️ Este departamento ya tiene un agente asignado';
        validation.isValid = false;
      }
    }

    // Si está editando y intenta cambiar departamento
    if (formMode === 'edit' && selectedAgente?.id_departamento) {
      if (formData.id_departamento &&
        selectedAgente.id_departamento.toString() !== formData.id_departamento.toString()) {
        validation.errors.id_departamento = '⚠️ No se puede cambiar el departamento';
        validation.isValid = false;
      }
    }
    setFormErrors(validation.errors);

    if (!validation.isValid) {
    } else {
      console.log('✅ Validación exitosa');
    }

    return validation.isValid;
  };

  // ============ HANDLERS CRUD ============
  const handleCreateNew = () => {
    setFormMode('create');
    resetForm();
    setShowFormModal(true);
  };

  // ============ PARSER: Separar prompt_sistema en componentes ============
  const parsePromptSistema = (prompt_sistema) => {
    if (!prompt_sistema) {
      return {
        prompt_mision: '',
        prompt_reglas: ['', ''],
        prompt_tono: 'amigable',
        prompt_especializado: ''
      };
    }

    // Extraer MISIÓN
    const misionMatch = prompt_sistema.match(/MISIÓN:\s*([\s\S]*?)(?=\n\n(?:ESPECIALIZACIÓN|REGLAS|TONO):|\n\nTONO:|$)/);
    const prompt_mision = misionMatch ? misionMatch[1].trim() : '';

    // Extraer ESPECIALIZACIÓN (si existe)
    const especializacionMatch = prompt_sistema.match(/ESPECIALIZACIÓN:\s*([\s\S]*?)(?=\n\n(?:REGLAS|TONO):|\n\nTONO:|$)/);
    const prompt_especializado = especializacionMatch ? especializacionMatch[1].trim() : '';

    // Extraer REGLAS
    const reglasMatch = prompt_sistema.match(/REGLAS:\s*([\s\S]*?)(?=\n\nTONO:|$)/);
    let prompt_reglas = ['', ''];

    if (reglasMatch) {
      const reglasTexto = reglasMatch[1].trim();
      const reglasArray = reglasTexto
        .split('\n')
        .filter(linea => linea.trim().startsWith('-'))
        .map(linea => linea.replace(/^-\s*/, '').trim())
        .filter(r => r.length > 0);

      prompt_reglas = reglasArray.length >= 2 ? reglasArray : ['', ''];
    }

    // Extraer TONO
    let prompt_tono = 'amigable';

    if (prompt_sistema.includes('formal') || prompt_sistema.includes('profesional')) {
      prompt_tono = 'formal';
    } else if (prompt_sistema.includes('técnico') || prompt_sistema.includes('tecnico')) {
      prompt_tono = 'tecnico';
    } else if (prompt_sistema.includes('amigable') || prompt_sistema.includes('empático')) {
      prompt_tono = 'amigable';
    }

    return {
      prompt_mision,
      prompt_reglas,
      prompt_tono,
      prompt_especializado
    };
  };

  // Editar agente
  const handleEdit = (agente) => {

    setFormMode('edit');
    setSelectedAgente(agente);

    // ⭐ PARSEAR prompt_sistema para obtener los componentes
    const { prompt_mision, prompt_reglas, prompt_tono, prompt_especializado } = parsePromptSistema(agente.prompt_sistema);

    setFormData({
      nombre_agente: agente.nombre_agente || '',
      tipo_agente: agente.tipo_agente || 'especializado',
      area_especialidad: agente.area_especialidad || '',
      descripcion: agente.descripcion || '',
      modelo_ia: 'llama3:8b',
      temperatura: (() => {
        const temp = agente.temperatura?.toString() || '0.6';
        // ✅ Validar que sea uno de los valores permitidos, sino usar el más cercano
        const valoresPermitidos = ['0.6', '0.9', '1.2'];

        if (valoresPermitidos.includes(temp)) {
          return temp;
        }

        // Si el valor no está en los permitidos, buscar el más cercano
        const tempNum = parseFloat(temp);
        if (tempNum < 0.75) return '0.6';      // Más cercano a 0.6
        if (tempNum < 1.05) return '0.9';      // Más cercano a 0.9
        return '1.2';                           // Más cercano a 1.2
      })(),
      max_tokens: agente.max_tokens?.toString() || '4000',

      prompt_mision: prompt_mision,
      prompt_reglas: prompt_reglas,
      prompt_tono: prompt_tono,
      prompt_especializado: prompt_especializado,

      herramientas_disponibles: agente.herramientas_disponibles || '',
      idioma_principal: agente.idioma_principal || 'es',
      zona_horaria: agente.zona_horaria || 'America/Guayaquil',
      activo: agente.activo !== undefined ? agente.activo : true,
      icono: agente.icono || '🤖',
      id_departamento: agente.id_departamento?.toString() || '',
      avatar_url: agente.avatar_url || '',
      color_tema: agente.color_tema || '#667eea',
      mensaje_bienvenida: agente.mensaje_bienvenida || '',
      mensaje_despedida: agente.mensaje_despedida || '',
      mensaje_derivacion: agente.mensaje_derivacion || '',
      mensaje_fuera_horario: agente.mensaje_fuera_horario || '',
      palabras_clave_trigger: agente.palabras_clave_trigger || '',
      prioridad_routing: agente.prioridad_routing?.toString() || '0',
      puede_ejecutar_acciones: agente.puede_ejecutar_acciones || false,
      acciones_disponibles: agente.acciones_disponibles || '',
      requiere_autenticacion: agente.requiere_autenticacion || false,
      horarios: (() => {  // ⭐ AGREGAR TODO ESTO
        if (!agente.horarios) {
          return {
            lunes: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
            martes: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
            miercoles: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
            jueves: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
            viernes: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
            sabado: { activo: false, bloques: [] },
            domingo: { activo: false, bloques: [] }
          };
        }

        const horariosDesdeDB = typeof agente.horarios === 'string'
          ? JSON.parse(agente.horarios)
          : agente.horarios;

        const horariosParaFormulario = {
          lunes: { activo: false, bloques: [] },
          martes: { activo: false, bloques: [] },
          miercoles: { activo: false, bloques: [] },
          jueves: { activo: false, bloques: [] },
          viernes: { activo: false, bloques: [] },
          sabado: { activo: false, bloques: [] },
          domingo: { activo: false, bloques: [] }
        };

        Object.entries(horariosDesdeDB).forEach(([dia, bloques]) => {
          if (Array.isArray(bloques) && bloques.length > 0) {
            horariosParaFormulario[dia] = {
              activo: true,
              bloques: bloques
            };
          }
        });

        return horariosParaFormulario;
      })(),
      creado_por: agente.creado_por || null,
      actualizado_por: null,
    });

    setShowFormModal(true);
  };


  // Función para obtener departamentos disponibles
  const getDepartamentosDisponibles = () => {

    // Si estamos editando y el agente ya tiene departamento asignado
    if (formMode === 'edit' && selectedAgente?.id_departamento) {
      const deptAsignado = departamentos.find(d =>
        d.id_departamento.toString() === selectedAgente.id_departamento.toString()
      );
      return deptAsignado ? [deptAsignado] : [];
    }


    // Obtener IDs de departamentos ocupados
    const departamentosOcupados = agentes
      .filter(a => {
        const tieneDepto = a.id_departamento != null && a.id_departamento !== '';
        if (tieneDepto) {
        }
        return tieneDepto;
      })
      .map(a => a.id_departamento.toString());

    // Filtrar departamentos disponibles
    const disponibles = departamentos.filter(d => {
      const deptId = d.id_departamento.toString();
      const estaOcupado = departamentosOcupados.includes(deptId);
      return !estaOcupado;
    });

    return disponibles;
  };


  // Guardar agente (crear o actualizar)
  const handleSaveForm = async () => {

    if (!validateForm()) {
      Alert.alert('Error de validación', 'Por favor, corrige los errores en el formulario');
      return;
    }

    // Verificar que hay un usuario logueado
    // Obtener ID del usuario desde el token
    const userId = await getUserIdFromToken();

    if (!userId) {
      console.warn("❌ No se pudo obtener el ID del usuario desde el token");
      Alert.alert("Error", "No se pudo identificar al usuario autenticado.");
      return;
    }

    // Registrar el usuario que realiza la acción
    let usuarioParaGuardar = {
      id_usuario: userId
    };

    try {

      // CONSTRUIR EL PROMPT_SISTEMA 
      const { nombre_agente, area_especialidad, prompt_mision, prompt_reglas, prompt_tono, prompt_especializado } = formData;

      const contextoBase = `Eres ${nombre_agente} del TEC AZUAY, especializado en ${area_especialidad}.`;
      const misionTexto = `\n\nMISIÓN:\n${prompt_mision}`;
      const especializacionTexto = prompt_especializado
        ? `\n\nESPECIALIZACIÓN:\n${prompt_especializado}`
        : '';
      const reglasLimpias = prompt_reglas.filter(r => r.trim() !== '');
      const reglasTexto = reglasLimpias.length > 0
        ? `\n\nREGLAS:\n${reglasLimpias.map(r => `- ${r}`).join('\n')}`
        : '';
      const tonoMap = {
        formal: 'Sé formal, profesional y preciso en tus respuestas.',
        amigable: 'Sé amigable, cercano y empático, pero mantén profesionalismo.',
        tecnico: 'Usa lenguaje técnico claro y preciso, enfócate en soluciones concretas.'
      };
      const tonoTexto = `\n\nTONO:\n${tonoMap[prompt_tono] || tonoMap.amigable}`;
      const prompt_sistema_final = `${contextoBase}${misionTexto}${especializacionTexto}${reglasTexto}${tonoTexto}`;

      // Preparar datos ANTES de sanitizar
      const horariosParaBD = {};
      Object.entries(formData.horarios).forEach(([dia, config]) => {
        if (config.activo && config.bloques && config.bloques.length > 0) {
          horariosParaBD[dia] = config.bloques;
        }
      });

      const dataPreSanitizar = {
        ...formData,
        prompt_sistema: prompt_sistema_final,
        horarios: JSON.stringify(horariosParaBD)
      };

      // ⭐ ESTABLECER CAMPOS DE AUDITORÍA ANTES DE SANITIZAR
      if (formMode === 'create') {
        dataPreSanitizar.creado_por = usuarioParaGuardar.id_usuario;
        console.log('➕ MODO CREAR - Estableciendo creado_por PRE-sanitizar:', dataPreSanitizar.creado_por);
      } else {
        dataPreSanitizar.actualizado_por = usuarioParaGuardar.id_usuario;
        console.log('✏️ MODO EDITAR - Estableciendo actualizado_por PRE-sanitizar:', dataPreSanitizar.actualizado_por);
      }

      console.log('📦 Datos PRE-sanitizar:', dataPreSanitizar);

      // Sanitizar
      const dataToSave = SecurityValidator.sanitizeAgenteData(dataPreSanitizar);


      // ENVIAR AL BACKEND
      let response;
      if (formMode === 'create') {
        response = await agenteService.create(dataToSave);
      } else {
        response = await agenteService.update(selectedAgente.id_agente, dataToSave);
      }

      // Éxito
      setSuccessMessage(formMode === 'create' ? '✅ Agente creado correctamente' : '✅ Agente actualizado correctamente');
      setShowSuccessMessage(true);
      setShowFormModal(false);

      await cargarAgentes();
      await cargarEstadisticas();
      resetForm();

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

    } catch (err) {


      Alert.alert(
        'Error al guardar',
        `No se pudo guardar el agente.\n\nDetalles: ${err?.response?.data?.message || err?.message || 'Error desconocido'}`
      );
    }
  };

  const handleView = (agente) => {
    setSelectedAgente(agente);
    setShowDetailModal(true);
  };

  const handleDelete = (agente) => {
    setAgenteToDelete(agente);
    setShowDeleteModal(true);
  };

  const confirmarEliminacion = async () => {
    if (!agenteToDelete) return;

    try {
      // ✅ VALIDACIÓN 1: Verificar si tiene contenidos asociados
      const responseContenidos = await contenidoService.getByAgente(
        agenteToDelete.id_agente
      );
      const contenidosAsociados = responseContenidos?.data || responseContenidos || [];

      // ✅ VALIDACIÓN 2: Verificar si tiene categorías asociadas (NO ELIMINADAS)
      const todasCategorias = await categoriaService.getAll({
        id_agente: agenteToDelete.id_agente
      });

      // 🔥 FILTRAR solo categorías NO eliminadas
      const categoriasAsociadas = Array.isArray(todasCategorias)
        ? todasCategorias.filter(cat => !cat.eliminado)
        : [];

      const tieneContenidos = contenidosAsociados && contenidosAsociados.length > 0;
      const tieneCategorias = categoriasAsociadas && categoriasAsociadas.length > 0;

      // ❌ Si tiene contenidos O categorías, no permitir eliminar
      if (tieneContenidos || tieneCategorias) {
        // Cerrar modal de confirmación
        setShowDeleteModal(false);

        // ✅ Construir mensaje de error MÁS CLARO
        const cantidadContenidos = contenidosAsociados.length;
        const cantidadCategorias = categoriasAsociadas.length;

        const textoContenido = cantidadContenidos === 1 ? 'contenido asociado' : 'contenidos asociados';
        const textoCategoria = cantidadCategorias === 1 ? 'categoría asociada' : 'categorías asociadas';

        let mensajeError = `No se puede eliminar el agente "${agenteToDelete.nombre_agente}" porque tiene `;

        // Construir frase según lo que tenga
        if (tieneContenidos && tieneCategorias) {
          // Tiene AMBOS
          mensajeError += `${cantidadContenidos} ${textoContenido} y ${cantidadCategorias} ${textoCategoria}.`;
        } else if (tieneContenidos) {
          // Solo tiene contenidos
          mensajeError += `${cantidadContenidos} ${textoContenido}.`;
        } else {
          // Solo tiene categorías
          mensajeError += `${cantidadCategorias} ${textoCategoria}.`;
        }

        mensajeError += ' Primero debes eliminar o reasignar estos elementos a otro agente.';

        // Mostrar modal de error
        setErrorMessage(mensajeError);
        setErrorDetails({
          contenidos: tieneContenidos ? cantidadContenidos : 0,
          categorias: tieneCategorias ? cantidadCategorias : 0
        });
        setShowErrorModal(true);
        return;
      }

      // ✅ Si NO tiene contenidos NI categorías, proceder con la eliminación
      await agenteService.delete(agenteToDelete.id_agente);

      setSuccessMessage('🗑️ Agente eliminado permanentemente');
      setShowSuccessMessage(true);

      setShowDeleteModal(false);
      setShowDetailModal(false);
      setAgenteToDelete(null);

      await cargarAgentes();
      await cargarEstadisticas();

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (err) {
      // El mensaje viene directamente en err.message
      let mensajeError = err?.message || 'No se pudo eliminar el agente';

      // Reemplazar "desactivar" por "eliminar" si viene del backend
      mensajeError = mensajeError.replace(/desactivar/gi, 'eliminar');

      console.log('📝 Mostrando error:', mensajeError);

      // Cerrar modal de confirmación
      setShowDeleteModal(false);

      // Mostrar modal de error
      setErrorMessage(mensajeError);
      setErrorDetails({ message: mensajeError });
      setShowErrorModal(true);
    }
  };

  const handleToggleStatus = (agente) => {
    setAgenteToToggle(agente);
    setShowToggleModal(true);
  };

  const confirmarToggleStatus = async () => {
    if (!agenteToToggle) return;

    try {
      const newStatus = !agenteToToggle.activo;

      await agenteService.update(agenteToToggle.id_agente, {
        ...agenteToToggle,
        activo: newStatus,
      });

      setSuccessMessage(
        newStatus
          ? '✅ Agente reactivado exitosamente'
          : '⏸️ Agente desactivado exitosamente'
      );
      setShowSuccessMessage(true);

      setShowToggleModal(false);
      setShowDetailModal(false);
      setAgenteToToggle(null);

      await cargarAgentes();
      await cargarEstadisticas();

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (err) {
      Alert.alert('Error', `No se pudo cambiar el estado del agente`);
    }
  };

  // ============ UTILIDADES ============

  const handleSearchChange = (text) => {
    const sanitized = SecurityValidator.sanitizeText(text);
    const truncated = SecurityValidator.truncateText(sanitized, 100);
    setSearchTerm(truncated);
  };

  const filteredAgentes = agentes.filter((agente) => {
    const matchSearch =
      agente.nombre_agente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agente.area_especialidad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agente.tipo_agente?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchSearch;
  });

  const formatModelName = (modelo) => {
    if (!modelo) return 'N/A';
    if (modelo.includes('claude')) {
      const parts = modelo.split('-');
      if (parts.length >= 3) {
        const name = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
        const version = parts[2];
        return `${name} ${version}`;
      }
      return 'Claude';
    } else if (modelo.includes('gpt')) {
      return modelo.toUpperCase().replace(/-/g, ' ');
    } else if (modelo.includes('gemini')) {
      const parts = modelo.split('-');
      return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }
    return modelo.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTipoBadgeStyles = (tipo) => {
    switch (tipo) {
      case 'router':
        return { bg: 'rgba(251, 146, 60, 0.2)', text: '#fb923c', border: '#fb923c' };
      case 'especializado':
        return { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e', border: '#22c55e' };
      case 'hibrido':
        return { bg: 'rgba(168, 85, 247, 0.2)', text: '#a855f7', border: '#a855f7' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.2)', text: '#94a3b8', border: '#94a3b8' };
    }
  };

  // ============ RENDER ============
  return (
    <View style={contentStyles.wrapper}>

      {/* ============ SIDEBAR WEB ============ */}
      {isWeb && (
        <AdminSidebar
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
      <View style={[
        contentStyles.mainContent,
        sidebarOpen && contentStyles.mainContentWithSidebar
      ]}>

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >

          {/* ============ HEADER ============ */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>🤖 Gestión de Agentes</Text>
              <Text style={styles.subtitle}>
                {agentes.length} {agentes.length === 1 ? 'agente registrado' : 'agentes registrados'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCreateNew}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={22} color="white" />
              <Text style={styles.buttonText}>Nuevo</Text>
            </TouchableOpacity>
          </View>

          {/* ============ MENSAJE DE ÉXITO ============ */}
          {showSuccessMessage && (
            <View style={{
              margin: 16,
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              borderLeftWidth: 4,
              borderLeftColor: '#10b981',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(16, 185, 129, 0.3)',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              </View>
              <Text style={{
                flex: 1,
                color: '#10b981',
                fontSize: 15,
                fontWeight: '700',
              }}>
                {successMessage}
              </Text>
            </View>
          )}

          {/* ============ ESTADÍSTICAS ============ */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[
                styles.statIconWrapper,
                { backgroundColor: getStatIconColor('total').bg }
              ]}>
                <Ionicons
                  name="apps"
                  size={24}
                  color={getStatIconColor('total').color}
                />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Total Agentes</Text>
                <Text style={styles.statValue}>{stats?.total ?? 0}</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[
                styles.statIconWrapper,
                { backgroundColor: getStatIconColor('activos').bg }
              ]}>
                <Ionicons
                  name="power"
                  size={24}
                  color={getStatIconColor('activos').color}
                />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Activos</Text>
                <Text style={styles.statValue}>{stats?.activos ?? 0}</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[
                styles.statIconWrapper,
                { backgroundColor: getStatIconColor('router').bg }
              ]}>
                <Ionicons
                  name="filter"
                  size={24}
                  color={getStatIconColor('router').color}
                />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Routers</Text>
                <Text style={styles.statValue}>{stats?.router ?? 0}</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[
                styles.statIconWrapper,
                { backgroundColor: getStatIconColor('especializados').bg }
              ]}>
                <Ionicons
                  name="people"
                  size={24}
                  color={getStatIconColor('especializados').color}
                />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Especializados</Text>
                <Text style={styles.statValue}>{stats?.especializados ?? 0}</Text>
              </View>
            </View>
          </View>

          {/* ============ BÚSQUEDA ============ */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar agentes..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={searchTerm}
              onChangeText={handleSearchChange}
              maxLength={100}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.5)" />
              </TouchableOpacity>
            )}
          </View>

          {/* ============ FILTROS ============ */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            {/* Título general */}
            <Text style={{
              fontSize: 13,
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              🔍 Filtros de búsqueda
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              <View style={styles.filterContainer}>
                {/* Filtros de Estado */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginRight: 4,
                  }}>
                    Estado:
                  </Text>
                  {[
                    { key: 'todos', label: 'Todos', icon: 'apps' },
                    { key: 'activo', label: 'Activos', icon: 'checkmark-circle' },
                    { key: 'inactivo', label: 'Inactivos', icon: 'pause-circle' },
                  ].map((filter) => (
                    <TouchableOpacity
                      key={`estado-${filter.key}`}
                      style={[
                        styles.filterButton,
                        filterEstado === filter.key && styles.filterButtonActive,
                      ]}
                      onPress={() => setFilterEstado(filter.key)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={filter.icon}
                        size={14}
                        color={filterEstado === filter.key ? 'white' : 'rgba(255, 255, 255, 0.6)'}
                      />
                      <Text
                        style={[
                          styles.filterText,
                          filterEstado === filter.key && styles.filterTextActive,
                        ]}
                      >
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>

          {/* ============ LISTA ============ */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Cargando agentes...</Text>
            </View>
          ) : filteredAgentes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="file-tray-outline" size={80} color="rgba(255, 255, 255, 0.2)" />
              <Text style={styles.emptyText}>No se encontraron agentes</Text>
              <Text style={styles.emptySubtext}>
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer agente virtual'}
              </Text>
            </View>
          ) : (
            <View style={{ paddingHorizontal: 16 }}>
              {filteredAgentes.map((item) => (
                <GestionAgenteCard
                  key={item.id_agente?.toString() || Math.random().toString()}
                  agente={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </View>
          )}

        </ScrollView>
      </View>

      {/* ============ MODAL FORMULARIO (CREAR/EDITAR) ============ */}
      <Modal
        visible={showFormModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFormModal(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>
                {formMode === 'create' ? '✨ Crear Nuevo Agente' : '✏️ Editar Agente'}
              </Text>
              <TouchableOpacity onPress={() => setShowFormModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={modalStyles.content} showsVerticalScrollIndicator={false}>

              {/* ============ INFORMACIÓN BÁSICA ============ */}
              <View style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>📋 Información Básica</Text>

                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Nombre del Agente *</Text>
                  <TextInput
                    style={[modalStyles.input, formErrors.nombre_agente && modalStyles.inputError]}
                    placeholder="Ej: Asistente de Ventas"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={formData.nombre_agente}
                    onChangeText={(text) => setFormData({ ...formData, nombre_agente: text })}
                    maxLength={100}
                  />
                  {formErrors.nombre_agente && (
                    <Text style={modalStyles.errorText}>{formErrors.nombre_agente}</Text>
                  )}
                </View>

                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Área de Especialidad *</Text>
                  <TextInput
                    style={[modalStyles.input, formErrors.area_especialidad && modalStyles.inputError]}
                    placeholder="Ej: Ventas, Soporte, RRHH"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={formData.area_especialidad}
                    onChangeText={(text) => setFormData({ ...formData, area_especialidad: text })}
                    maxLength={100}
                  />
                  {formErrors.area_especialidad && (
                    <Text style={modalStyles.errorText}>{formErrors.area_especialidad}</Text>
                  )}
                </View>

                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Descripción *</Text>
                  <TextInput
                    style={[modalStyles.textArea, formErrors.descripcion && modalStyles.inputError]}
                    placeholder="Describe el propósito y funciones del agente..."
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={formData.descripcion}
                    onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                  />
                  {formErrors.descripcion && (
                    <Text style={modalStyles.errorText}>{formErrors.descripcion}</Text>
                  )}
                </View>

                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Departamento Responsable</Text>

                  {formErrors.id_departamento && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      padding: 10,
                      borderRadius: 8,
                      marginTop: 8,
                      borderLeftWidth: 3,
                      borderLeftColor: '#ef4444',
                    }}>
                      <Ionicons name="warning" size={16} color="#ef4444" />
                      <Text style={{
                        color: '#ef4444',
                        fontSize: 12,
                        fontWeight: '600',
                        flex: 1,
                      }}>
                        {formErrors.id_departamento}
                      </Text>
                    </View>
                  )}

                  {/* Si está editando Y tiene departamento asignado - BLOQUEADO */}
                  {formMode === 'edit' && selectedAgente?.id_departamento ? (
                    <>
                      <View style={{
                        backgroundColor: 'rgba(71, 85, 105, 0.3)',
                        borderWidth: 1,
                        borderColor: 'rgba(148, 163, 184, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 8,
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Ionicons name="business-outline" size={20} color="#94a3b8" />
                          <Text style={{
                            color: '#94a3b8',
                            fontSize: 15,
                            fontWeight: '500',
                          }}>
                            {departamentos.find(d => d.id_departamento.toString() === selectedAgente.id_departamento.toString())?.nombre || 'Departamento asignado'}
                          </Text>
                        </View>
                        <View style={{
                          backgroundColor: 'rgba(148, 163, 184, 0.2)',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 6,
                        }}>
                          <Text style={{
                            color: '#94a3b8',
                            fontSize: 11,
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}>
                            Bloqueado
                          </Text>
                        </View>
                      </View>
                      <Text style={modalStyles.helperText}>
                        ⚠️ El departamento no puede cambiarse una vez asignado
                      </Text>
                    </>
                  ) : (
                    /* Si está creando O no tiene departamento - SELECTOR CON MODAL */
                    <>
                      {/* Botón para abrir el modal */}
                      <TouchableOpacity
                        style={{
                          marginTop: 8,
                          backgroundColor: 'rgba(71, 85, 105, 0.3)',
                          borderWidth: 2,
                          borderColor: 'rgba(148, 163, 184, 0.3)',
                          borderRadius: 12,
                          padding: 16,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                        onPress={() => setShowDeptPicker(true)}
                        activeOpacity={0.8}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                          <Ionicons name="business-outline" size={20} color="#667eea" />
                          <Text style={{
                            color: formData.id_departamento ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                            fontSize: 15,
                            fontWeight: '500',
                            flex: 1,
                          }}>
                            {formData.id_departamento
                              ? departamentos.find(d => d.id_departamento.toString() === formData.id_departamento)?.nombre || 'Seleccionar...'
                              : 'Seleccionar departamento...'}
                          </Text>
                        </View>
                        <Ionicons name="chevron-down" size={20} color="#667eea" />
                      </TouchableOpacity>

                      {/* Modal con lista de departamentos */}
                      <Modal
                        visible={showDeptPicker}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setShowDeptPicker(false)}
                      >
                        <View style={{
                          flex: 1,
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: 20,
                        }}>
                          <View style={{
                            backgroundColor: '#1e293b',
                            borderRadius: 16,
                            width: '100%',
                            maxWidth: 500,
                            maxHeight: '80%',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.5,
                            shadowRadius: 16,
                            elevation: 16,
                          }}>
                            {/* Header del modal */}
                            <View style={{
                              backgroundColor: 'rgba(102, 126, 234, 0.2)',
                              padding: 16,
                              borderTopLeftRadius: 16,
                              borderTopRightRadius: 16,
                              borderBottomWidth: 1,
                              borderBottomColor: 'rgba(102, 126, 234, 0.3)',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}>
                              <Text style={{ color: '#667eea', fontSize: 16, fontWeight: '700' }}>
                                📋 Seleccionar Departamento
                              </Text>
                              <TouchableOpacity
                                onPress={() => setShowDeptPicker(false)}
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 16,
                                  backgroundColor: 'rgba(148, 163, 184, 0.2)',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                <Ionicons name="close" size={20} color="#ffffff" />
                              </TouchableOpacity>
                            </View>

                            {/* Información */}
                            <View style={{
                              padding: 12,
                              backgroundColor: 'rgba(102, 126, 234, 0.1)',
                              borderBottomWidth: 1,
                              borderBottomColor: 'rgba(148, 163, 184, 0.2)',
                            }}>
                              <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 13 }}>
                                {getDepartamentosDisponibles().length} departamento(s) disponible(s)
                              </Text>
                            </View>

                            {/* Lista de departamentos */}
                            <ScrollView
                              style={{ maxHeight: 400 }}
                              showsVerticalScrollIndicator={true}
                            >
                              {/* Opción: Sin asignar */}
                              <TouchableOpacity
                                style={{
                                  padding: 16,
                                  borderBottomWidth: 1,
                                  borderBottomColor: 'rgba(148, 163, 184, 0.2)',
                                  backgroundColor: !formData.id_departamento
                                    ? 'rgba(102, 126, 234, 0.3)'
                                    : 'transparent',
                                }}
                                onPress={() => {
                                  setFormData({ ...formData, id_departamento: '' });
                                  setShowDeptPicker(false);
                                }}
                              >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                  <View style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    borderWidth: 2,
                                    borderColor: !formData.id_departamento ? '#667eea' : '#94a3b8',
                                    backgroundColor: !formData.id_departamento ? '#667eea' : 'transparent',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}>
                                    {!formData.id_departamento && (
                                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                                    )}
                                  </View>
                                  <Text style={{
                                    color: !formData.id_departamento ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                                    fontSize: 15,
                                    fontWeight: !formData.id_departamento ? '600' : '400',
                                    flex: 1,
                                  }}>
                                    Sin asignar
                                  </Text>
                                  {!formData.id_departamento && (
                                    <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                                  )}
                                </View>
                              </TouchableOpacity>

                              {/* Departamentos disponibles */}
                              {getDepartamentosDisponibles().length > 0 ? (
                                getDepartamentosDisponibles().map((dept, index) => (
                                  <TouchableOpacity
                                    key={`dept-modal-${index}`}
                                    style={{
                                      padding: 16,
                                      borderBottomWidth: 1,
                                      borderBottomColor: 'rgba(148, 163, 184, 0.2)',
                                      backgroundColor: formData.id_departamento === dept.id_departamento.toString()
                                        ? 'rgba(102, 126, 234, 0.3)'
                                        : 'transparent',
                                    }}
                                    onPress={() => {
                                      setFormData({ ...formData, id_departamento: dept.id_departamento.toString() });
                                      setShowDeptPicker(false);
                                    }}
                                  >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                      <View style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 12,
                                        borderWidth: 2,
                                        borderColor: formData.id_departamento === dept.id_departamento.toString() ? '#667eea' : '#94a3b8',
                                        backgroundColor: formData.id_departamento === dept.id_departamento.toString() ? '#667eea' : 'transparent',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}>
                                        {formData.id_departamento === dept.id_departamento.toString() && (
                                          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                                        )}
                                      </View>
                                      <View style={{ flex: 1 }}>
                                        <Text style={{
                                          color: formData.id_departamento === dept.id_departamento.toString() ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
                                          fontSize: 15,
                                          fontWeight: formData.id_departamento === dept.id_departamento.toString() ? '600' : '400',
                                        }}>
                                          {dept.nombre}
                                        </Text>
                                        {dept.codigo && (
                                          <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginTop: 2 }}>
                                            Código: {dept.codigo}
                                          </Text>
                                        )}
                                      </View>
                                      {formData.id_departamento === dept.id_departamento.toString() && (
                                        <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                                      )}
                                    </View>
                                  </TouchableOpacity>
                                ))
                              ) : (
                                <View style={{ padding: 40, alignItems: 'center' }}>
                                  <Ionicons name="folder-open-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
                                  <Text style={{
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    fontSize: 16,
                                    marginTop: 16,
                                    textAlign: 'center',
                                    fontWeight: '500',
                                  }}>
                                    No hay departamentos disponibles
                                  </Text>
                                  <Text style={{
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    fontSize: 14,
                                    marginTop: 8,
                                    textAlign: 'center',
                                  }}>
                                    Todos ya tienen un agente asignado
                                  </Text>
                                </View>
                              )}
                            </ScrollView>

                            {/* Footer con botón cerrar */}
                            <View style={{
                              padding: 16,
                              borderTopWidth: 1,
                              borderTopColor: 'rgba(148, 163, 184, 0.2)',
                              backgroundColor: 'rgba(30, 41, 59, 0.5)',
                            }}>
                              <TouchableOpacity
                                style={{
                                  backgroundColor: 'rgba(148, 163, 184, 0.2)',
                                  padding: 12,
                                  borderRadius: 8,
                                  alignItems: 'center',
                                }}
                                onPress={() => setShowDeptPicker(false)}
                              >
                                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>
                                  Cerrar
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </Modal>

                      {/* Contador */}
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        backgroundColor: getDepartamentosDisponibles().length > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        padding: 10,
                        borderRadius: 8,
                        marginTop: 8,
                      }}>
                        <Ionicons
                          name={getDepartamentosDisponibles().length > 0 ? "checkmark-circle" : "close-circle"}
                          size={16}
                          color={getDepartamentosDisponibles().length > 0 ? "#22c55e" : "#ef4444"}
                        />
                        <Text style={{
                          color: getDepartamentosDisponibles().length > 0 ? "#22c55e" : "#ef4444",
                          fontSize: 12,
                          fontWeight: '600',
                          flex: 1,
                        }}>
                          {getDepartamentosDisponibles().length > 0
                            ? `${getDepartamentosDisponibles().length} departamento(s) disponible(s)`
                            : 'No hay departamentos disponibles'}
                        </Text>
                      </View>

                      <Text style={modalStyles.helperText}>
                        🔒 Cada departamento solo puede tener un agente asignado
                      </Text>
                    </>
                  )}
                </View>

                {/* ============ Icono  ============ */}
                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Icono</Text>

                  {/* Contenedor scrolleable */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingVertical: 8,
                      paddingHorizontal: 4,
                    }}
                  >
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {iconos.map((icon, index) => (
                        <TouchableOpacity
                          key={icon}
                          style={[
                            modalStyles.iconOption,
                            formData.icono === icon && modalStyles.iconOptionSelected,
                          ]}
                          onPress={() => setFormData({ ...formData, icono: icon })}
                          activeOpacity={0.7}
                        >
                          <Text style={modalStyles.iconText}>{icon}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  {/* Texto de ayuda */}
                  <Text style={modalStyles.helperText}>
                    👆 Mantén clic y arrastra para ver más iconos
                  </Text>
                </View>
              </View>

              {/* ============ SECCIÓN: APARIENCIA ============ */}
              <View style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>🎨 Apariencia</Text>

                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>URL del Avatar</Text>

                  {/* Input con validación */}
                  <View style={{ gap: 12 }}>
                    <TextInput
                      style={[
                        modalStyles.input,
                        formErrors.avatar_url && modalStyles.inputError,
                        formData.avatar_url && !isValidImageUrl(formData.avatar_url) && {
                          borderColor: '#fbbf24',
                          borderWidth: 2,
                        }

                      ]}



                      placeholder="https://ejemplo.com/avatar.png o cualquier URL de imagen"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={formData.avatar_url}
                      onChangeText={(text) => setFormData({ ...formData, avatar_url: text })}
                      maxLength={1000}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {formErrors.avatar_url && (
                      <Text style={modalStyles.errorText}>{formErrors.avatar_url}</Text>
                    )}

                    {/* Preview del Avatar */}
                    {formData.avatar_url && formData.avatar_url.startsWith('http') && (
                      <View style={{
                        backgroundColor: 'rgba(71, 85, 105, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        borderWidth: 1,
                        borderColor: 'rgba(102, 126, 234, 0.3)',
                      }}>
                        <Image
                          source={{ uri: formData.avatar_url }}
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            borderWidth: 2,
                            borderColor: 'rgba(102, 126, 234, 0.5)',
                            backgroundColor: 'rgba(71, 85, 105, 0.5)',
                          }}
                          resizeMode="cover"
                        />
                        <View style={{ flex: 1 }}>
                          <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            marginBottom: 4,
                          }}>
                            <Ionicons name="image" size={16} color="#667eea" />
                            <Text style={{
                              color: '#667eea',
                              fontSize: 13,
                              fontWeight: '600',
                            }}>
                              Vista previa
                            </Text>
                          </View>
                          <Text style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: 11,
                          }}>
                            Cargando imagen...
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Advertencia sobre URLs externas */}
                    {formData.avatar_url && !isValidImageUrl(formData.avatar_url) && formData.avatar_url.startsWith('http') && (
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: 8,
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        padding: 12,
                        borderRadius: 8,
                        borderLeftWidth: 3,
                        borderLeftColor: '#fbbf24',
                      }}>
                        <Ionicons name="warning" size={18} color="#fbbf24" />
                        <View style={{ flex: 1 }}>
                          <Text style={{
                            color: '#fbbf24',
                            fontSize: 12,
                            fontWeight: '600',
                            marginBottom: 4,
                          }}>
                            URL Externa Detectada
                          </Text>
                          <Text style={{
                            color: 'rgba(251, 191, 36, 0.8)',
                            fontSize: 11,
                          }}>
                            Esta URL puede funcionar, pero algunos sitios bloquean imágenes externas. Si no se muestra correctamente, prueba descargando la imagen y subiéndola a un servicio como Imgur.
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  <Text style={modalStyles.helperText}>
                    ✅ Acepta URLs de: Google Images, Pinterest, Instagram, Twitter, etc.
                  </Text>
                  <Text style={[modalStyles.helperText, { marginTop: 4 }]}>
                    💡 Copia la URL de la imagen (clic derecho → Copiar dirección de imagen)
                  </Text>
                  <Text style={[modalStyles.helperText, { marginTop: 4 }]}>
                    ⚠️ Algunas plataformas pueden bloquear el acceso externo
                  </Text>
                </View>

                {/* COLOR */}
                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Color del Tema</Text>

                  {/* Input y Preview con botón de paleta */}
                  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <TextInput
                      style={[modalStyles.input, { flex: 1 }]}
                      placeholder="#667eea"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={formData.color_tema}
                      onChangeText={(text) => {
                        const hex = text.startsWith('#') ? text : '#' + text;
                        setFormData({ ...formData, color_tema: hex });
                      }}
                      maxLength={7}
                      autoCapitalize="none"
                    />

                    {/* Preview del color */}
                    <View style={{
                      width: 50,
                      height: 50,
                      borderRadius: 8,
                      backgroundColor: formData.color_tema || '#667eea',
                      borderWidth: 2,
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }} />

                    {/* Botón para abrir paleta */}
                    <TouchableOpacity
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 8,
                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                        borderWidth: 2,
                        borderColor: '#667eea',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onPress={() => setShowColorPicker(!showColorPicker)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={showColorPicker ? "close" : "color-palette"}
                        size={24}
                        color="#667eea"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Paleta desplegable */}
                  {showColorPicker && (
                    <View style={{
                      marginTop: 12,
                      backgroundColor: 'rgba(71, 85, 105, 0.3)',
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: 'rgba(148, 163, 184, 0.3)',
                    }}>
                      <Text style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: 13,
                        fontWeight: '600',
                        marginBottom: 12,
                      }}>
                        🎨 Selecciona un Color
                      </Text>

                      {/* Fila 1: Colores Principales */}
                      <View style={{ marginBottom: 12 }}>
                        <Text style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: 11,
                          marginBottom: 8,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}>
                          Principales
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {[
                            { color: '#667eea', name: 'Índigo' },
                            { color: '#3b82f6', name: 'Azul' },
                            { color: '#8b5cf6', name: 'Púrpura' },
                            { color: '#ec4899', name: 'Rosa' },
                            { color: '#f43f5e', name: 'Rojo' },
                          ].map((item) => (
                            <TouchableOpacity
                              key={item.color}
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: 8,
                                backgroundColor: item.color,
                                borderWidth: formData.color_tema === item.color ? 3 : 2,
                                borderColor: formData.color_tema === item.color
                                  ? '#ffffff'
                                  : 'rgba(255, 255, 255, 0.2)',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                              onPress={() => {
                                setFormData({ ...formData, color_tema: item.color });
                                setShowColorPicker(false);
                              }}
                              activeOpacity={0.7}
                            >
                              {formData.color_tema === item.color && (
                                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      {/* Fila 2: Colores Cálidos */}
                      <View style={{ marginBottom: 12 }}>
                        <Text style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: 11,
                          marginBottom: 8,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}>
                          Cálidos
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {[
                            { color: '#f59e0b', name: 'Naranja' },
                            { color: '#fb923c', name: 'Mandarina' },
                            { color: '#ef4444', name: 'Rojo Vivo' },
                            { color: '#dc2626', name: 'Carmesí' },
                            { color: '#be185d', name: 'Magenta' },
                          ].map((item) => (
                            <TouchableOpacity
                              key={item.color}
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: 8,
                                backgroundColor: item.color,
                                borderWidth: formData.color_tema === item.color ? 3 : 2,
                                borderColor: formData.color_tema === item.color
                                  ? '#ffffff'
                                  : 'rgba(255, 255, 255, 0.2)',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                              onPress={() => {
                                setFormData({ ...formData, color_tema: item.color });
                                setShowColorPicker(false);
                              }}
                              activeOpacity={0.7}
                            >
                              {formData.color_tema === item.color && (
                                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      {/* Fila 3: Colores Fríos */}
                      <View style={{ marginBottom: 12 }}>
                        <Text style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: 11,
                          marginBottom: 8,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}>
                          Fríos
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {[
                            { color: '#06b6d4', name: 'Cyan' },
                            { color: '#0891b2', name: 'Turquesa' },
                            { color: '#0e7490', name: 'Azul Océano' },
                            { color: '#0d9488', name: 'Verde Azulado' },
                            { color: '#14b8a6', name: 'Teal' },
                          ].map((item) => (
                            <TouchableOpacity
                              key={item.color}
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: 8,
                                backgroundColor: item.color,
                                borderWidth: formData.color_tema === item.color ? 3 : 2,
                                borderColor: formData.color_tema === item.color
                                  ? '#ffffff'
                                  : 'rgba(255, 255, 255, 0.2)',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                              onPress={() => {
                                setFormData({ ...formData, color_tema: item.color });
                                setShowColorPicker(false);
                              }}
                              activeOpacity={0.7}
                            >
                              {formData.color_tema === item.color && (
                                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      {/* Fila 4: Colores Naturales */}
                      <View>
                        <Text style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: 11,
                          marginBottom: 8,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}>
                          Naturales
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {[
                            { color: '#10b981', name: 'Verde' },
                            { color: '#22c55e', name: 'Esmeralda' },
                            { color: '#84cc16', name: 'Lima' },
                            { color: '#eab308', name: 'Amarillo' },
                            { color: '#64748b', name: 'Pizarra' },
                          ].map((item) => (
                            <TouchableOpacity
                              key={item.color}
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: 8,
                                backgroundColor: item.color,
                                borderWidth: formData.color_tema === item.color ? 3 : 2,
                                borderColor: formData.color_tema === item.color
                                  ? '#ffffff'
                                  : 'rgba(255, 255, 255, 0.2)',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                              onPress={() => {
                                setFormData({ ...formData, color_tema: item.color });
                                setShowColorPicker(false);
                              }}
                              activeOpacity={0.7}
                            >
                              {formData.color_tema === item.color && (
                                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                        {formErrors.color_tema && (
                          <Text style={modalStyles.errorText}>{formErrors.color_tema}</Text>
                        )}
                      </View>
                    </View>
                  )}

                  <Text style={modalStyles.helperText}>
                    💡 Haz clic en 🎨 para ver más colores o ingresa tu código hexadecimal
                  </Text>
                </View>
              </View>

              {/* ============ SECCIÓN: MENSAJES PREDEFINIDOS ============ */}
              <View style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>💬 Mensajes Predefinidos</Text>

                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Mensaje de Bienvenida *</Text>
                  <TextInput
                    style={[modalStyles.textArea, formErrors.mensaje_bienvenida && modalStyles.inputError]}
                    placeholder="¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte?"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={formData.mensaje_bienvenida}
                    onChangeText={(text) => setFormData({ ...formData, mensaje_bienvenida: text })}
                    multiline
                    numberOfLines={3}
                    maxLength={500}
                  />
                  {formErrors.mensaje_bienvenida && (
                    <Text style={modalStyles.errorText}>{formErrors.mensaje_bienvenida}</Text>
                  )}
                  <Text style={modalStyles.helperText}>
                    Primer mensaje que verá el usuario al iniciar conversación
                  </Text>
                </View>

                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Mensaje de Despedida *</Text>
                  <TextInput
                    style={[modalStyles.textArea, formErrors.mensaje_despedida && modalStyles.inputError]}
                    placeholder="¡Hasta pronto! Fue un gusto ayudarte."
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={formData.mensaje_despedida}
                    onChangeText={(text) => setFormData({ ...formData, mensaje_despedida: text })}
                    multiline
                    numberOfLines={3}
                    maxLength={500}
                  />
                  {formErrors.mensaje_despedida && (
                    <Text style={modalStyles.errorText}>{formErrors.mensaje_despedida}</Text>
                  )}
                  <Text style={modalStyles.helperText}>
                    Mensaje cuando el usuario finaliza la conversación
                  </Text>
                </View>

                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Mensaje de Derivación *</Text>
                  <TextInput
                    style={[modalStyles.textArea, formErrors.mensaje_derivacion && modalStyles.inputError]}
                    placeholder="Voy a transferir tu consulta a un especialista humano..."
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={formData.mensaje_derivacion}
                    onChangeText={(text) => setFormData({ ...formData, mensaje_derivacion: text })}
                    multiline
                    numberOfLines={3}
                    maxLength={500}
                  />
                  {formErrors.mensaje_derivacion && (
                    <Text style={modalStyles.errorText}>{formErrors.mensaje_derivacion}</Text>
                  )}
                  <Text style={modalStyles.helperText}>
                    Mensaje cuando se deriva a otro agente o humano
                  </Text>
                </View>

                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Mensaje Fuera de Horario *</Text>
                  <TextInput
                    style={[modalStyles.textArea, formErrors.mensaje_fuera_horario && modalStyles.inputError]}
                    placeholder="Gracias por escribir. Nuestro horario es Lunes-Viernes 8am-5pm..."
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={formData.mensaje_fuera_horario}
                    onChangeText={(text) => setFormData({ ...formData, mensaje_fuera_horario: text })}
                    multiline
                    numberOfLines={3}
                    maxLength={500}
                  />
                  {formErrors.mensaje_fuera_horario && (
                    <Text style={modalStyles.errorText}>{formErrors.mensaje_fuera_horario}</Text>
                  )}
                  <Text style={modalStyles.helperText}>
                    Mensaje automático cuando se escribe fuera del horario
                  </Text>
                </View>
              </View>

              {/* Configuración de IA */}
              <View style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>🤖 Configuración de IA</Text>

                {/* ⭐ CAMPO BLOQUEADO DE MODELO IA ⭐ */}
                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Modelo de IA</Text>
                  <View style={{
                    backgroundColor: 'rgba(71, 85, 105, 0.3)',
                    borderWidth: 1,
                    borderColor: 'rgba(148, 163, 184, 0.3)',
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Ionicons name="cube-outline" size={20} color="#94a3b8" />
                      <Text style={{
                        color: '#94a3b8',
                        fontSize: 15,
                        fontWeight: '500',
                      }}>
                        llama3:8b
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: 'rgba(148, 163, 184, 0.2)',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}>
                      <Text style={{
                        color: '#94a3b8',
                        fontSize: 11,
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}>
                        Bloqueado
                      </Text>
                    </View>
                  </View>
                  <Text style={modalStyles.helperText}>
                    Este modelo está configurado por defecto y no se puede cambiar
                  </Text>
                </View>

                {/* Temperatura (Creatividad) */}
                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Temperatura (Creatividad) *</Text>

                  {/* Opciones de Temperatura */}
                  <View style={{ gap: 12 }}>
                    {/* OPCIÓN 1: Balanceado (0.6) - RECOMENDADO */}
                    <TouchableOpacity
                      style={[
                        {
                          backgroundColor: formData.temperatura === '0.6'
                            ? 'rgba(102, 126, 234, 0.2)'
                            : 'rgba(71, 85, 105, 0.3)',
                          borderWidth: 2,
                          borderColor: formData.temperatura === '0.6'
                            ? '#667eea'
                            : 'rgba(148, 163, 184, 0.3)',
                          borderRadius: 12,
                          padding: 16,
                        },
                        formErrors.temperatura && { borderColor: '#ef4444' }
                      ]}
                      onPress={() => setFormData({ ...formData, temperatura: '0.6' })}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <View style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor: formData.temperatura === '0.6' ? '#667eea' : '#94a3b8',
                            backgroundColor: formData.temperatura === '0.6' ? '#667eea' : 'transparent',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                            {formData.temperatura === '0.6' && (
                              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                            )}
                          </View>
                          <Text style={{
                            color: formData.temperatura === '0.6' ? '#ffffff' : '#94a3b8',
                            fontSize: 16,
                            fontWeight: '600',
                          }}>
                            ⚖️ Balanceado (0.6)
                          </Text>
                        </View>
                        <View style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.2)',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: '#22c55e',
                        }}>
                          <Text style={{ color: '#22c55e', fontSize: 11, fontWeight: '700' }}>
                            ✨ RECOMENDADO
                          </Text>
                        </View>
                      </View>
                      <Text style={{
                        color: formData.temperatura === '0.6' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                        fontSize: 13,
                        marginBottom: 8,
                      }}>
                        Uso general - Ideal para la mayoría de casos
                      </Text>
                      {formData.temperatura === '0.6' && (
                        <View style={{
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          borderRadius: 8,
                          padding: 12,
                          gap: 6,
                        }}>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                              Equilibrio perfecto entre precisión y creatividad
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                              Respuestas coherentes y útiles
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                              Funciona bien en soporte, consultas y asesoría
                            </Text>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* OPCIÓN 2: Creativo (0.9) */}
                    <TouchableOpacity
                      style={{
                        backgroundColor: formData.temperatura === '0.9'
                          ? 'rgba(168, 85, 247, 0.2)'
                          : 'rgba(71, 85, 105, 0.3)',
                        borderWidth: 2,
                        borderColor: formData.temperatura === '0.9'
                          ? '#a855f7'
                          : 'rgba(148, 163, 184, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                      }}
                      onPress={() => setFormData({ ...formData, temperatura: '0.9' })}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <View style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: formData.temperatura === '0.9' ? '#a855f7' : '#94a3b8',
                          backgroundColor: formData.temperatura === '0.9' ? '#a855f7' : 'transparent',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                          {formData.temperatura === '0.9' && (
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                          )}
                        </View>
                        <Text style={{
                          color: formData.temperatura === '0.9' ? '#ffffff' : '#94a3b8',
                          fontSize: 16,
                          fontWeight: '600',
                        }}>
                          🎨 Creativo (0.9)
                        </Text>
                      </View>
                      <Text style={{
                        color: formData.temperatura === '0.9' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                        fontSize: 13,
                        marginBottom: 8,
                      }}>
                        Para redacción, ideas y contenido variado
                      </Text>
                      {formData.temperatura === '0.9' && (
                        <View style={{
                          backgroundColor: 'rgba(168, 85, 247, 0.1)',
                          borderRadius: 8,
                          padding: 12,
                          gap: 6,
                        }}>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                              Respuestas más variadas y originales
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                              Ideal para generar contenido creativo
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#fbbf24', fontSize: 12 }}>⚠</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                              Puede ser menos preciso en datos técnicos
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#fbbf24', fontSize: 12 }}>⚠</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                              Ocasionalmente divaga del tema principal
                            </Text>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* OPCIÓN 3: Muy Creativo (1.2) */}
                    <TouchableOpacity
                      style={{
                        backgroundColor: formData.temperatura === '1.2'
                          ? 'rgba(251, 146, 60, 0.2)'
                          : 'rgba(71, 85, 105, 0.3)',
                        borderWidth: 2,
                        borderColor: formData.temperatura === '1.2'
                          ? '#fb923c'
                          : 'rgba(148, 163, 184, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                      }}
                      onPress={() => setFormData({ ...formData, temperatura: '1.2' })}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <View style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: formData.temperatura === '1.2' ? '#fb923c' : '#94a3b8',
                          backgroundColor: formData.temperatura === '1.2' ? '#fb923c' : 'transparent',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                          {formData.temperatura === '1.2' && (
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                          )}
                        </View>
                        <Text style={{
                          color: formData.temperatura === '1.2' ? '#ffffff' : '#94a3b8',
                          fontSize: 16,
                          fontWeight: '600',
                        }}>
                          🚀 Muy Creativo (1.2)
                        </Text>
                      </View>
                      <Text style={{
                        color: formData.temperatura === '1.2' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                        fontSize: 13,
                        marginBottom: 8,
                      }}>
                        Experimental - Solo para casos especiales
                      </Text>
                      {formData.temperatura === '1.2' && (
                        <View style={{
                          backgroundColor: 'rgba(251, 146, 60, 0.1)',
                          borderRadius: 8,
                          padding: 12,
                          gap: 6,
                        }}>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                              Máxima originalidad e innovación
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                              Útil para lluvia de ideas o brainstorming
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#ef4444', fontSize: 12 }}>✗</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                              Respuestas impredecibles e inconsistentes
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#ef4444', fontSize: 12 }}>✗</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                              Puede generar contenido irrelevante
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#ef4444', fontSize: 12 }}>✗</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                              No recomendado para uso en producción
                            </Text>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  {formErrors.temperatura && (
                    <Text style={modalStyles.errorText}>{formErrors.temperatura}</Text>
                  )}
                </View>


                {/*MAXIMO DE TOKENS*/}
                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Tokens Máximos</Text>

                  {/* Opciones de Tokens */}
                  <View style={{ gap: 12 }}>
                    {/* OPCIÓN 1: Respuestas Cortas (500) */}
                    <TouchableOpacity
                      style={[
                        {
                          backgroundColor: formData.max_tokens === '500'
                            ? 'rgba(59, 130, 246, 0.2)'
                            : 'rgba(71, 85, 105, 0.3)',
                          borderWidth: 2,
                          borderColor: formData.max_tokens === '500'
                            ? '#3b82f6'
                            : 'rgba(148, 163, 184, 0.3)',
                          borderRadius: 12,
                          padding: 16,
                        },
                        formErrors.max_tokens && { borderColor: '#ef4444' }
                      ]}
                      onPress={() => setFormData({ ...formData, max_tokens: '500' })}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <View style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: formData.max_tokens === '500' ? '#3b82f6' : '#94a3b8',
                          backgroundColor: formData.max_tokens === '500' ? '#3b82f6' : 'transparent',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                          {formData.max_tokens === '500' && (
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                          )}
                        </View>
                        <Text style={{
                          color: formData.max_tokens === '500' ? '#ffffff' : '#94a3b8',
                          fontSize: 16,
                          fontWeight: '600',
                        }}>
                          ⚡ Cortas (500 tokens)
                        </Text>
                      </View>
                      <Text style={{
                        color: formData.max_tokens === '500' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                        fontSize: 13,
                        marginBottom: 8,
                      }}>
                        Respuestas rápidas y directas
                      </Text>
                      {formData.max_tokens === '500' && (
                        <View style={{
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderRadius: 8,
                          padding: 12,
                          gap: 6,
                        }}>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                              Respuestas ultra rápidas
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                              Consumo mínimo de recursos
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#ef4444', fontSize: 12 }}>✗</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                              Respuestas muy limitadas en extensión
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#ef4444', fontSize: 12 }}>✗</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                              No apta para explicaciones detalladas
                            </Text>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* OPCIÓN 2: FAQ (800) */}
                    <TouchableOpacity
                      style={{
                        backgroundColor: formData.max_tokens === '800'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(71, 85, 105, 0.3)',
                        borderWidth: 2,
                        borderColor: formData.max_tokens === '800'
                          ? '#10b981'
                          : 'rgba(148, 163, 184, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                      }}
                      onPress={() => setFormData({ ...formData, max_tokens: '800' })}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <View style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: formData.max_tokens === '800' ? '#10b981' : '#94a3b8',
                          backgroundColor: formData.max_tokens === '800' ? '#10b981' : 'transparent',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                          {formData.max_tokens === '800' && (
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                          )}
                        </View>
                        <Text style={{
                          color: formData.max_tokens === '800' ? '#ffffff' : '#94a3b8',
                          fontSize: 16,
                          fontWeight: '600',
                        }}>
                          💬 FAQ (800 tokens)
                        </Text>
                      </View>
                      <Text style={{
                        color: formData.max_tokens === '800' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                        fontSize: 13,
                        marginBottom: 8,
                      }}>
                        Ideal para preguntas frecuentes
                      </Text>
                      {formData.max_tokens === '800' && (
                        <View style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          borderRadius: 8,
                          padding: 12,
                          gap: 6,
                        }}>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                              Perfecto para preguntas y respuestas
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                              Buen balance velocidad/detalle
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#fbbf24', fontSize: 12 }}>⚠</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                              Puede quedarse corto en temas complejos
                            </Text>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* OPCIÓN 3: Normal (1000) - RECOMENDADO */}
                    <TouchableOpacity
                      style={{
                        backgroundColor: formData.max_tokens === '1000'
                          ? 'rgba(102, 126, 234, 0.2)'
                          : 'rgba(71, 85, 105, 0.3)',
                        borderWidth: 2,
                        borderColor: formData.max_tokens === '1000'
                          ? '#667eea'
                          : 'rgba(148, 163, 184, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                      }}
                      onPress={() => setFormData({ ...formData, max_tokens: '1000' })}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <View style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor: formData.max_tokens === '1000' ? '#667eea' : '#94a3b8',
                            backgroundColor: formData.max_tokens === '1000' ? '#667eea' : 'transparent',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                            {formData.max_tokens === '1000' && (
                              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                            )}
                          </View>
                          <Text style={{
                            color: formData.max_tokens === '1000' ? '#ffffff' : '#94a3b8',
                            fontSize: 16,
                            fontWeight: '600',
                          }}>
                            ⚖️ Normal (1000 tokens)
                          </Text>
                        </View>
                        <View style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.2)',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: '#22c55e',
                        }}>
                          <Text style={{ color: '#22c55e', fontSize: 11, fontWeight: '700' }}>
                            ✨ RECOMENDADO
                          </Text>
                        </View>
                      </View>
                      <Text style={{
                        color: formData.max_tokens === '1000' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                        fontSize: 13,
                        marginBottom: 8,
                      }}>
                        Uso general - Respuestas completas
                      </Text>
                      {formData.max_tokens === '1000' && (
                        <View style={{
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          borderRadius: 8,
                          padding: 12,
                          gap: 6,
                        }}>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                              Respuestas completas y bien estructuradas
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                              Versátil para la mayoría de casos
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                              Consumo equilibrado de recursos
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#fbbf24', fontSize: 12 }}>⚠</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                              Consumo moderado de tokens
                            </Text>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* OPCIÓN 4: Detalladas (2000) */}
                    <TouchableOpacity
                      style={{
                        backgroundColor: formData.max_tokens === '2000'
                          ? 'rgba(168, 85, 247, 0.2)'
                          : 'rgba(71, 85, 105, 0.3)',
                        borderWidth: 2,
                        borderColor: formData.max_tokens === '2000'
                          ? '#a855f7'
                          : 'rgba(148, 163, 184, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                      }}
                      onPress={() => setFormData({ ...formData, max_tokens: '2000' })}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <View style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: formData.max_tokens === '2000' ? '#a855f7' : '#94a3b8',
                          backgroundColor: formData.max_tokens === '2000' ? '#a855f7' : 'transparent',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                          {formData.max_tokens === '2000' && (
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                          )}
                        </View>
                        <Text style={{
                          color: formData.max_tokens === '2000' ? '#ffffff' : '#94a3b8',
                          fontSize: 16,
                          fontWeight: '600',
                        }}>
                          📚 Detalladas (2000 tokens)
                        </Text>
                      </View>
                      <Text style={{
                        color: formData.max_tokens === '2000' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                        fontSize: 13,
                        marginBottom: 8,
                      }}>
                        Explicaciones extensas y profundas
                      </Text>
                      {formData.max_tokens === '2000' && (
                        <View style={{
                          backgroundColor: 'rgba(168, 85, 247, 0.1)',
                          borderRadius: 8,
                          padding: 12,
                          gap: 6,
                        }}>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                              Respuestas muy detalladas y exhaustivas
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                              Ideal para consultas complejas
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#ef4444', fontSize: 12 }}>✗</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                              Mayor consumo de recursos y costos
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#ef4444', fontSize: 12 }}>✗</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                              Respuestas más lentas
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#ef4444', fontSize: 12 }}>✗</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                              Puede incluir información innecesaria
                            </Text>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  {formErrors.max_tokens && (
                    <Text style={modalStyles.errorText}>{formErrors.max_tokens}</Text>
                  )}
                </View>

                {/* PROMPT SISTEMA */}
                {/* ⭐ CAMPO 1: MISIÓN */}
                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Misión del Agente *</Text>
                  <TextInput
                    style={[modalStyles.textArea, formErrors.prompt_mision && modalStyles.inputError]}
                    placeholder="Ej: Ayudar a estudiantes a resolver problemas con sus cuentas y acceso a sistemas"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={formData.prompt_mision}
                    onChangeText={(text) => setFormData({ ...formData, prompt_mision: text })}
                    multiline
                    numberOfLines={3}
                    maxLength={300}
                  />
                  {formErrors.prompt_mision && (
                    <Text style={modalStyles.errorText}>{formErrors.prompt_mision}</Text>
                  )}
                  <Text style={modalStyles.helperText}>
                    Define el objetivo principal del agente
                  </Text>
                </View>

                {/* ⭐ CAMPO 2: REGLAS (Mínimo 2) */}
                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Reglas de Comportamiento * (Mínimo 2)</Text>

                  {formData.prompt_reglas.map((regla, index) => (
                    <View key={index} style={{ marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ color: '#667eea', fontSize: 16, fontWeight: '700' }}>
                          {index + 1}.
                        </Text>
                        <TextInput
                          style={[
                            modalStyles.input,
                            { flex: 1 },
                            formErrors[`prompt_regla_${index}`] && modalStyles.inputError
                          ]}
                          placeholder={`Regla ${index + 1}: Ej: Responde siempre en español`}
                          placeholderTextColor="rgba(255, 255, 255, 0.4)"
                          value={regla}
                          onChangeText={(text) => {
                            const nuevasReglas = [...formData.prompt_reglas];
                            nuevasReglas[index] = text;
                            setFormData({ ...formData, prompt_reglas: nuevasReglas });
                          }}
                          maxLength={200}
                        />
                        {/* Botón eliminar (solo si hay más de 2) */}
                        {formData.prompt_reglas.length > 2 && (
                          <TouchableOpacity
                            onPress={() => {
                              const nuevasReglas = formData.prompt_reglas.filter((_, i) => i !== index);
                              setFormData({ ...formData, prompt_reglas: nuevasReglas });
                            }}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 8,
                              backgroundColor: 'rgba(239, 68, 68, 0.2)',
                              borderWidth: 1,
                              borderColor: '#ef4444',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Ionicons name="trash-outline" size={18} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                      {formErrors[`prompt_regla_${index}`] && (
                        <Text style={modalStyles.errorText}>{formErrors[`prompt_regla_${index}`]}</Text>
                      )}
                    </View>
                  ))}

                  {/* Botón agregar regla */}
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: 'rgba(102, 126, 234, 0.2)',
                      borderWidth: 2,
                      borderColor: '#667eea',
                      borderStyle: 'dashed',
                      borderRadius: 12,
                      padding: 14,
                      marginTop: 8,
                    }}
                    onPress={() => {
                      setFormData({
                        ...formData,
                        prompt_reglas: [...formData.prompt_reglas, '']
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#667eea" />
                    <Text style={{ color: '#667eea', fontSize: 14, fontWeight: '600' }}>
                      Agregar otra regla
                    </Text>
                  </TouchableOpacity>

                  <Text style={modalStyles.helperText}>
                    Define comportamientos específicos (mínimo 2, máximo recomendado 5)
                  </Text>
                </View>

                {/* ⭐ CAMPO 3: TONO (Selector) */}
                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Tono de Comunicación *</Text>

                  <View style={{ gap: 12 }}>
                    {/* Opción: Formal */}
                    <TouchableOpacity
                      style={{
                        backgroundColor: formData.prompt_tono === 'formal'
                          ? 'rgba(59, 130, 246, 0.2)'
                          : 'rgba(71, 85, 105, 0.3)',
                        borderWidth: 2,
                        borderColor: formData.prompt_tono === 'formal'
                          ? '#3b82f6'
                          : 'rgba(148, 163, 184, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                      }}
                      onPress={() => setFormData({ ...formData, prompt_tono: 'formal' })}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: formData.prompt_tono === 'formal' ? '#3b82f6' : '#94a3b8',
                          backgroundColor: formData.prompt_tono === 'formal' ? '#3b82f6' : 'transparent',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                          {formData.prompt_tono === 'formal' && (
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                          )}
                        </View>
                        <Text style={{
                          color: formData.prompt_tono === 'formal' ? '#ffffff' : '#94a3b8',
                          fontSize: 16,
                          fontWeight: '600',
                        }}>
                          🎩 Formal
                        </Text>
                      </View>
                      <Text style={{
                        color: formData.prompt_tono === 'formal' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                        fontSize: 13,
                        marginTop: 8,
                      }}>
                        Profesional, preciso y corporativo
                      </Text>
                    </TouchableOpacity>

                    {/* Opción: Amigable (RECOMENDADO) */}
                    <TouchableOpacity
                      style={{
                        backgroundColor: formData.prompt_tono === 'amigable'
                          ? 'rgba(102, 126, 234, 0.2)'
                          : 'rgba(71, 85, 105, 0.3)',
                        borderWidth: 2,
                        borderColor: formData.prompt_tono === 'amigable'
                          ? '#667eea'
                          : 'rgba(148, 163, 184, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                      }}
                      onPress={() => setFormData({ ...formData, prompt_tono: 'amigable' })}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <View style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor: formData.prompt_tono === 'amigable' ? '#667eea' : '#94a3b8',
                            backgroundColor: formData.prompt_tono === 'amigable' ? '#667eea' : 'transparent',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                            {formData.prompt_tono === 'amigable' && (
                              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                            )}
                          </View>
                          <Text style={{
                            color: formData.prompt_tono === 'amigable' ? '#ffffff' : '#94a3b8',
                            fontSize: 16,
                            fontWeight: '600',
                          }}>
                            😊 Amigable
                          </Text>
                        </View>
                        <View style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.2)',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: '#22c55e',
                        }}>
                          <Text style={{ color: '#22c55e', fontSize: 11, fontWeight: '700' }}>
                            ✨ RECOMENDADO
                          </Text>
                        </View>
                      </View>
                      <Text style={{
                        color: formData.prompt_tono === 'amigable' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                        fontSize: 13,
                      }}>
                        Cercano, empático y profesional
                      </Text>
                    </TouchableOpacity>

                    {/* Opción: Técnico */}
                    <TouchableOpacity
                      style={{
                        backgroundColor: formData.prompt_tono === 'tecnico'
                          ? 'rgba(168, 85, 247, 0.2)'
                          : 'rgba(71, 85, 105, 0.3)',
                        borderWidth: 2,
                        borderColor: formData.prompt_tono === 'tecnico'
                          ? '#a855f7'
                          : 'rgba(148, 163, 184, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                      }}
                      onPress={() => setFormData({ ...formData, prompt_tono: 'tecnico' })}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: formData.prompt_tono === 'tecnico' ? '#a855f7' : '#94a3b8',
                          backgroundColor: formData.prompt_tono === 'tecnico' ? '#a855f7' : 'transparent',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                          {formData.prompt_tono === 'tecnico' && (
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                          )}
                        </View>
                        <Text style={{
                          color: formData.prompt_tono === 'tecnico' ? '#ffffff' : '#94a3b8',
                          fontSize: 16,
                          fontWeight: '600',
                        }}>
                          ⚙️ Técnico
                        </Text>
                      </View>
                      <Text style={{
                        color: formData.prompt_tono === 'tecnico' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                        fontSize: 13,
                        marginTop: 8,
                      }}>
                        Lenguaje técnico, soluciones concretas
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {formErrors.prompt_tono && (
                    <Text style={modalStyles.errorText}>{formErrors.prompt_tono}</Text>
                  )}
                </View>
                {formErrors.prompt_sistema && (
                  <Text style={modalStyles.errorText}>{formErrors.prompt_sistema}</Text>
                )}
              </View>


              {/* ⭐ NUEVO CAMPO: Especialización */}
              <View style={modalStyles.formGroup}>
                <Text style={modalStyles.label}>
                  Especialización del Agente
                  <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 13 }}> (Opcional)</Text>
                </Text>
                <TextInput
                  style={[
                    modalStyles.textArea,
                    formErrors.prompt_especializado && modalStyles.inputError
                  ]}
                  placeholder="Ej: Ayuda con requisitos de prácticas, formatos, horas necesarias, instituciones aliadas, procesos de vinculación..."
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={formData.prompt_especializado}
                  onChangeText={(text) => setFormData({ ...formData, prompt_especializado: text })}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
                {formErrors.prompt_especializado && (
                  <Text style={modalStyles.errorText}>{formErrors.prompt_especializado}</Text>
                )}
                <Text style={modalStyles.helperText}>
                  💡 Describe temas específicos, servicios o áreas de ayuda del agente
                </Text>

                {/* Preview del texto */}
                {formData.prompt_especializado && formData.prompt_especializado.length > 0 && (
                  <View style={{
                    marginTop: 12,
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: 8,
                    padding: 12,
                    borderLeftWidth: 3,
                    borderLeftColor: '#667eea',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Ionicons name="information-circle" size={16} color="#667eea" />
                      <Text style={{ color: '#667eea', fontSize: 12, fontWeight: '600' }}>
                        Vista previa de especialización
                      </Text>
                    </View>
                    <Text style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: 13,
                      lineHeight: 20,
                    }}>
                      {formData.prompt_especializado}
                    </Text>
                    <Text style={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: 11,
                      marginTop: 8,
                    }}>
                      {formData.prompt_especializado.length} / 500 caracteres
                    </Text>
                  </View>
                )}
              </View>

              {/* Configuración Regional */}
              <View style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>🌍 Configuración Regional</Text>
                {/* ============ SECCIÓN: HORARIOS DE ATENCIÓN ============ */}
                <View style={modalStyles.section}>
                  <Text style={modalStyles.sectionTitle}>🕐 Horarios de Atención</Text>

                  <View style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                    borderLeftWidth: 3,
                    borderLeftColor: '#3b82f6'
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name="information-circle" size={16} color="#3b82f6" />
                      <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: '600', flex: 1 }}>
                        Define cuándo el agente estará disponible para atender usuarios
                      </Text>
                    </View>
                  </View>

                  {/* Renderizar cada día */}
                  {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map((dia) => {
                    const diaConfig = formData.horarios[dia];
                    const diaLabel = dia.charAt(0).toUpperCase() + dia.slice(1);

                    return (
                      <View key={dia} style={modalStyles.formGroup}>
                        {/* Header del día con switch */}
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 12,
                          backgroundColor: diaConfig.activo
                            ? 'rgba(102, 126, 234, 0.1)'
                            : 'rgba(71, 85, 105, 0.2)',
                          padding: 14,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: diaConfig.activo
                            ? 'rgba(102, 126, 234, 0.3)'
                            : 'rgba(148, 163, 184, 0.2)'
                        }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Ionicons
                              name="calendar"
                              size={18}
                              color={diaConfig.activo ? '#667eea' : '#94a3b8'}
                            />
                            <Text style={{
                              color: diaConfig.activo ? '#ffffff' : '#94a3b8',
                              fontSize: 15,
                              fontWeight: '600'
                            }}>
                              {diaLabel}
                            </Text>
                          </View>
                          <Switch
                            value={diaConfig.activo}
                            onValueChange={(value) => {
                              const nuevosHorarios = { ...formData.horarios };
                              nuevosHorarios[dia] = {
                                ...nuevosHorarios[dia],
                                activo: value,
                                bloques: value ? [{ inicio: '08:00', fin: '17:00' }] : []
                              };
                              setFormData({ ...formData, horarios: nuevosHorarios });
                            }}
                            trackColor={{ false: '#475569', true: '#667eea' }}
                            thumbColor={diaConfig.activo ? '#ffffff' : '#cbd5e1'}
                          />
                        </View>

                        {/* Bloques horarios si está activo */}
                        {diaConfig.activo && (
                          <View style={{ gap: 10 }}>
                            {diaConfig.bloques.map((bloque, index) => (
                              <View key={index} style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 10,
                                backgroundColor: 'rgba(71, 85, 105, 0.3)',
                                padding: 12,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: 'rgba(148, 163, 184, 0.3)'
                              }}>
                                <Ionicons name="time" size={16} color="#667eea" />

                                {/* Hora inicio */}
                                <TextInput
                                  style={{
                                    flex: 1,
                                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                                    color: '#ffffff',
                                    padding: 10,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: 'rgba(102, 126, 234, 0.3)',
                                    fontSize: 14,
                                    textAlign: 'center'
                                  }}
                                  placeholder="08:00"
                                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                  value={bloque.inicio}
                                  onChangeText={(text) => {
                                    const nuevosHorarios = { ...formData.horarios };
                                    nuevosHorarios[dia].bloques[index].inicio = text;
                                    setFormData({ ...formData, horarios: nuevosHorarios });
                                  }}
                                  maxLength={5}
                                />

                                <Text style={{ color: '#94a3b8', fontSize: 14 }}>a</Text>

                                {/* Hora fin */}
                                <TextInput
                                  style={{
                                    flex: 1,
                                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                                    color: '#ffffff',
                                    padding: 10,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: 'rgba(102, 126, 234, 0.3)',
                                    fontSize: 14,
                                    textAlign: 'center'
                                  }}
                                  placeholder="17:00"
                                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                  value={bloque.fin}
                                  onChangeText={(text) => {
                                    const nuevosHorarios = { ...formData.horarios };
                                    nuevosHorarios[dia].bloques[index].fin = text;
                                    setFormData({ ...formData, horarios: nuevosHorarios });
                                  }}
                                  maxLength={5}
                                />

                                {/* Botón eliminar bloque */}
                                {diaConfig.bloques.length > 1 && (
                                  <TouchableOpacity
                                    onPress={() => {
                                      const nuevosHorarios = { ...formData.horarios };
                                      nuevosHorarios[dia].bloques = nuevosHorarios[dia].bloques.filter((_, i) => i !== index);
                                      setFormData({ ...formData, horarios: nuevosHorarios });
                                    }}
                                    style={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: 8,
                                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                      borderWidth: 1,
                                      borderColor: '#ef4444',
                                      justifyContent: 'center',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                  </TouchableOpacity>
                                )}
                              </View>
                            ))}

                            {/* Botón agregar bloque */}
                            <TouchableOpacity
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                borderWidth: 1,
                                borderStyle: 'dashed',
                                borderColor: '#667eea',
                                borderRadius: 8,
                                padding: 10,
                                justifyContent: 'center'
                              }}
                              onPress={() => {
                                const nuevosHorarios = { ...formData.horarios };
                                nuevosHorarios[dia].bloques.push({ inicio: '13:00', fin: '18:00' });
                                setFormData({ ...formData, horarios: nuevosHorarios });
                              }}
                            >
                              <Ionicons name="add-circle-outline" size={16} color="#667eea" />
                              <Text style={{ color: '#667eea', fontSize: 13, fontWeight: '600' }}>
                                Agregar otro horario
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  })}

                  <Text style={modalStyles.helperText}>
                    💡 Formato 24 horas (HH:MM). Puedes agregar varios bloques por día
                  </Text>
                </View>
                {/* Idioma Principal - BLOQUEADO */}
                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Idioma Principal</Text>
                  <View style={{
                    backgroundColor: 'rgba(71, 85, 105, 0.3)',
                    borderWidth: 1,
                    borderColor: 'rgba(148, 163, 184, 0.3)',
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Text style={{ fontSize: 20 }}>🇪🇸</Text>
                      <Text style={{
                        color: '#94a3b8',
                        fontSize: 15,
                        fontWeight: '500',
                      }}>
                        Español
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: 'rgba(148, 163, 184, 0.2)',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}>
                      <Text style={{
                        color: '#94a3b8',
                        fontSize: 11,
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}>
                        Bloqueado
                      </Text>
                    </View>
                  </View>
                  <Text style={modalStyles.helperText}>
                    El idioma está configurado en Español por defecto
                  </Text>
                </View>

                {/* Zona Horaria - BLOQUEADA */}
                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Zona Horaria</Text>
                  <View style={{
                    backgroundColor: 'rgba(71, 85, 105, 0.3)',
                    borderWidth: 1,
                    borderColor: 'rgba(148, 163, 184, 0.3)',
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Ionicons name="time-outline" size={20} color="#94a3b8" />
                      <Text style={{
                        color: '#94a3b8',
                        fontSize: 15,
                        fontWeight: '500',
                      }}>
                        America/Guayaquil (GMT-5)
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: 'rgba(148, 163, 184, 0.2)',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}>
                      <Text style={{
                        color: '#94a3b8',
                        fontSize: 11,
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}>
                        Bloqueado
                      </Text>
                    </View>
                  </View>
                  <Text style={modalStyles.helperText}>
                    La zona horaria está configurada para Ecuador
                  </Text>
                </View>

                {/* Estado del Agente - ACTIVO */}
                <View style={modalStyles.formGroup}>
                  <View style={modalStyles.switchContainer}>
                    <View>
                      <Text style={modalStyles.label}>Estado del Agente</Text>
                      <Text style={modalStyles.helperText}>
                        {formData.activo ? 'Agente activo y disponible' : 'Agente desactivado'}
                      </Text>
                    </View>
                    <Switch
                      value={formData.activo}
                      onValueChange={(value) => setFormData({ ...formData, activo: value })}
                      trackColor={{ false: '#475569', true: '#667eea' }}
                      thumbColor={formData.activo ? '#ffffff' : '#cbd5e1'}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={modalStyles.footer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingHorizontal: 4, flexGrow: 1, justifyContent: 'flex-end' }}
              >
                <TouchableOpacity
                  style={modalStyles.cancelButton}
                  onPress={() => setShowFormModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={modalStyles.saveButton}
                  onPress={handleSaveForm}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                  <Text style={modalStyles.saveButtonText}>
                    {formMode === 'create' ? 'Crear Agente' : 'Guardar Cambios'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============ MODAL DETALLES ============ */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            {selectedAgente && (
              <>
                <View style={modalStyles.header}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <View style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: getTipoBadgeStyles(selectedAgente.tipo_agente).bg,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: getTipoBadgeStyles(selectedAgente.tipo_agente).border,
                    }}>
                      <Text style={{ fontSize: 24 }}>{selectedAgente.icono || '🤖'}</Text>
                    </View>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text
                        style={[modalStyles.title, { fontSize: 20 }]}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {selectedAgente.nombre_agente}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                        <View style={[
                          modalStyles.badge,
                          {
                            backgroundColor: getTipoBadgeStyles(selectedAgente.tipo_agente).bg,
                            borderColor: getTipoBadgeStyles(selectedAgente.tipo_agente).border,
                          }
                        ]}>
                          <Text style={[
                            modalStyles.badgeText,
                            { color: getTipoBadgeStyles(selectedAgente.tipo_agente).text }
                          ]}>
                            {selectedAgente.tipo_agente}
                          </Text>
                        </View>
                        <View style={[
                          modalStyles.badge,
                          {
                            backgroundColor: selectedAgente.activo
                              ? 'rgba(34, 197, 94, 0.2)'
                              : 'rgba(148, 163, 184, 0.2)',
                            borderColor: selectedAgente.activo ? '#22c55e' : '#94a3b8',
                          }
                        ]}>
                          <View style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: selectedAgente.activo ? '#22c55e' : '#94a3b8',
                            marginRight: 6,
                          }} />
                          <Text style={[
                            modalStyles.badgeText,
                            { color: selectedAgente.activo ? '#22c55e' : '#94a3b8' }
                          ]}>
                            {selectedAgente.activo ? 'Activo' : 'Inactivo'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                    <Ionicons name="close" size={24} color="#ffffff" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={modalStyles.content} showsVerticalScrollIndicator={false}>

                  {/* Descripción */}
                  <View style={modalStyles.detailSection}>
                    <Text style={modalStyles.detailSectionTitle}>📝 Descripción</Text>
                    <View style={{
                      backgroundColor: 'rgba(71, 85, 105, 0.3)',
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: 'rgba(148, 163, 184, 0.3)',
                    }}>
                      <Text style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: 14,
                        lineHeight: 22,
                      }}>
                        {selectedAgente.descripcion || 'Sin descripción disponible'}
                      </Text>
                    </View>
                  </View>

                  {/* Información General */}
                  <View style={modalStyles.detailSection}>
                    <Text style={modalStyles.detailSectionTitle}>ℹ️ Información General</Text>
                    <View style={modalStyles.detailGrid}>
                      <View style={modalStyles.detailItem}>
                        <Ionicons name="briefcase" size={16} color="#667eea" />
                        <View style={{ flex: 1 }}>
                          <Text style={modalStyles.detailLabel}>Especialidad</Text>
                          <Text style={modalStyles.detailValue}>
                            {selectedAgente.area_especialidad || 'General'}
                          </Text>
                        </View>
                      </View>
                      <View style={modalStyles.detailItem}>
                        <Ionicons name="business" size={16} color="#667eea" />
                        <View style={{ flex: 1 }}>
                          <Text style={modalStyles.detailLabel}>Departamento</Text>
                          <Text style={modalStyles.detailValue}>
                            {selectedAgente.departamento_nombre || 'Sin asignar'}
                          </Text>
                        </View>
                      </View>
                      <View style={modalStyles.detailItem}>
                        <Ionicons name="flash" size={16} color="#667eea" />
                        <View style={{ flex: 1 }}>
                          <Text style={modalStyles.detailLabel}>Modelo</Text>
                          <Text style={modalStyles.detailValue}>
                            {formatModelName(selectedAgente.modelo_ia)}
                          </Text>
                        </View>
                      </View>
                      <View style={modalStyles.detailItem}>
                        <Ionicons name="thermometer" size={16} color="#667eea" />
                        <View style={{ flex: 1 }}>
                          <Text style={modalStyles.detailLabel}>Temperatura</Text>
                          <Text style={modalStyles.detailValue}>
                            {selectedAgente.temperatura || 'N/A'}
                          </Text>
                        </View>
                      </View>
                      <View style={modalStyles.detailItem}>
                        <Ionicons name="cube" size={16} color="#667eea" />
                        <View style={{ flex: 1 }}>
                          <Text style={modalStyles.detailLabel}>Max Tokens</Text>
                          <Text style={modalStyles.detailValue}>
                            {selectedAgente.max_tokens || 'N/A'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Configuración Regional */}
                  <View style={modalStyles.section}>
                    <Text style={modalStyles.sectionTitle}>🌍 Configuración Regional</Text>

                    {/* Idioma Principal - BLOQUEADO */}
                    <View style={modalStyles.formGroup}>
                      <Text style={modalStyles.label}>Idioma Principal</Text>
                      <View style={{
                        backgroundColor: 'rgba(71, 85, 105, 0.3)',
                        borderWidth: 1,
                        borderColor: 'rgba(148, 163, 184, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Text style={{ fontSize: 24 }}>🇪🇸</Text>
                          <Text style={{
                            color: '#94a3b8',
                            fontSize: 15,
                            fontWeight: '500',
                          }}>
                            Español
                          </Text>
                        </View>
                        <View style={{
                          backgroundColor: 'rgba(148, 163, 184, 0.2)',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 6,
                        }}>
                          <Text style={{
                            color: '#94a3b8',
                            fontSize: 11,
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}>
                            Bloqueado
                          </Text>
                        </View>
                      </View>
                      <Text style={modalStyles.helperText}>
                        El idioma está configurado en Español por defecto
                      </Text>
                    </View>

                    {/* Zona Horaria - BLOQUEADA */}
                    <View style={modalStyles.formGroup}>
                      <Text style={modalStyles.label}>Zona Horaria</Text>
                      <View style={{
                        backgroundColor: 'rgba(71, 85, 105, 0.3)',
                        borderWidth: 1,
                        borderColor: 'rgba(148, 163, 184, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Ionicons name="time-outline" size={20} color="#94a3b8" />
                          <Text style={{
                            color: '#94a3b8',
                            fontSize: 15,
                            fontWeight: '500',
                          }}>
                            America/Guayaquil (GMT-5)
                          </Text>
                        </View>
                        <View style={{
                          backgroundColor: 'rgba(148, 163, 184, 0.2)',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 6,
                        }}>
                          <Text style={{
                            color: '#94a3b8',
                            fontSize: 11,
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}>
                            Bloqueado
                          </Text>
                        </View>
                      </View>
                      <Text style={modalStyles.helperText}>
                        La zona horaria está configurada para Ecuador
                      </Text>
                    </View>

                    {/* Estado del Agente - ACTIVO (Switch funcional) */}
                    <View style={modalStyles.formGroup}>
                      <View style={modalStyles.switchContainer}>
                        <View>
                          <Text style={modalStyles.label}>Estado del Agente</Text>
                          <Text style={modalStyles.helperText}>
                            {formData.activo ? 'Agente activo y disponible' : 'Agente desactivado'}
                          </Text>
                        </View>
                        <Switch
                          value={formData.activo}
                          onValueChange={(value) => setFormData({ ...formData, activo: value })}
                          trackColor={{ false: '#475569', true: '#667eea' }}
                          thumbColor={formData.activo ? '#ffffff' : '#cbd5e1'}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Estadísticas */}
                  <View style={modalStyles.detailSection}>
                    <Text style={modalStyles.detailSectionTitle}>📊 Estadísticas y Auditoría</Text>
                    <View style={modalStyles.detailGrid}>
                      <View style={modalStyles.detailItem}>
                        <Ionicons name="chatbubbles" size={16} color="#667eea" />
                        <View style={{ flex: 1 }}>
                          <Text style={modalStyles.detailLabel}>Conversaciones</Text>
                          <Text style={modalStyles.detailValue}>
                            {selectedAgente.total_conversaciones || 0}
                          </Text>
                        </View>
                      </View>

                      {/* ⭐ NUEVO: Creado por */}
                      <View style={modalStyles.detailItem}>
                        <Ionicons name="person-add" size={16} color="#22c55e" />
                        <View style={{ flex: 1 }}>
                          <Text style={modalStyles.detailLabel}>Creado por</Text>
                          <Text style={modalStyles.detailValue}>
                            {selectedAgente.creador_nombre || 'N/A'}
                          </Text>
                        </View>
                      </View>

                      <View style={modalStyles.detailItem}>
                        <Ionicons name="calendar" size={16} color="#667eea" />
                        <View style={{ flex: 1 }}>
                          <Text style={modalStyles.detailLabel}>Fecha de creación</Text>
                          <Text style={modalStyles.detailValue}>
                            {formatDate(selectedAgente.fecha_creacion)}
                          </Text>
                        </View>
                      </View>

                      {/* ⭐ NUEVO: Última actualización */}
                      {selectedAgente.actualizado_por && (
                        <>
                          <View style={modalStyles.detailItem}>
                            <Ionicons name="create" size={16} color="#fb923c" />
                            <View style={{ flex: 1 }}>
                              <Text style={modalStyles.detailLabel}>Actualizado por</Text>
                              <Text style={modalStyles.detailValue}>
                                {selectedAgente.actualizador_nombre || 'N/A'}
                              </Text>
                            </View>
                          </View>

                          <View style={modalStyles.detailItem}>
                            <Ionicons name="time" size={16} color="#667eea" />
                            <View style={{ flex: 1 }}>
                              <Text style={modalStyles.detailLabel}>Última actualización</Text>
                              <Text style={modalStyles.detailValue}>
                                {formatDate(selectedAgente.fecha_actualizacion)}
                              </Text>
                            </View>
                          </View>
                        </>
                      )}
                    </View>
                  </View>

                  {/* Prompt del Sistema */}
                  {selectedAgente.prompt_sistema && (
                    <View style={modalStyles.detailSection}>
                      <Text style={modalStyles.detailSectionTitle}>💬 Prompt del Sistema</Text>
                      <View style={modalStyles.promptBox}>
                        <Text style={modalStyles.promptText}>
                          {selectedAgente.prompt_sistema}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* ⭐ NUEVO: Especialización */}
                  {selectedAgente.prompt_especializado && (
                    <View style={modalStyles.detailSection}>
                      <Text style={modalStyles.detailSectionTitle}>🎯 Especialización</Text>
                      <View style={{
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderRadius: 12,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: 'rgba(102, 126, 234, 0.3)',
                        borderLeftWidth: 4,
                        borderLeftColor: '#667eea',
                      }}>
                        <Text style={{
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: 14,
                          lineHeight: 22,
                        }}>
                          {selectedAgente.prompt_especializado}
                        </Text>
                      </View>
                    </View>
                  )}
                  {/* ⭐ NUEVO: Especialización */}
                  {selectedAgente.prompt_especializado && (
                    <View style={modalStyles.detailSection}>
                      <Text style={modalStyles.detailSectionTitle}>🎯 Especialización</Text>
                      <View style={{
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderRadius: 12,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: 'rgba(102, 126, 234, 0.3)',
                        borderLeftWidth: 4,
                        borderLeftColor: '#667eea',
                      }}>
                        <Text style={{
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: 14,
                          lineHeight: 22,
                        }}>
                          {selectedAgente.prompt_especializado}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* ⭐ AGREGAR ESTO AQUÍ - HORARIOS DE ATENCIÓN */}
                  {selectedAgente.horarios && (
                    <View style={modalStyles.detailSection}>
                      <Text style={modalStyles.detailSectionTitle}>🕐 Horarios de Atención</Text>
                      <View style={{ gap: 12 }}>
                        {Object.entries(
                          typeof selectedAgente.horarios === 'string'
                            ? JSON.parse(selectedAgente.horarios)
                            : selectedAgente.horarios
                        ).map(([dia, bloques]) => {
                          const diaLabel = dia.charAt(0).toUpperCase() + dia.slice(1);
                          const config = Array.isArray(bloques) && bloques.length > 0
                            ? { activo: true, bloques }
                            : { activo: false, bloques: [] };

                          return (
                            <View key={dia} style={{
                              backgroundColor: config.activo
                                ? 'rgba(102, 126, 234, 0.1)'
                                : 'rgba(71, 85, 105, 0.2)',
                              borderRadius: 10,
                              padding: 14,
                              borderWidth: 1,
                              borderColor: config.activo
                                ? 'rgba(102, 126, 234, 0.3)'
                                : 'rgba(148, 163, 184, 0.2)'
                            }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: config.activo && config.bloques?.length > 0 ? 8 : 0 }}>
                                <Ionicons
                                  name={config.activo ? "checkmark-circle" : "close-circle"}
                                  size={18}
                                  color={config.activo ? '#22c55e' : '#94a3b8'}
                                />
                                <Text style={{
                                  color: config.activo ? '#ffffff' : '#94a3b8',
                                  fontSize: 15,
                                  fontWeight: '600',
                                  flex: 1
                                }}>
                                  {diaLabel}
                                </Text>
                                {!config.activo && (
                                  <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                                    No disponible
                                  </Text>
                                )}
                              </View>

                              {config.activo && config.bloques?.length > 0 && (
                                <View style={{ gap: 6, marginLeft: 28 }}>
                                  {config.bloques.map((bloque, index) => (
                                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                      <Ionicons name="time-outline" size={14} color="#667eea" />
                                      <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 13 }}>
                                        {bloque.inicio} - {bloque.fin}
                                      </Text>
                                    </View>
                                  ))}
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}

                </ScrollView> {/* <- Cierre del Modal de Detalles */}
                <View style={modalStyles.footer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 10, paddingHorizontal: 4 }}
                  >
                    <TouchableOpacity
                      style={modalStyles.actionButton}
                      onPress={() => {
                        setShowDetailModal(false);
                        handleEdit(selectedAgente);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="create-outline" size={18} color="#ffffff" />
                      <Text style={modalStyles.actionButtonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        modalStyles.actionButton,
                        { backgroundColor: selectedAgente?.activo ? '#ef4444' : '#22c55e' }
                      ]}
                      onPress={() => {
                        handleToggleStatus(selectedAgente);
                        setShowDetailModal(false);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="power" size={18} color="#ffffff" />
                      <Text style={modalStyles.actionButtonText}>
                        {selectedAgente?.activo ? 'Desactivar' : 'Activar'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[modalStyles.actionButton, { backgroundColor: '#dc2626' }]}
                      onPress={() => handleDelete(selectedAgente)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="trash-outline" size={18} color="#ffffff" />
                      <Text style={modalStyles.actionButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal >
      {/* ============ MODAL CONFIRMACIÓN ELIMINAR ============ */}
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: '#1e293b',
            borderRadius: 20,
            width: '100%',
            maxWidth: 500,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 20,
          }}>
            {/* Header con ícono de advertencia */}
            <View style={{
              backgroundColor: 'rgba(220, 38, 38, 0.2)',
              padding: 24,
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(220, 38, 38, 0.3)',
            }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(220, 38, 38, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
                borderWidth: 3,
                borderColor: '#dc2626',
              }}>
                <Ionicons name="trash-outline" size={40} color="#dc2626" />
              </View>
              <Text style={{
                fontSize: 24,
                fontWeight: '700',
                color: '#ffffff',
                textAlign: 'center',
              }}>
                ⚠️ Confirmar Eliminación
              </Text>
            </View>

            {/* Contenido */}
            <View style={{ padding: 24 }}>
              <Text style={{
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                lineHeight: 24,
                marginBottom: 16,
              }}>
                ¿Estás seguro de eliminar permanentemente el agente
              </Text>

              <View style={{
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                padding: 16,
                borderRadius: 12,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: '#667eea',
              }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#ffffff',
                  textAlign: 'center',
                }}>
                  "{agenteToDelete?.nombre_agente}"?
                </Text>
              </View>

              <View style={{
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                padding: 16,
                borderRadius: 12,
                borderLeftWidth: 4,
                borderLeftColor: '#dc2626',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <Ionicons name="warning" size={20} color="#dc2626" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: '#dc2626',
                      marginBottom: 6,
                    }}>
                      ADVERTENCIA: Esta acción es irreversible
                    </Text>
                    <Text style={{
                      fontSize: 13,
                      color: 'rgba(220, 38, 38, 0.9)',
                      lineHeight: 20,
                    }}>
                      El agente será marcado como eliminado y NO podrá recuperarse desde la aplicación.
                    </Text>
                  </View>
                </View>

                <View style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="information-circle" size={16} color="#3b82f6" />
                    <Text style={{
                      fontSize: 12,
                      color: '#3b82f6',
                      fontWeight: '600',
                    }}>
                      💡 Sugerencia
                    </Text>
                  </View>
                  <Text style={{
                    fontSize: 12,
                    color: 'rgba(59, 130, 246, 0.9)',
                    marginTop: 6,
                    lineHeight: 18,
                  }}>
                    Si solo deseas desactivarlo temporalmente, usa el botón "Desactivar" en su lugar.
                  </Text>
                </View>
              </View>
            </View>

            {/* Botones */}
            <View style={{
              flexDirection: 'row',
              gap: 12,
              padding: 24,
              paddingTop: 0,
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(71, 85, 105, 0.5)',
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: 'rgba(148, 163, 184, 0.3)',
                }}
                onPress={() => {
                  setShowDeleteModal(false);
                  setAgenteToDelete(null);
                }}
                activeOpacity={0.8}
              >
                <Text style={{
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#dc2626',
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                  borderWidth: 2,
                  borderColor: '#b91c1c',
                  shadowColor: '#dc2626',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 8,
                }}
                onPress={confirmarEliminacion}
                activeOpacity={0.8}
              >
                <Ionicons name="trash" size={20} color="#ffffff" />
                <Text style={{
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: '700',
                }}>
                  Eliminar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* ============ MODAL ACTIVAR/DESACTIVAR ============ */}
      <Modal
        visible={showToggleModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowToggleModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: '#1e293b',
            borderRadius: 20,
            width: '100%',
            maxWidth: 500,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 20,
          }}>
            {/* Header */}
            <View style={{
              backgroundColor: agenteToToggle?.activo
                ? 'rgba(251, 146, 60, 0.2)'
                : 'rgba(34, 197, 94, 0.2)',
              padding: 24,
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: agenteToToggle?.activo
                ? 'rgba(251, 146, 60, 0.3)'
                : 'rgba(34, 197, 94, 0.3)',
            }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: agenteToToggle?.activo
                  ? 'rgba(251, 146, 60, 0.2)'
                  : 'rgba(34, 197, 94, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
                borderWidth: 3,
                borderColor: agenteToToggle?.activo ? '#fb923c' : '#22c55e',
              }}>
                <Ionicons
                  name={agenteToToggle?.activo ? "pause" : "play"}
                  size={40}
                  color={agenteToToggle?.activo ? '#fb923c' : '#22c55e'}
                />
              </View>
              <Text style={{
                fontSize: 24,
                fontWeight: '700',
                color: '#ffffff',
                textAlign: 'center',
              }}>
                {agenteToToggle?.activo ? '⏸️ Desactivar Agente' : '▶️ Activar Agente'}
              </Text>
            </View>

            {/* Contenido */}
            <View style={{ padding: 24 }}>
              <Text style={{
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                lineHeight: 24,
                marginBottom: 16,
              }}>
                {agenteToToggle?.activo
                  ? '¿Deseas desactivar el agente'
                  : '¿Deseas reactivar el agente'}
              </Text>

              <View style={{
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                padding: 16,
                borderRadius: 12,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: '#667eea',
              }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#ffffff',
                  textAlign: 'center',
                }}>
                  "{agenteToToggle?.nombre_agente}"?
                </Text>
              </View>

              <View style={{
                backgroundColor: agenteToToggle?.activo
                  ? 'rgba(251, 146, 60, 0.1)'
                  : 'rgba(34, 197, 94, 0.1)',
                padding: 16,
                borderRadius: 12,
                borderLeftWidth: 4,
                borderLeftColor: agenteToToggle?.activo ? '#fb923c' : '#22c55e',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color={agenteToToggle?.activo ? '#fb923c' : '#22c55e'}
                    style={{ marginTop: 2 }}
                  />
                  <Text style={{
                    fontSize: 13,
                    color: agenteToToggle?.activo
                      ? 'rgba(251, 146, 60, 0.9)'
                      : 'rgba(34, 197, 94, 0.9)',
                    lineHeight: 20,
                    flex: 1,
                  }}>
                    {agenteToToggle?.activo
                      ? 'El agente dejará de estar disponible pero podrás reactivarlo cuando quieras desde la sección de "Inactivos".'
                      : 'El agente volverá a estar disponible inmediatamente para atender usuarios.'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Botones */}
            <View style={{
              flexDirection: 'row',
              gap: 12,
              padding: 24,
              paddingTop: 0,
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(71, 85, 105, 0.5)',
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: 'rgba(148, 163, 184, 0.3)',
                }}
                onPress={() => {
                  setShowToggleModal(false);
                  setAgenteToToggle(null);
                }}
                activeOpacity={0.8}
              >
                <Text style={{
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: agenteToToggle?.activo ? '#fb923c' : '#22c55e',
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                  borderWidth: 2,
                  borderColor: agenteToToggle?.activo ? '#f97316' : '#16a34a',
                  shadowColor: agenteToToggle?.activo ? '#fb923c' : '#22c55e',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 8,
                }}
                onPress={confirmarToggleStatus}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={agenteToToggle?.activo ? "pause" : "play"}
                  size={20}
                  color="#ffffff"
                />
                <Text style={{
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: '700',
                }}>
                  {agenteToToggle?.activo ? 'Desactivar' : 'Activar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* ============ MODAL ERROR ============ */}
      <Modal
        visible={showErrorModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: '#1e293b',
            borderRadius: 20,
            width: '100%',
            maxWidth: 500,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 20,
          }}>
            {/* Header */}
            <View style={{
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              padding: 24,
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(239, 68, 68, 0.3)',
            }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
                borderWidth: 3,
                borderColor: '#ef4444',
              }}>
                <Ionicons name="alert-circle" size={40} color="#ef4444" />
              </View>
              <Text style={{
                fontSize: 24,
                fontWeight: '700',
                color: '#ffffff',
                textAlign: 'center',
              }}>
                ❌ No se puede eliminar
              </Text>
            </View>

            {/* Contenido */}
            <View style={{ padding: 24 }}>
              {/* Mensaje principal */}
              <View style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                padding: 16,
                borderRadius: 12,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: '#ef4444',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  <Ionicons name="warning" size={20} color="#ef4444" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: '#ef4444',
                      marginBottom: 8,
                    }}>
                      Error al intentar eliminar
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: 22,
                    }}>
                      {errorMessage}
                    </Text>

                    {/* ✅ NUEVO: Mostrar detalles de contenidos y categorías */}
                    {errorDetails && (errorDetails.contenidos > 0 || errorDetails.categorias > 0) && (
                      <View style={{
                        marginTop: 12,
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        padding: 12,
                        borderRadius: 8,
                        gap: 6,
                      }}>
                        {errorDetails.contenidos > 0 && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="document-text" size={16} color="#ef4444" />
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 13, fontWeight: '600' }}>
                              {errorDetails.contenidos} {errorDetails.contenidos === 1 ? 'contenido' : 'contenidos'}
                            </Text>
                          </View>
                        )}
                        {errorDetails.categorias > 0 && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="folder" size={16} color="#ef4444" />
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 13, fontWeight: '600' }}>
                              {errorDetails.categorias} {errorDetails.categorias === 1 ? 'categoría' : 'categorías'}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Información del agente */}
              {agenteToDelete && (
                <View style={{
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: '#667eea',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Text style={{ fontSize: 24 }}>{agenteToDelete.icono || '🤖'}</Text>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: '#ffffff',
                      flex: 1,
                    }}>
                      {agenteToDelete.nombre_agente}
                    </Text>
                  </View>
                  <Text style={{
                    fontSize: 13,
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}>
                    {agenteToDelete.area_especialidad}
                  </Text>
                </View>
              )}

              {/* Sugerencia */}
              <View style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                padding: 16,
                borderRadius: 12,
                borderLeftWidth: 4,
                borderLeftColor: '#3b82f6',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  <Ionicons name="information-circle" size={20} color="#3b82f6" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: '#3b82f6',
                      marginBottom: 8,
                    }}>
                      💡 ¿Qué puedes hacer?
                    </Text>

                    <View style={{ gap: 8 }}>
                      {/* ✅ NUEVO: Sugerencia dinámica según lo que tenga */}
                      {errorDetails && errorDetails.contenidos > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                          <Text style={{ color: '#3b82f6', fontSize: 13 }}>•</Text>
                          <Text style={{
                            fontSize: 13,
                            color: 'rgba(59, 130, 246, 0.9)',
                            lineHeight: 20,
                            flex: 1,
                          }}>
                            Elimina o reasigna los <Text style={{ fontWeight: '700' }}>contenidos</Text> asociados
                          </Text>
                        </View>
                      )}

                      {errorDetails && errorDetails.categorias > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                          <Text style={{ color: '#3b82f6', fontSize: 13 }}>•</Text>
                          <Text style={{
                            fontSize: 13,
                            color: 'rgba(59, 130, 246, 0.9)',
                            lineHeight: 20,
                            flex: 1,
                          }}>
                            Elimina o reasigna las <Text style={{ fontWeight: '700' }}>categorías</Text> asociadas
                          </Text>
                        </View>
                      )}

                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                        <Text style={{ color: '#3b82f6', fontSize: 13 }}>•</Text>
                        <Text style={{
                          fontSize: 13,
                          color: 'rgba(59, 130, 246, 0.9)',
                          lineHeight: 20,
                          flex: 1,
                        }}>
                          O simplemente <Text style={{ fontWeight: '700' }}>desactiva el agente</Text> temporalmente
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Botones */}
            <View style={{
              flexDirection: 'row',
              gap: 12,
              padding: 24,
              paddingTop: 0,
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(71, 85, 105, 0.5)',
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: 'rgba(148, 163, 184, 0.3)',
                }}
                onPress={() => {
                  setShowErrorModal(false);
                  setErrorMessage('');
                  setErrorDetails(null);
                }}
                activeOpacity={0.8}
              >
                <Text style={{
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Cerrar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#fb923c',
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                  borderWidth: 2,
                  borderColor: '#f97316',
                  shadowColor: '#fb923c',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 8,
                }}
                onPress={() => {
                  setShowErrorModal(false);
                  setErrorMessage('');
                  setErrorDetails(null);
                  if (agenteToDelete) {
                    handleToggleStatus(agenteToDelete);
                  }
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="pause" size={20} color="#ffffff" />
                <Text style={{
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: '700',
                }}>
                  Desactivar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============ SIDEBAR MÓVIL ============ */}
      {!isWeb && sidebarOpen && (
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
            <AdminSidebar
              isOpen={sidebarOpen}
              onNavigate={() => setSidebarOpen(false)}
            />
          </View>
        </>
      )}
    </View >
  );
}

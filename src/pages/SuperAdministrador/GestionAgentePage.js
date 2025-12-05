// UBICACIÓN: src/pages/SuperAdministrador/GestionAgentePage.js
// REEMPLAZA COMPLETAMENTE el archivo GestionAgentePage.js existente con este código

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { agenteService } from '../../api/services/agenteService';
import { departamentoService } from '../../api/services/departamentoService';
import SuperAdminSidebar from '../../components/Sidebar/sidebarSuperAdmin';
import GestionAgenteCard from '../../components/SuperAdministrador/GestionAgenteCard';
import SecurityValidator from '../../components/utils/SecurityValidator';
import { contentStyles } from '../../styles/contentStyles';
import { getStatIconColor, modalStyles, styles } from '../../styles/gestionAgenteStyles';

export default function GestionAgentePage() {
  // ============ STATE ============
  const [agentes, setAgentes] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Modales
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' o 'edit'
  const [selectedAgente, setSelectedAgente] = useState(null);

  // Form Data
const [formData, setFormData] = useState({
  nombre_agente: '',
  tipo_agente: 'especializado',
  area_especialidad: '',
  descripcion: '',
  modelo_ia: 'llama3:8b',
  temperatura: '0.7',
  max_tokens: '4000',
  prompt_sistema: '',
  herramientas_disponibles: '',
  idioma_principal: 'es',
  zona_horaria: 'America/Guayaquil',
  activo: true,
  icono: '🤖',
  id_departamento: '',
  // ⭐ NUEVOS CAMPOS
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
});
  const [formErrors, setFormErrors] = useState({});
  
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
    
    if (filterEstado !== 'todos') {
      params.activo = filterEstado === 'activo';
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
    console.log('🔍 Intentando cargar estadísticas...');
    const data = await agenteService.getEstadisticasGenerales();
    console.log('📦 Datos recibidos:', data);
    
    // Manejar diferentes estructuras de respuesta
    const statsData = data?.data || data;
    console.log('📊 Stats procesadas:', statsData);
    
    if (statsData && statsData.total !== undefined) {
      const nuevasStats = {
        total: Number(statsData.total) || 0,
        activos: Number(statsData.activos) || 0,
        router: Number(statsData.router) || 0,
        especializados: Number(statsData.especializados) || 0,
      };
      console.log('✅ Actualizando stats a:', nuevasStats);
      setStats(nuevasStats);
    } else {
      console.log('⚠️ Formato no válido, usando fallback');
      throw new Error('Formato no válido');
    }
  } catch (err) {
    console.error('❌ Error al cargar estadísticas:', err);
    // Fallback: calcular desde todos los agentes
    try {
      console.log('🔄 Intentando fallback...');
      const todosAgentes = await agenteService.getAll({});
      console.log('📦 Agentes para calcular:', todosAgentes);
      
      const agentesArray = Array.isArray(todosAgentes) ? todosAgentes : (todosAgentes?.data || []);
      console.log('📋 Array de agentes:', agentesArray.length);
      
      const calculadas = {
        total: agentesArray.length,
        activos: agentesArray.filter(a => a.activo).length,
        router: agentesArray.filter(a => a.tipo_agente === 'router').length,
        especializados: agentesArray.filter(a => a.tipo_agente === 'especializado').length,
      };
      console.log('✅ Estadísticas calculadas:', calculadas);
      setStats(calculadas);
    } catch (fallbackErr) {
      console.error('❌ Error en fallback:', fallbackErr);
    }
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
    prompt_sistema: '',
    herramientas_disponibles: '',
    idioma_principal: 'es',
    zona_horaria: 'America/Guayaquil',
    activo: true,
    icono: '🤖',
    id_departamento: '',
    // ⭐ NUEVOS CAMPOS
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
  });
  setFormErrors({});
};

  // Validar formulario
// Validar formulario con SecurityValidator
// Validar formulario con SecurityValidator
  const validateForm = () => {
    console.log('🔍 Iniciando validación con SecurityValidator...');
    
    // Usar el validador de seguridad
    const validation = SecurityValidator.validateAgenteForm(formData, formMode);
    
    console.log('📋 Resultado de validación:', {
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
      console.log('❌ Validación falló. Errores:', validation.errors);
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

  const handleEdit = (agente) => {
    setFormMode('edit');
    setSelectedAgente(agente);
    setFormData({
      nombre_agente: agente.nombre_agente || '',
      tipo_agente: agente.tipo_agente || 'especializado',
      area_especialidad: agente.area_especialidad || '',
      descripcion: agente.descripcion || '',
      modelo_ia: 'llama3:8b', 
      temperatura: agente.temperatura?.toString() || '0.7',
      max_tokens: agente.max_tokens?.toString() || '4000',
      prompt_sistema: agente.prompt_sistema || '',
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
    });
    setShowFormModal(true);
  };


// Función para obtener departamentos disponibles
const getDepartamentosDisponibles = () => {
  console.log('🔍 === DIAGNÓSTICO getDepartamentosDisponibles ===');
  console.log('📌 Modo:', formMode);
  console.log('📌 SelectedAgente:', selectedAgente);
  console.log('📌 Total Departamentos:', departamentos.length);
  console.log('📌 Total Agentes:', agentes.length);
  
  // Si estamos editando y el agente ya tiene departamento asignado
  if (formMode === 'edit' && selectedAgente?.id_departamento) {
    console.log('✏️ MODO EDICIÓN - Departamento actual:', selectedAgente.id_departamento);
    const deptAsignado = departamentos.find(d => 
      d.id_departamento.toString() === selectedAgente.id_departamento.toString()
    );
    console.log('✅ Departamento encontrado:', deptAsignado);
    return deptAsignado ? [deptAsignado] : [];
  }
  
  // Si estamos creando, filtrar departamentos que YA tienen agente
  console.log('➕ MODO CREACIÓN - Filtrando departamentos ocupados...');
  
  // Obtener IDs de departamentos ocupados
  const departamentosOcupados = agentes
    .filter(a => {
      const tieneDepto = a.id_departamento != null && a.id_departamento !== '';
      if (tieneDepto) {
        console.log(`   🔒 Agente "${a.nombre_agente}" ocupa departamento ID: ${a.id_departamento}`);
      }
      return tieneDepto;
    })
    .map(a => a.id_departamento.toString());
  
  console.log('📋 IDs Ocupados:', departamentosOcupados);
  
  // Filtrar departamentos disponibles
  const disponibles = departamentos.filter(d => {
    const deptId = d.id_departamento.toString();
    const estaOcupado = departamentosOcupados.includes(deptId);
    console.log(`   ${estaOcupado ? '❌' : '✅'} Departamento "${d.nombre}" (ID: ${deptId}) - ${estaOcupado ? 'OCUPADO' : 'DISPONIBLE'}`);
    return !estaOcupado;
  });
  
  console.log('✅ Total Disponibles:', disponibles.length);
  console.log('🎯 Departamentos Disponibles:', disponibles.map(d => `${d.nombre} (ID: ${d.id_departamento})`));
  console.log('🔍 === FIN DIAGNÓSTICO ===\n');
  
  return disponibles;
};


// Guardar agente (crear o actualizar)
const handleSaveForm = async () => {
  console.log('🔵 === INICIO handleSaveForm ===');
  console.log('📋 FormData actual:', formData);
  console.log('🎯 Modo:', formMode);
  console.log('👤 Agente seleccionado:', selectedAgente);
  
  if (!validateForm()) {
    console.log('❌ Validación falló');
    console.log('🚫 Errores:', formErrors);
    Alert.alert('Error de validación', 'Por favor, corrige los errores en el formulario');
    return;
  }
  
  console.log('✅ Validación exitosa');

    try {
        // Sanitizar y validar datos con SecurityValidator
        const dataToSave = SecurityValidator.sanitizeAgenteData(formData);
        
        console.log('🧹 Datos sanitizados:', dataToSave);
        console.log('📦 Datos a enviar:', dataToSave);

    if (formMode === 'create') {
      console.log('➕ Creando nuevo agente...');
      const response = await agenteService.create(dataToSave);
      console.log('✅ Respuesta del servidor:', response);
      setSuccessMessage('✅ Agente creado correctamente');
    } else {
      console.log('✏️ Actualizando agente ID:', selectedAgente.id_agente);
      const response = await agenteService.update(selectedAgente.id_agente, dataToSave);
      console.log('✅ Respuesta del servidor:', response);
      setSuccessMessage('✅ Agente actualizado correctamente');
    }

    console.log('🎉 Guardado exitoso');
    setShowSuccessMessage(true);
    setShowFormModal(false);
    
    console.log('🔄 Recargando agentes...');
    await cargarAgentes();
    await cargarEstadisticas();
    
    resetForm();

    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
    
    console.log('🔵 === FIN handleSaveForm ===');
  } catch (err) {
    console.error('❌ ERROR AL GUARDAR:', err);
    console.error('📄 Detalles del error:', {
      message: err?.message,
      response: err?.response?.data,
      status: err?.response?.status,
      stack: err?.stack
    });
    Alert.alert('Error', err?.message || 'No se pudo guardar el agente');
  }
};

  const handleView = (agente) => {
    setSelectedAgente(agente);
    setShowDetailModal(true);
  };

  const handleDelete = async (agente) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Está seguro de eliminar "${agente.nombre_agente}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await agenteService.delete(agente.id_agente);
              setSuccessMessage('🗑️ Agente eliminado correctamente');
              setShowSuccessMessage(true);
              setShowDetailModal(false);
              cargarAgentes();
              cargarEstadisticas();
              
              setTimeout(() => {
                setShowSuccessMessage(false);
              }, 3000);
            } catch (err) {
              console.error('Error al eliminar:', err);
              Alert.alert('Error', err?.message || 'No se pudo eliminar el agente');
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = async (agente) => {
    try {
      const newStatus = !agente.activo;
      await agenteService.update(agente.id_agente, {
        ...agente,
        activo: newStatus,
      });
      
      setSuccessMessage(
        `✅ Agente ${newStatus ? 'activado' : 'desactivado'} correctamente`
      );
      setShowSuccessMessage(true);
      cargarAgentes();
      cargarEstadisticas();
      
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      Alert.alert('Error', 'No se pudo cambiar el estado del agente');
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
      
      {/* ============ SIDEBAR ============ */}
      <SuperAdminSidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* ============ CONTENIDO PRINCIPAL ============ */}
      <View style={[
        contentStyles.mainContent, 
        sidebarOpen && contentStyles.mainContentWithSidebar
      ]}>
        
        {/* ============ BOTÓN TOGGLE SIDEBAR ============ */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
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

        <View style={styles.container}>
          
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

            <View style={styles.filterContainer}>
              {/* Filtros de Tipo de Agente */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginRight: 4,
                }}>
                  Tipo:
                </Text>
                {[
                  { key: 'todos', label: 'Todos', icon: 'apps' },
                  { key: 'router', label: 'Router', icon: 'filter' },
                  { key: 'especializado', label: 'Especializado', icon: 'star' },
                  { key: 'hibrido', label: 'Híbrido', icon: 'git-merge' },
                ].map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    style={[
                      styles.filterButton,
                      filterTipo === filter.key && styles.filterButtonActive,
                    ]}
                    onPress={() => setFilterTipo(filter.key)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={filter.icon} 
                      size={14} 
                      color={filterTipo === filter.key ? 'white' : 'rgba(255, 255, 255, 0.6)'} 
                    />
                    <Text
                      style={[
                        styles.filterText,
                        filterTipo === filter.key && styles.filterTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Separador Visual */}
              <View style={{
                width: 2,
                height: 32,
                backgroundColor: 'rgba(102, 126, 234, 0.3)',
                marginHorizontal: 12,
                borderRadius: 1,
              }} />

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
                  { key: 'todos', label: 'Todos', icon: 'list' },
                  { key: 'activo', label: 'Activos', icon: 'checkmark-circle' },
                  { key: 'inactivo', label: 'Inactivos', icon: 'close-circle' },
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
          </View>


          {/* ============ LISTA ============ */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Cargando agentes...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredAgentes}
              keyExtractor={(item) => item.id_agente?.toString() || Math.random().toString()}
              renderItem={({ item }) => (
                <GestionAgenteCard
                  agente={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                  onToggleStatus={handleToggleStatus}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="file-tray-outline" size={80} color="rgba(255, 255, 255, 0.2)" />
                  <Text style={styles.emptyText}>No se encontraron agentes</Text>
                  <Text style={styles.emptySubtext}>
                    {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer agente virtual'}
                  </Text>
                </View>
              }
            />
          )}

        </View>
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
                    /* Si está creando O no tiene departamento - SELECTOR */
                    <>
                      <View style={modalStyles.pickerContainer}>
                        <TextInput
                          style={modalStyles.picker}
                          value={
                            formData.id_departamento
                              ? departamentos.find(d => d.id_departamento.toString() === formData.id_departamento)?.nombre || 'Seleccionar...'
                              : 'Seleccionar departamento...'
                          }
                          editable={false}
                        />
                        <select
                          value={formData.id_departamento}
                          onChange={(e) => {
                            setFormData({ ...formData, id_departamento: e.target.value });
                          }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer',
                          }}
                        >
                          <option value="">Sin asignar</option>
                          {getDepartamentosDisponibles().map((dept) => (
                          <option key={dept.id_departamento} value={dept.id_departamento}>
                            {dept.nombre}{dept.codigo ? ` (${dept.codigo})` : ''}
                          </option>
                          ))}
                        </select>
                      </View>
                      
                      {/* Contador de departamentos */}
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        backgroundColor: getDepartamentosDisponibles().length > 0 
                          ? 'rgba(34, 197, 94, 0.1)' 
                          : 'rgba(239, 68, 68, 0.1)',
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
                  <div
                    style={{
                      display: 'flex',
                      overflowX: 'auto',
                      overflowY: 'hidden',
                      paddingVertical: 8,
                      paddingHorizontal: 4,
                      cursor: 'grab',
                      userSelect: 'none',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      WebkitOverflowScrolling: 'touch',
                    }}
                    onMouseDown={(e) => {
                      const ele = e.currentTarget;
                      ele.style.cursor = 'grabbing';
                      const startX = e.pageX - ele.offsetLeft;
                      const scrollLeft = ele.scrollLeft;

                      const handleMouseMove = (e) => {
                        const x = e.pageX - ele.offsetLeft;
                        const walk = (x - startX) * 2;
                        ele.scrollLeft = scrollLeft - walk;
                      };

                      const handleMouseUp = () => {
                        ele.style.cursor = 'grab';
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };

                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  >
                    {iconos.map((icon, index) => (
                      <TouchableOpacity
                        key={icon}
                        style={[
                          modalStyles.iconOption,
                          formData.icono === icon && modalStyles.iconOptionSelected,
                          { marginRight: index < iconos.length - 1 ? 8 : 0 }
                        ]}
                        onPress={() => setFormData({ ...formData, icono: icon })}
                        activeOpacity={0.7}
                      >
                        <Text style={modalStyles.iconText}>{icon}</Text>
                      </TouchableOpacity>
                    ))}
                  </div>
                  
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
                        <img
                          src={formData.avatar_url}
                          alt="Preview Avatar"
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            objectFit: 'cover',
                            border: '2px solid rgba(102, 126, 234, 0.5)',
                            backgroundColor: 'rgba(71, 85, 105, 0.5)',
                          }}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23475569" width="60" height="60"/%3E%3Ctext x="50%25" y="50%25" font-size="30" text-anchor="middle" dy=".3em" fill="%2394a3b8"%3E❌%3C/text%3E%3C/svg%3E';
                          }}
                          onLoad={(e) => {
                            e.target.style.border = '2px solid #22c55e';
                          }}
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

                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Prompt del Sistema</Text>
                  <TextInput
                    style={modalStyles.textArea}
                    placeholder="Instrucciones específicas para el comportamiento del agente..."
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={formData.prompt_sistema}
                    onChangeText={(text) => setFormData({ ...formData, prompt_sistema: text })}
                    multiline
                    numberOfLines={6}
                    maxLength={2000}
                  />
                </View>
                {formErrors.prompt_sistema && (
                  <Text style={modalStyles.errorText}>{formErrors.prompt_sistema}</Text>
                )}
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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
                    <View>
                      <Text style={modalStyles.title}>{selectedAgente.nombre_agente}</Text>
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
                    <Text style={modalStyles.detailSectionTitle}>📊 Estadísticas</Text>
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
                      <View style={modalStyles.detailItem}>
                        <Ionicons name="calendar" size={16} color="#667eea" />
                        <View style={{ flex: 1 }}>
                          <Text style={modalStyles.detailLabel}>Creado</Text>
                          <Text style={modalStyles.detailValue}>
                            {formatDate(selectedAgente.fecha_creacion)}
                          </Text>
                        </View>
                      </View>
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

                </ScrollView>

                <View style={modalStyles.footer}>
                  <TouchableOpacity
                    style={modalStyles.actionButton}
                    onPress={() => {
                      setShowDetailModal(false);
                      handleEdit(selectedAgente);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="create-outline" size={20} color="#ffffff" />
                    <Text style={modalStyles.actionButtonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      modalStyles.actionButton,
                      { backgroundColor: selectedAgente.activo ? '#ef4444' : '#22c55e' }
                    ]}
                    onPress={() => {
                      handleToggleStatus(selectedAgente);
                      setShowDetailModal(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="power" size={20} color="#ffffff" />
                    <Text style={modalStyles.actionButtonText}>
                      {selectedAgente.activo ? 'Desactivar' : 'Activar'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[modalStyles.actionButton, { backgroundColor: '#dc2626' }]}
                    onPress={() => handleDelete(selectedAgente)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ffffff" />
                    <Text style={modalStyles.actionButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}


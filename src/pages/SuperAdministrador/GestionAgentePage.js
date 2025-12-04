// UBICACIÓN: src/pages/SuperAdministrador/GestionAgentePage.js
// REEMPLAZA COMPLETAMENTE el archivo GestionAgentePage.js existente con este código

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView, // <-- ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ PRESENTE
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { agenteService } from '../../api/services/agenteService';
import SuperAdminSidebar from '../../components/Sidebar/sidebarSuperAdmin';
import GestionAgenteCard from '../../components/SuperAdministrador/GestionAgenteCard';
import { contentStyles } from '../../styles/contentStyles';
import { getStatIconColor, modalStyles, styles } from '../../styles/gestionAgenteStyles';

export default function GestionAgentePage() {
  // ============ STATE ============
  const [agentes, setAgentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
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
    modelo_ia: 'claude-sonnet-4-20250514',
    temperatura: '0.7',
    max_tokens: '4000',
    prompt_sistema: '',
    herramientas_disponibles: '',
    idioma_principal: 'es',
    zona_horaria: 'America/Guayaquil',
    activo: true,
    icono: '🤖',
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
  const modelos = [
    { label: 'llama3:8b', value: 'llama3:8b' },
  ];

  // ============ EFFECTS ============
  useEffect(() => {
    cargarAgentes();
    cargarEstadisticas();
  }, [filterTipo, filterEstado]);

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
      setAgentes(Array.isArray(data) ? data : []);
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
      const data = await agenteService.getEstadisticasGenerales();
      setStats(data || {
        total: 0,
        activos: 0,
        router: 0,
        especializados: 0,
      });
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  // ============ FUNCIONES DE FORMULARIO ============
  const resetForm = () => {
    setFormData({
      nombre_agente: '',
      tipo_agente: 'especializado',
      area_especialidad: '',
      descripcion: '',
      modelo_ia: 'claude-sonnet-4-20250514',
      temperatura: '0.7',
      max_tokens: '4000',
      prompt_sistema: '',
      herramientas_disponibles: '',
      idioma_principal: 'es',
      zona_horaria: 'America/Guayaquil',
      activo: true,
      icono: '🤖',
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre_agente.trim()) {
      newErrors.nombre_agente = 'El nombre es requerido';
    } else if (formData.nombre_agente.length < 3) {
      newErrors.nombre_agente = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.area_especialidad.trim()) {
      newErrors.area_especialidad = 'La especialidad es requerida';
    }

    const temp = parseFloat(formData.temperatura);
    if (isNaN(temp) || temp < 0 || temp > 2) {
      newErrors.temperatura = 'La temperatura debe estar entre 0 y 2';
    }

    const tokens = parseInt(formData.max_tokens);
    if (isNaN(tokens) || tokens < 100 || tokens > 100000) {
      newErrors.max_tokens = 'Los tokens deben estar entre 100 y 100000';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      modelo_ia: agente.modelo_ia || 'claude-sonnet-4-20250514',
      temperatura: agente.temperatura?.toString() || '0.7',
      max_tokens: agente.max_tokens?.toString() || '4000',
      prompt_sistema: agente.prompt_sistema || '',
      herramientas_disponibles: agente.herramientas_disponibles || '',
      idioma_principal: agente.idioma_principal || 'es',
      zona_horaria: agente.zona_horaria || 'America/Guayaquil',
      activo: agente.activo !== undefined ? agente.activo : true,
      icono: agente.icono || '🤖',
    });
    setShowFormModal(true);
  };

  const handleSaveForm = async () => {
    if (!validateForm()) {
      Alert.alert('Error de validación', 'Por favor, corrige los errores en el formulario');
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        temperatura: parseFloat(formData.temperatura),
        max_tokens: parseInt(formData.max_tokens),
      };

      if (formMode === 'create') {
        await agenteService.create(dataToSave);
        setSuccessMessage('✅ Agente creado correctamente');
      } else {
        await agenteService.update(selectedAgente.id_agente, dataToSave);
        setSuccessMessage('✅ Agente actualizado correctamente');
      }

      setShowSuccessMessage(true);
      setShowFormModal(false);
      cargarAgentes();
      cargarEstadisticas();
      resetForm();

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (err) {
      console.error('Error al guardar:', err);
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
  const sanitizeInput = (text) => {
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  };

  const handleSearchChange = (text) => {
    const sanitized = sanitizeInput(text);
    setSearchTerm(sanitized);
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
                <Text style={styles.statValue}>{stats.total}</Text>
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
                <Text style={styles.statValue}>{stats.activos}</Text>
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
                <Text style={styles.statValue}>{stats.router}</Text>
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
                <Text style={styles.statValue}>{stats.especializados}</Text>
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
          <View style={styles.filterContainer}>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
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
                </View>
              </TouchableOpacity>
            ))}

            {[
              { key: 'todos', label: 'Todos', icon: 'list' },
              { key: 'activo', label: 'Activos', icon: 'checkmark-circle' },
              { key: 'inactivo', label: 'Inactivos', icon: 'close-circle' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  filterEstado === filter.key && styles.filterButtonActive,
                ]}
                onPress={() => setFilterEstado(filter.key)}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
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
                </View>
              </TouchableOpacity>
            ))}
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
              
              {/* Información Básica */}
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
                  <Text style={modalStyles.label}>Tipo de Agente *</Text>
                  <View style={modalStyles.pickerContainer}>
                    <TextInput
                      style={modalStyles.picker}
                      value={formData.tipo_agente === 'especializado' ? '🎯 Especializado' : 
                             formData.tipo_agente === 'router' ? '🔀 Router' : '🔄 Híbrido'}
                      editable={false}
                    />
                    <select
                      value={formData.tipo_agente}
                      onChange={(e) => setFormData({ ...formData, tipo_agente: e.target.value })}
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
                      <option value="especializado">🎯 Especializado</option>
                      <option value="router">🔀 Router</option>
                      <option value="hibrido">🔄 Híbrido</option>
                    </select>
                  </View>
                </View>

                <View style={modalStyles.formGroup}>const modalStyles
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
                    placeholder="Describe las funciones del agente..."
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
                  <Text style={modalStyles.label}>Icono</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {iconos.map((icon) => (
                      <TouchableOpacity
                        key={icon}
                        style={[
                          modalStyles.iconOption,
                          formData.icono === icon && modalStyles.iconOptionSelected
                        ]}
                        onPress={() => setFormData({ ...formData, icono: icon })}
                      >
                        <Text style={modalStyles.iconText}>{icon}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>


{/* Configuración de IA */}
              <View style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>🤖 Configuración de IA</Text>
                
                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Modelo de IA</Text>
                  <View style={modalStyles.pickerContainer}>
                    <TextInput
                      style={modalStyles.picker}
                      value={modelos.find(m => m.value === formData.modelo_ia)?.label || 'Claude Sonnet 4'}
                      editable={false}
                    />
                    <select
                      value={formData.modelo_ia}
                      onChange={(e) => setFormData({ ...formData, modelo_ia: e.target.value })}
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
                      {modelos.map((modelo) => (
                        <option key={modelo.value} value={modelo.value}>
                          {modelo.label}
                        </option>
                      ))}
                    </select>
                  </View>
                </View>

                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Temperatura (Creatividad)</Text>
                  <TextInput
                    style={[modalStyles.input, formErrors.temperatura && modalStyles.inputError]}
                    placeholder="0.7"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={formData.temperatura}
                    onChangeText={(text) => setFormData({ ...formData, temperatura: text })}
                    keyboardType="decimal-pad"
                  />
                  {formErrors.temperatura && (
                    <Text style={modalStyles.errorText}>{formErrors.temperatura}</Text>
                  )}
                  <Text style={modalStyles.helperText}>Valor entre 0 (preciso) y 2 (creativo)</Text>
                </View>

                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Tokens Máximos</Text>
                  <TextInput
                    style={[modalStyles.input, formErrors.max_tokens && modalStyles.inputError]}
                    placeholder="4000"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={formData.max_tokens}
                    onChangeText={(text) => setFormData({ ...formData, max_tokens: text })}
                    keyboardType="number-pad"
                  />
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
              </View>

              {/* Configuración Regional */}
              <View style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>🌍 Configuración Regional</Text>
                
                 <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Idioma Principal</Text>
                  <View style={modalStyles.pickerContainer}>
                    <TextInput
                      style={modalStyles.picker}
                      value={formData.idioma_principal === 'es' ? '🇪🇸 Español' : ''}
                      editable={false}
                    />
                    <select
                      value={formData.idioma_principal}
                      onChange={(e) => setFormData({ ...formData, idioma_principal: e.target.value })}
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
                      <option value="es">🇪🇸 Español</option>
          
                    </select>
                  </View>
                </View>

                <View style={modalStyles.formGroup}>
                  <Text style={modalStyles.label}>Zona Horaria</Text>
                  <View style={modalStyles.pickerContainer}>
                    <TextInput
                      style={modalStyles.picker}
                      value={formData.zona_horaria === 'America/Guayaquil' ? 'America/Guayaquil (GMT-5)' :''}
                      editable={false}
                    />
                    <select
                      value={formData.zona_horaria}
                      onChange={(e) => setFormData({ ...formData, zona_horaria: e.target.value })}
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
                      <option value="America/Guayaquil">America/Guayaquil (GMT-5)</option>
                      
                    </select>
                  </View>
                </View>

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
                    <Text style={modalStyles.detailText}>
                      {selectedAgente.descripcion || 'Sin descripción disponible'}
                    </Text>
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
                  <View style={modalStyles.detailSection}>
                    <Text style={modalStyles.detailSectionTitle}>🌍 Configuración Regional</Text>
                    <View style={modalStyles.detailGrid}>
                      <View style={modalStyles.detailItem}>
                        <Ionicons name="language" size={16} color="#667eea" />
                        <View style={{ flex: 1 }}>
                          <Text style={modalStyles.detailLabel}>Idioma</Text>
                          <Text style={modalStyles.detailValue}>
                            {selectedAgente.idioma_principal?.toUpperCase() || 'N/A'}
                          </Text>
                        </View>
                      </View>
                      <View style={modalStyles.detailItem}>
                        <Ionicons name="time" size={16} color="#667eea" />
                        <View style={{ flex: 1 }}>
                          <Text style={modalStyles.detailLabel}>Zona Horaria</Text>
                          <Text style={modalStyles.detailValue}>
                            {selectedAgente.zona_horaria?.split('/')[1]?.replace('_', ' ') || 'N/A'}
                          </Text>
                        </View>
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


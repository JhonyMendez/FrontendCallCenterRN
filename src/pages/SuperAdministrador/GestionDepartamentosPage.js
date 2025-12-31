import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { agenteService } from '../../api/services/agenteService';
import { departamentoService } from '../../api/services/departamentoService';
import SuperAdminSidebar from '../../components/Sidebar/sidebarSuperAdmin';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';
import GestionDepartamentosCard from '../../components/SuperAdministrador/GestionDepartamentosCard';
import { styles } from '../../styles/gestionDepartamentosStyles';

export default function GestionDepartamentosPage() {
  // ============ STATE ============
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState('true');
  const [editingDepartamento, setEditingDepartamento] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [errors, setErrors] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [departamentoToDelete, setDepartamentoToDelete] = useState(null);
  const [agentesGlobal, setAgentesGlobal] = useState([]);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [agentesAsignados, setAgentesAsignados] = useState([]);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    codigo: '',
    email: '',
    telefono: '',
    ubicacion: '',
    facultad: '',
    activo: true,
  });

  // ============ VALIDACIONES ============
  const sanitizeInput = (text) => {
    // Eliminar scripts y tags HTML peligrosos
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  };

  const validateEmail = (email) => {
    if (!email) return true; // Email es opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return true; // Teléfono es opcional
    const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
    return phoneRegex.test(phone);
  };

  const validateCodigo = (codigo) => {
    // Solo letras, números, guiones y guiones bajos
    const codigoRegex = /^[A-Za-z0-9_-]+$/;
    return codigoRegex.test(codigo);
  };

  const validateForm = () => {
    const newErrors = {};

    // Nombre (requerido, mínimo 5 caracteres, máximo 100)
    if (!formData.nombre || formData.nombre.trim().length === 0) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 5) {
      newErrors.nombre = 'El nombre debe tener al menos 5 caracteres';
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    // Código (requerido, mínimo 3 caracteres, máximo 50, solo alfanumérico)
    if (!formData.codigo || formData.codigo.trim().length === 0) {
      newErrors.codigo = 'El código es obligatorio';
    } else if (formData.codigo.trim().length < 3) {
      newErrors.codigo = 'El código debe tener al menos 3 caracteres';
    } else if (formData.codigo.length > 50) {
      newErrors.codigo = 'El código no puede exceder 50 caracteres';
    } else if (!validateCodigo(formData.codigo)) {
      newErrors.codigo = 'El código solo puede contener letras, números, guiones y guiones bajos';
    }

    // Facultad (opcional, máximo 100 caracteres)
    if (formData.facultad && formData.facultad.length > 100) {
      newErrors.facultad = 'La facultad no puede exceder 100 caracteres';
    }

    // Email (opcional, pero debe ser válido si se proporciona)
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }
    if (formData.email && formData.email.length > 100) {
      newErrors.email = 'El email no puede exceder 100 caracteres';
    }

    // Teléfono (opcional, pero debe ser válido si se proporciona)
    if (formData.telefono && !validatePhone(formData.telefono)) {
      newErrors.telefono = 'El teléfono no tiene un formato válido';
    }
    if (formData.telefono && formData.telefono.length > 20) {
      newErrors.telefono = 'El teléfono no puede exceder 20 caracteres';
    }

    // Ubicación (opcional, máximo 200 caracteres)
    if (formData.ubicacion && formData.ubicacion.length > 200) {
      newErrors.ubicacion = 'La ubicación no puede exceder 200 caracteres';
    }

    // Descripción (opcional, máximo 500 caracteres)
    if (formData.descripcion && formData.descripcion.length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============ EFFECTS ============
  useEffect(() => {
    cargarDepartamentos();
  }, [filterActivo]);

  useEffect(() => {
    cargarAgentes();
  }, []);

  // ============ FUNCIONES ============
  const cargarDepartamentos = async () => {
    try {
      setLoading(true);
      // Solo cargar departamentos activos siempre
      const params = { activo: true };
      const data = await departamentoService.getAll(params);
      setDepartamentos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar departamentos:', err);
      Alert.alert('Error', 'No se pudieron cargar los departamentos');
      setDepartamentos([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarAgentes = async () => {
    try {
      console.log('📥 Cargando agentes para validación...');
      const data = await agenteService.getAll({});
      const agentesArray = Array.isArray(data) ? data : (data?.data || []);
      setAgentesGlobal(agentesArray);
      console.log('✅ Agentes cargados:', agentesArray.length);
    } catch (err) {
      console.error('Error al cargar agentes:', err);
      setAgentesGlobal([]);
    }
  };

  const handleSubmit = async () => {
    // Validar formulario
    if (!validateForm()) {
      Alert.alert('Error de validación', 'Por favor, corrige los errores en el formulario');
      return;
    }

    try {
      // Sanitizar todos los inputs antes de enviar
      const sanitizedData = {
        nombre: sanitizeInput(formData.nombre),
        codigo: sanitizeInput(formData.codigo),
        facultad: sanitizeInput(formData.facultad),
        email: sanitizeInput(formData.email),
        telefono: sanitizeInput(formData.telefono),
        ubicacion: sanitizeInput(formData.ubicacion),
        descripcion: sanitizeInput(formData.descripcion),
        activo: formData.activo,
      };

      if (editingDepartamento) {
        await departamentoService.update(editingDepartamento.id_departamento, sanitizedData);
        setSuccessMessage('✅ Departamento actualizado exitosamente');
      } else {
        await departamentoService.create(sanitizedData);
        setSuccessMessage('✅ Departamento creado exitosamente');
      }

      // Cerrar modal primero
      setShowModal(false);
      resetForm();

      // Mostrar mensaje de éxito y recargar
      setShowSuccessMessage(true);
      cargarDepartamentos();
      cargarAgentes();

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

    } catch (err) {
      console.error('Error al guardar:', err);

      // Mostrar mensaje específico del backend
      const errorMessage = err?.message || err?.data?.message || 'No se pudo guardar el departamento';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleEdit = (departamento) => {
    setEditingDepartamento(departamento);
    setFormData({
      nombre: departamento.nombre || '',
      descripcion: departamento.descripcion || '',
      codigo: departamento.codigo || '',
      email: departamento.email || '',
      telefono: departamento.telefono || '',
      ubicacion: departamento.ubicacion || '',
      facultad: departamento.facultad || '',
      activo: departamento.activo !== undefined ? departamento.activo : true,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      console.log('🔍 Verificando departamento ID:', id);
      console.log('📊 Agentes disponibles:', agentesGlobal.length);

      // Filtrar agentes que tengan este departamento asignado
      const agentesConEsteDepartamento = agentesGlobal.filter(agente => {
        const tieneDepto = agente.id_departamento &&
          agente.id_departamento.toString() === id.toString();

        if (tieneDepto) {
          console.log(`✅ Agente "${agente.nombre_agente}" tiene departamento ${id}`);
        }

        return tieneDepto;
      });

      console.log('👥 Agentes encontrados con este departamento:', agentesConEsteDepartamento);
      const cantidadAgentes = agentesConEsteDepartamento.length;

      // Si tiene agentes activos, mostrar modal de advertencia
      if (cantidadAgentes > 0) {
        setAgentesAsignados(agentesConEsteDepartamento);
        setShowWarningModal(true);
        return;
      }

      console.log('✅ No tiene agentes, procediendo a abrir modal de confirmación');

      // Si no tiene agentes, abrir el modal de confirmación
      setDepartamentoToDelete(id);
      setShowDeleteModal(true);

    } catch (err) {
      console.error('❌ Error al verificar agentes:', err);
      Alert.alert(
        'Error',
        'No se pudo verificar los agentes asignados. Por seguridad, no se permitirá la eliminación.'
      );
    }
  };

  // Nueva función para confirmar la eliminación
  const confirmDelete = async () => {
    if (!departamentoToDelete) return;

    try {
      await departamentoService.delete(departamentoToDelete);
      setSuccessMessage('🗑️ Departamento eliminado correctamente');
      setShowSuccessMessage(true);

      // Cerrar modal de confirmación
      setShowDeleteModal(false);
      setDepartamentoToDelete(null);

      // Recargar lista
      cargarDepartamentos();
      cargarAgentes(); 

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (err) {
      console.error('Error al eliminar:', err);
      const errorMessage = err?.message || err?.data?.message || 'No se pudo eliminar el departamento';
      Alert.alert('Error', errorMessage);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDepartamentoToDelete(null);
  };



  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      codigo: '',
      email: '',
      telefono: '',
      ubicacion: '',
      facultad: '',
      activo: true,
    });
    setEditingDepartamento(null);
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    // Limpiar error del campo cuando el usuario escribe
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
    setFormData({ ...formData, [field]: value });
  };

  // Sanitizar búsqueda para prevenir XSS
  const handleSearchChange = (text) => {
    const sanitized = sanitizeInput(text);
    setSearchTerm(sanitized);
  };

  const filteredDepartamentos = departamentos.filter(
    (dept) =>
      dept.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.facultad?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============ RENDER ============
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

          {/* ============ HEADER ============ */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>🏢 Departamentos</Text>
              <Text style={styles.subtitle}>
                {departamentos.length} {departamentos.length === 1 ? 'departamento registrado' : 'departamentos registrados'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                resetForm();
                setShowModal(true);
              }}
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
              shadowColor: '#10b981',
              shadowOpacity: 0.3,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 5,
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

          {/* ============ BÚSQUEDA ============ */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre, código o facultad..."
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
            <View style={[
              styles.filterButton,
              styles.filterButtonActive,
            ]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color="white"
                />
                <Text style={styles.filterTextActive}>
                  Departamentos Activos
                </Text>
              </View>
            </View>
          </View>

          {/* ============ LISTA ============ */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Cargando departamentos...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredDepartamentos}
              keyExtractor={(item) => item.id_departamento?.toString() || Math.random().toString()}
              renderItem={({ item }) => (
                <GestionDepartamentosCard
                  departamento={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="folder-open-outline" size={80} color="rgba(255, 255, 255, 0.2)" />
                  <Text style={styles.emptyText}>No se encontraron departamentos</Text>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.3)', marginTop: 8, fontSize: 14 }}>
                    {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer departamento'}
                  </Text>
                </View>
              }
            />
          )}

          {/* ============ MODAL FORMULARIO ============ */}
          <Modal visible={showModal} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modal}>

                {/* Header del Modal */}
                <View style={styles.modalHeader}>
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
                      <Ionicons
                        name={editingDepartamento ? "create-outline" : "add-circle-outline"}
                        size={28}
                        color="#667eea"
                      />
                    </View>
                    <View>
                      <Text style={styles.modalTitle}>
                        {editingDepartamento ? 'Editar Departamento' : 'Nuevo Departamento'}
                      </Text>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginTop: 2 }}>
                        {editingDepartamento ? 'Modifica la información del departamento' : 'Completa los campos requeridos'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setShowModal(false);
                      resetForm();
                    }}
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
                    <Ionicons name="close" size={22} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                {/* Contenido del Modal */}
                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>

                  {/* Nombre */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="text" size={16} color="#667eea" />
                      <Text style={styles.label}>
                        Nombre <Text style={styles.required}>*</Text>
                        <Text style={{ fontSize: 11, fontWeight: '400', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'none' }}>
                          {' '}(5-100 caracteres)
                        </Text>
                      </Text>
                    </View>
                    <TextInput
                      style={[styles.input, errors.nombre && { borderColor: '#ef4444', borderWidth: 2 }]}
                      value={formData.nombre}
                      onChangeText={(text) => handleInputChange('nombre', text)}
                      placeholder="Ej: Departamento de Sistemas"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      maxLength={100}
                    />
                    {errors.nombre && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                          {errors.nombre}
                        </Text>
                      </View>
                    )}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 11 }}>
                        {formData.nombre.length}/100 caracteres
                      </Text>
                      {formData.nombre.length >= 5 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                          <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '600' }}>Válido</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Código */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="pricetag" size={16} color="#667eea" />
                      <Text style={styles.label}>
                        Código <Text style={styles.required}>*</Text>
                        <Text style={{ fontSize: 11, fontWeight: '400', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'none' }}>
                          {' '}(3-50 caracteres, solo letras, números, - y _)
                        </Text>
                      </Text>
                    </View>
                    <TextInput
                      style={[styles.input, errors.codigo && { borderColor: '#ef4444', borderWidth: 2 }]}
                      value={formData.codigo}
                      onChangeText={(text) => handleInputChange('codigo', text)}
                      placeholder="Ej: DEPT-SIS-001"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      maxLength={50}
                      autoCapitalize="characters"
                    />
                    {errors.codigo && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                          {errors.codigo}
                        </Text>
                      </View>
                    )}
                    <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 11, marginTop: 6 }}>
                      {formData.codigo.length}/50 caracteres
                    </Text>
                  </View>

                  {/* Facultad */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="business" size={16} color="#667eea" />
                      <Text style={styles.label}>
                        Facultad
                        <Text style={{ fontSize: 11, fontWeight: '400', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'none' }}>
                          {' '}(opcional, máx. 100 caracteres)
                        </Text>
                      </Text>
                    </View>
                    <TextInput
                      style={[styles.input, errors.facultad && { borderColor: '#ef4444', borderWidth: 2 }]}
                      value={formData.facultad}
                      onChangeText={(text) => handleInputChange('facultad', text)}
                      placeholder="Ej: Ingeniería y Tecnología"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      maxLength={100}
                    />
                    {errors.facultad && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                          {errors.facultad}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Email */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="mail" size={16} color="#667eea" />
                      <Text style={styles.label}>
                        Email
                        <Text style={{ fontSize: 11, fontWeight: '400', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'none' }}>
                          {' '}(opcional, formato válido)
                        </Text>
                      </Text>
                    </View>
                    <TextInput
                      style={[styles.input, errors.email && { borderColor: '#ef4444', borderWidth: 2 }]}
                      value={formData.email}
                      onChangeText={(text) => handleInputChange('email', text)}
                      placeholder="correo@ejemplo.com"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      maxLength={100}
                    />
                    {errors.email && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                          {errors.email}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Teléfono */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="call" size={16} color="#667eea" />
                      <Text style={styles.label}>
                        Teléfono
                        <Text style={{ fontSize: 11, fontWeight: '400', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'none' }}>
                          {' '}(opcional, 7-15 caracteres)
                        </Text>
                      </Text>
                    </View>
                    <TextInput
                      style={[styles.input, errors.telefono && { borderColor: '#ef4444', borderWidth: 2 }]}
                      value={formData.telefono}
                      onChangeText={(text) => handleInputChange('telefono', text)}
                      placeholder="0991234567"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      keyboardType="phone-pad"
                      maxLength={20}
                    />
                    {errors.telefono && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                          {errors.telefono}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Ubicación */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="location" size={16} color="#667eea" />
                      <Text style={styles.label}>
                        Ubicación
                        <Text style={{ fontSize: 11, fontWeight: '400', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'none' }}>
                          {' '}(opcional, máx. 200 caracteres)
                        </Text>
                      </Text>
                    </View>
                    <TextInput
                      style={[styles.input, errors.ubicacion && { borderColor: '#ef4444', borderWidth: 2 }]}
                      value={formData.ubicacion}
                      onChangeText={(text) => handleInputChange('ubicacion', text)}
                      placeholder="Edificio A, Piso 2, Oficina 205"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      maxLength={200}
                    />
                    {errors.ubicacion && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                          {errors.ubicacion}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Descripción */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="document-text" size={16} color="#667eea" />
                      <Text style={styles.label}>
                        Descripción
                        <Text style={{ fontSize: 11, fontWeight: '400', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'none' }}>
                          {' '}(opcional, máx. 500 caracteres)
                        </Text>
                      </Text>
                    </View>
                    <TextInput
                      style={[styles.input, styles.textArea, errors.descripcion && { borderColor: '#ef4444', borderWidth: 2 }]}
                      value={formData.descripcion}
                      onChangeText={(text) => handleInputChange('descripcion', text)}
                      placeholder="Descripción detallada del departamento, sus funciones y responsabilidades..."
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      maxLength={500}
                    />
                    {errors.descripcion && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                          {errors.descripcion}
                        </Text>
                      </View>
                    )}
                    <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 11, marginTop: 6 }}>
                      {formData.descripcion.length}/500 caracteres
                    </Text>
                  </View>

                  {/* Checkbox Activo */}
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setFormData({ ...formData, activo: !formData.activo })}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={formData.activo ? 'checkbox' : 'square-outline'}
                      size={28}
                      color="#667eea"
                    />
                    <Text style={styles.checkboxLabel}>Departamento activo</Text>
                  </TouchableOpacity>

                </ScrollView>

                {/* Footer del Modal */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.secondaryButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={editingDepartamento ? "checkmark-circle" : "add-circle"}
                      size={20}
                      color="white"
                    />
                    <Text style={styles.buttonText}>
                      {editingDepartamento ? 'Actualizar' : 'Crear'}
                    </Text>
                  </TouchableOpacity>
                </View>


              </View>
            </View>
          </Modal>

           {/* ============ MODAL DE ADVERTENCIA (Departamento con agentes) ============ */}
          <Modal visible={showWarningModal} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
              <View style={[styles.modal, { maxWidth: 500, padding: 0 }]}>

                {/* Header del Modal */}
                <View style={{
                  padding: 24,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(251, 146, 60, 0.2)',
                  backgroundColor: 'rgba(251, 146, 60, 0.1)',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <View style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: 'rgba(251, 146, 60, 0.2)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: 'rgba(251, 146, 60, 0.4)',
                    }}>
                      <Ionicons name="warning" size={32} color="#fb923c" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 20,
                        fontWeight: '700',
                        color: '#fb923c',
                        marginBottom: 4,
                      }}>
                        ❌ No se puede eliminar
                      </Text>
                      <Text style={{
                        fontSize: 13,
                        color: 'rgba(255, 255, 255, 0.6)',
                      }}>
                        Este departamento tiene agentes asignados
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Contenido del Modal */}
                <ScrollView style={{ maxHeight: 400, padding: 24 }}>
                  <Text style={{
                    fontSize: 16,
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 24,
                    marginBottom: 16,
                  }}>
                    Este departamento tiene <Text style={{ fontWeight: '700', color: '#fb923c' }}>
                      {agentesAsignados.length} {agentesAsignados.length === 1 ? 'agente asignado' : 'agentes asignados'}
                    </Text>. Debes revocar todas las asignaciones antes de eliminarlo.
                  </Text>

                  {/* Lista de agentes asignados */}
                  <View style={{
                    backgroundColor: 'rgba(71, 85, 105, 0.3)',
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(251, 146, 60, 0.3)',
                    marginBottom: 16,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <Ionicons name="people" size={20} color="#fb923c" />
                      <Text style={{
                        fontSize: 15,
                        fontWeight: '700',
                        color: '#fb923c',
                      }}>
                        {agentesAsignados.length === 1 ? 'Agente asignado:' : 'Agentes asignados:'}
                      </Text>
                    </View>
                    {agentesAsignados.map((agente, index) => (
                      <View
                        key={agente.id_agente || index}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                          paddingVertical: 12,
                          paddingHorizontal: 12,
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          borderRadius: 8,
                          borderLeftWidth: 3,
                          borderLeftColor: '#667eea',
                          marginBottom: index < agentesAsignados.length - 1 ? 8 : 0,
                        }}
                      >
                        <View style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: 'rgba(102, 126, 234, 0.2)',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                          <Text style={{ fontSize: 20 }}>{agente.icono || '🤖'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: 15,
                            fontWeight: '600',
                            marginBottom: 2,
                          }}>
                            {agente.nombre_agente}
                          </Text>
                          <Text style={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontSize: 12,
                          }}>
                            {agente.area_especialidad || agente.tipo_agente}
                          </Text>
                        </View>
                        <Ionicons name="link" size={18} color="#667eea" />
                      </View>
                    ))}
                  </View>

                  {/* Instrucciones */}
                  <View style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderLeftWidth: 4,
                    borderLeftColor: '#3b82f6',
                    padding: 16,
                    borderRadius: 8,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                      <Ionicons name="information-circle" size={20} color="#3b82f6" style={{ marginTop: 2 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: '#3b82f6',
                          marginBottom: 8,
                        }}>
                          📋 Pasos para eliminar este departamento:
                        </Text>
                        <View style={{ gap: 8 }}>
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <Text style={{ color: '#3b82f6', fontWeight: '700' }}>1.</Text>
                            <Text style={{
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontSize: 13,
                              flex: 1,
                              lineHeight: 20,
                            }}>
                              Ve a <Text style={{ fontWeight: '700' }}>Gestión de Agentes</Text>
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <Text style={{ color: '#3b82f6', fontWeight: '700' }}>2.</Text>
                            <Text style={{
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontSize: 13,
                              flex: 1,
                              lineHeight: 20,
                            }}>
                              Edita {agentesAsignados.length === 1 ? 'el agente' : 'cada agente'} y quita la asignación del departamento
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <Text style={{ color: '#3b82f6', fontWeight: '700' }}>3.</Text>
                            <Text style={{
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontSize: 13,
                              flex: 1,
                              lineHeight: 20,
                            }}>
                              Regresa aquí y podrás eliminar el departamento
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </ScrollView>

                {/* Footer del Modal */}
                <View style={{
                  padding: 24,
                  paddingTop: 0,
                }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#667eea',
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 8,
                      shadowColor: '#667eea',
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 6,
                    }}
                    onPress={() => setShowWarningModal(false)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text style={{
                      color: 'white',
                      fontSize: 15,
                      fontWeight: '700',
                    }}>
                      Entendido
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* ============ MODAL DE CONFIRMACIÓN DE ELIMINACIÓN ============ */}
          <Modal visible={showDeleteModal} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
              <View style={[styles.modal, { maxWidth: 450, padding: 0 }]}>

                {/* Header del Modal */}
                <View style={{
                  padding: 24,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(239, 68, 68, 0.2)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <View style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: 'rgba(239, 68, 68, 0.4)',
                    }}>
                      <Ionicons name="warning" size={32} color="#ef4444" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 20,
                        fontWeight: '700',
                        color: '#ef4444',
                        marginBottom: 4,
                      }}>
                        Confirmar eliminación
                      </Text>
                      <Text style={{
                        fontSize: 13,
                        color: 'rgba(255, 255, 255, 0.6)',
                      }}>
                        Esta acción no se puede deshacer
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Contenido del Modal */}
                <View style={{ padding: 24 }}>
                  <Text style={{
                    fontSize: 16,
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 24,
                    marginBottom: 16,
                  }}>
                    ¿Está seguro de que desea eliminar este departamento?
                  </Text>

                  <View style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderLeftWidth: 4,
                    borderLeftColor: '#ef4444',
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 8,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                      <Ionicons name="alert-circle" size={20} color="#ef4444" style={{ marginTop: 2 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: '#ef4444',
                          marginBottom: 6,
                        }}>
                          Advertencia importante
                        </Text>
                        <Text style={{
                          fontSize: 13,
                          color: 'rgba(255, 255, 255, 0.7)',
                          lineHeight: 20,
                        }}>
                          Esta acción es permanente y no se puede deshacer desde la aplicación. El departamento será eliminado del sistema.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Footer del Modal */}
                <View style={{
                  flexDirection: 'row',
                  gap: 12,
                  padding: 24,
                  paddingTop: 0,
                }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                    onPress={cancelDelete}
                    activeOpacity={0.7}
                  >
                    <Text style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: 15,
                      fontWeight: '600',
                    }}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#ef4444',
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 8,
                      shadowColor: '#ef4444',
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 6,
                    }}
                    onPress={confirmDelete}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash" size={18} color="white" />
                    <Text style={{
                      color: 'white',
                      fontSize: 15,
                      fontWeight: '700',
                    }}>
                      Eliminar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </View>
  );
}
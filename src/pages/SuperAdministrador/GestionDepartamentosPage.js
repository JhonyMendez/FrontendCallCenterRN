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
  const [filterActivo, setFilterActivo] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingDepartamento, setEditingDepartamento] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [errors, setErrors] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
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

  // ============ FUNCIONES ============
  const cargarDepartamentos = async () => {
    try {
      setLoading(true);
      const params = filterActivo !== 'all' ? { activo: filterActivo === 'true' } : {};
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
    Alert.alert(
      'Confirmar eliminación',
      '¿Está seguro de eliminar este departamento? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await departamentoService.delete(id);
              setSuccessMessage('🗑️ Departamento eliminado correctamente');
              setShowSuccessMessage(true);
              cargarDepartamentos();
              
              // Ocultar mensaje después de 3 segundos
              setTimeout(() => {
                setShowSuccessMessage(false);
              }, 3000);
            } catch (err) {
              console.error('Error al eliminar:', err);
              const errorMessage = err?.message || 'No se pudo eliminar el departamento';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
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
            {[
              { key: 'all', label: 'Todos', icon: 'apps' },
              { key: 'true', label: 'Activos', icon: 'checkmark-circle' },
              { key: 'false', label: 'Inactivos', icon: 'close-circle' }
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  filterActivo === filter.key && styles.filterButtonActive,
                ]}
                onPress={() => setFilterActivo(filter.key)}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons 
                    name={filter.icon} 
                    size={14} 
                    color={filterActivo === filter.key ? 'white' : 'rgba(255, 255, 255, 0.6)'} 
                  />
                  <Text
                    style={[
                      styles.filterText,
                      filterActivo === filter.key && styles.filterTextActive,
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

        </View>
      </View>
    </View>
  );
}
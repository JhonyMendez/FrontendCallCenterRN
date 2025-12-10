import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
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
import { categoriaService } from '../../api/services/categoriaService';
import SuperAdminSidebar from '../../components/Sidebar/sidebarSuperAdmin';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';
import GestionCategoriaCard from '../../components/SuperAdministrador/GestionCategoriaCard';
import { styles } from '../../styles/gestionCategoriaStyles';


export default function GestionCategoriaPage() {
  // ============ STATE ============
  const [categorias, setCategorias] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAgentes, setLoadingAgentes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState('all');
  const [filterAgente, setFilterAgente] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [errors, setErrors] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [searchAgente, setSearchAgente] = useState('');
  const [searchFilterAgente, setSearchFilterAgente] = useState('');
    
  const [formData, setFormData] = useState({
  nombre: '',
  descripcion: '',
  icono: 'folder',           
  color: '#667eea',          
  orden: 0,                 
  activo: true,
  id_agente: null,
  id_categoria_padre: null,  
});

  // ============ VALIDACIONES ============
  const sanitizeInput = (text) => {
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  };


  const validateForm = () => {
    const newErrors = {};

    // Nombre (requerido, mínimo 3 caracteres, máximo 100)
    if (!formData.nombre || formData.nombre.trim().length === 0) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    // Código (requerido, mínimo 2 caracteres, máximo 50, solo alfanumérico)

    // Descripción (opcional, máximo 500 caracteres)
    if (formData.descripcion && formData.descripcion.length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    // Agente (requerido)
    if (!formData.id_agente) {
      newErrors.id_agente = 'Debes seleccionar un agente';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============ EFFECTS ============
    useEffect(() => {
    cargarAgentes();
    cargarCategorias();  
    }, []);

  // ============ FUNCIONES ============
  const cargarAgentes = async () => {
    try {
      setLoadingAgentes(true);
      const data = await agenteService.getAll({ activo: true });
      setAgentes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar agentes:', err);
      Alert.alert('Error', 'No se pudieron cargar los agentes');
      setAgentes([]);
    } finally {
      setLoadingAgentes(false);
    }
  };

  const cargarCategorias = async () => {
  try {
    setLoading(true);

    const data = await categoriaService.getAll();
    setCategorias(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('Error al cargar categorías:', err);
    Alert.alert('Error', 'No se pudieron cargar las categorías');
    setCategorias([]);
  } finally {
    setLoading(false);
  }
};


  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Error de validación', 'Por favor, corrige los errores en el formulario');
      return;
    }

    try {
        const sanitizedData = {
        nombre: sanitizeInput(formData.nombre),
        descripcion: sanitizeInput(formData.descripcion),
        icono: formData.icono,                       // ✅ NUEVO
        color: formData.color,                       // ✅ NUEVO
        orden: parseInt(formData.orden),             // ✅ NUEVO
        activo: formData.activo,
        id_agente: parseInt(formData.id_agente),
        id_categoria_padre: formData.id_categoria_padre ? parseInt(formData.id_categoria_padre) : null,  // ✅ NUEVO
    };  

      if (editingCategoria) {
        await categoriaService.update(editingCategoria.id_categoria, sanitizedData);
        setSuccessMessage('✅ Categoría actualizada exitosamente');
      } else {
        await categoriaService.create(sanitizedData);
        setSuccessMessage('✅ Categoría creada exitosamente');
      }
      
      setShowModal(false);
      resetForm();
      setShowSuccessMessage(true);
      cargarCategorias();
      
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error al guardar:', err);
      const errorMessage = err?.message || err?.data?.message || 'No se pudo guardar la categoría';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleEdit = (categoria) => {
    setEditingCategoria(categoria);
    setFormData({
    nombre: categoria.nombre || '',
    descripcion: categoria.descripcion || '',
    icono: categoria.icono || 'folder',     
    color: categoria.color || '#667eea',      
    orden: categoria.orden || 0,              
    activo: categoria.activo !== undefined ? categoria.activo : true,
    id_agente: categoria.id_agente || null,
    id_categoria_padre: categoria.id_categoria_padre || null, 
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Está seguro de eliminar esta categoría? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await categoriaService.delete(id);
              setSuccessMessage('🗑️ Categoría eliminada correctamente');
              setShowSuccessMessage(true);
              cargarCategorias();
              
              setTimeout(() => {
                setShowSuccessMessage(false);
              }, 3000);
            } catch (err) {
              console.error('Error al eliminar:', err);
              const errorMessage = err?.message || 'No se pudo eliminar la categoría';
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
    icono: 'folder',         
    color: '#667eea',        
    orden: 0,                
    activo: true,
    id_agente: null,
    id_categoria_padre: null,  
    });
    setEditingCategoria(null);
    setErrors({});
    setSearchAgente('');
  };

  const handleInputChange = (field, value) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
    setFormData({ ...formData, [field]: value });
  };

  const handleSearchChange = (text) => {
    const sanitized = sanitizeInput(text);
    setSearchTerm(sanitized);
  };

    const filteredCategorias = categorias.filter((cat) => {
    const search = searchTerm.toLowerCase();

    // Buscar por nombre o descripción
    const matchesSearch =
        !search ||
        cat.nombre?.toLowerCase().includes(search) ||
        cat.descripcion?.toLowerCase().includes(search);

    // Filtro por estado (Todas / Activas / Inactivas)
    const matchesActivo =
        filterActivo === 'all'
        ? true
        : cat.activo === (filterActivo === 'true');

    // Filtro por agente (Todos / uno específico)
    const matchesAgente =
        filterAgente === 'all'
        ? true
        : String(cat.id_agente) === String(filterAgente);

    return matchesSearch && matchesActivo && matchesAgente;
    });


  const getAgenteNombre = (id_agente) => {
    const agente = agentes.find(a => a.id_agente === id_agente);
    return agente?.nombre_agente || 'Sin agente';
  };

  const filteredAgentes = agentes.filter((agente) => {
  const search = searchAgente.toLowerCase();
  return !search || agente.nombre_agente?.toLowerCase().includes(search);
  }); 

  const filteredFilterAgentes = agentes.filter((agente) => {
  const search = searchFilterAgente.toLowerCase();
  return !search || agente.nombre_agente?.toLowerCase().includes(search);
  });

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
              <Text style={styles.title}>📁 Categorías</Text>
              <Text style={styles.subtitle}>
                {categorias.length} {categorias.length === 1 ? 'categoría registrada' : 'categorías registradas'}
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
              <Text style={styles.buttonText}>Nueva</Text>
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
              placeholder="Buscar por nombre o código..."
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
          <View style={{ paddingHorizontal: 16 }}>
            {/* Filtro por Estado */}
            <View style={styles.filterContainer}>
              {[
                { key: 'all', label: 'Todas', icon: 'apps' },
                { key: 'true', label: 'Activas', icon: 'checkmark-circle' },
                { key: 'false', label: 'Inactivas', icon: 'close-circle' }
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
                  value={searchFilterAgente}
                  onChangeText={(text) => setSearchFilterAgente(sanitizeInput(text))}
                />
                {searchFilterAgente.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchFilterAgente('')}>
                    <Ionicons name="close-circle" size={16} color="rgba(255, 255, 255, 0.4)" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Botones de filtro */}
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
                  paddingRight: 32,
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
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filterAgente === 'all' && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilterAgente('all')}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons 
                      name="globe" 
                      size={14} 
                      color={filterAgente === 'all' ? 'white' : 'rgba(255, 255, 255, 0.6)'} 
                    />
                    <Text
                      style={[
                        styles.filterText,
                        filterAgente === 'all' && styles.filterTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      Todos
                    </Text>
                  </View>
                </TouchableOpacity>

                {filteredFilterAgentes.map((agente) => (
                  <TouchableOpacity
                    key={agente.id_agente}
                    style={[
                      styles.filterButton,
                      filterAgente === agente.id_agente.toString() && styles.filterButtonActive,
                    ]}
                    onPress={() => setFilterAgente(agente.id_agente.toString())}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons 
                        name="person" 
                        size={14} 
                        color={filterAgente === agente.id_agente.toString() ? 'white' : 'rgba(255, 255, 255, 0.6)'} 
                      />
                      <Text
                        style={[
                          styles.filterText,
                          filterAgente === agente.id_agente.toString() && styles.filterTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {agente.nombre_agente}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* ============ LISTA ============ */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Cargando categorías...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredCategorias}
              keyExtractor={(item) => item.id_categoria?.toString() || Math.random().toString()}
              renderItem={({ item }) => (
                <GestionCategoriaCard
                  categoria={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  agenteNombre={getAgenteNombre(item.id_agente)}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="folder-open-outline" size={80} color="rgba(255, 255, 255, 0.2)" />
                  <Text style={styles.emptyText}>No se encontraron categorías</Text>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.3)', marginTop: 8, fontSize: 14 }}>
                    {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primera categoría'}
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
                        name={editingCategoria ? "create-outline" : "add-circle-outline"} 
                        size={28} 
                        color="#667eea" 
                      />
                    </View>
                    <View>
                      <Text style={styles.modalTitle}>
                        {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
                      </Text>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginTop: 2 }}>
                        {editingCategoria ? 'Modifica la información de la categoría' : 'Completa los campos requeridos'}
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
                  
                  {/* Selector de Agente */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="person-circle" size={16} color="#667eea" />
                      <Text style={styles.label}>
                        Agente Virtual <Text style={styles.required}>*</Text>
                      </Text>
                    </View>
                    
                  {loadingAgentes ? (
                    <View style={{
                      padding: 16,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 12,
                      alignItems: 'center',
                    }}>
                      <ActivityIndicator size="small" color="#667eea" />
                      <Text style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: 8, fontSize: 12 }}>
                        Cargando agentes...
                      </Text>
                    </View>
                  ) : (
                    <View style={{ gap: 8 }}>
                      {/* 🔍 Campo de búsqueda de agentes - SIEMPRE VISIBLE */}
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
                        marginBottom: 8,
                      }}>
                        <Ionicons name="search" size={18} color="rgba(255, 255, 255, 0.5)" />
                        <TextInput
                          style={{
                            flex: 1,
                            color: 'white',
                            fontSize: 14,
                            paddingVertical: 4,
                          }}
                          placeholder="Buscar agente..."
                          placeholderTextColor="rgba(255, 255, 255, 0.4)"
                          value={searchAgente}
                          onChangeText={(text) => setSearchAgente(sanitizeInput(text))}
                        />
                        {searchAgente.length > 0 && (
                          <TouchableOpacity onPress={() => setSearchAgente('')}>
                            <Ionicons name="close-circle" size={18} color="rgba(255, 255, 255, 0.5)" />
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Lista de agentes filtrados */}
                      {filteredAgentes.length === 0 ? (
                        <View style={{
                          padding: 20,
                          alignItems: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 12,
                        }}>
                          <Ionicons name="search-outline" size={40} color="rgba(255, 255, 255, 0.3)" />
                          <Text style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: 8, fontSize: 13 }}>
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
                              gap: 12,
                              padding: 14,
                              borderRadius: 12,
                              borderWidth: 2,
                              borderColor: formData.id_agente === agente.id_agente 
                                ? '#667eea' 
                                : 'rgba(255, 255, 255, 0.15)',
                              backgroundColor: formData.id_agente === agente.id_agente 
                                ? 'rgba(102, 126, 234, 0.2)' 
                                : 'rgba(255, 255, 255, 0.05)',
                            }}
                            onPress={() => handleInputChange('id_agente', agente.id_agente)}
                            activeOpacity={0.7}
                          >
                            <View style={{
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              backgroundColor: agente.color_tema || '#667eea',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                              <Ionicons 
                                name="person" 
                                size={22} 
                                color="white" 
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{
                                color: formData.id_agente === agente.id_agente ? '#667eea' : 'white',
                                fontWeight: '700',
                                fontSize: 15,
                              }}>
                                {agente.nombre_agente}
                              </Text>
                              <Text style={{
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontSize: 12,
                                marginTop: 2,
                              }}>
                                {agente.area_especialidad || 'Agente general'}
                              </Text>
                            </View>
                            {formData.id_agente === agente.id_agente && (
                              <Ionicons name="checkmark-circle" size={24} color="#667eea" />
                            )}
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  )}
                    
                    {errors.id_agente && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                          {errors.id_agente}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* ========== NUEVO: Selector de Categoría Padre ========== */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="git-branch" size={16} color="#667eea" />
                      <Text style={styles.label}>
                        Categoría Padre
                        <Text style={{ fontSize: 11, fontWeight: '400', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'none' }}>
                          {' '}(opcional - para subcategorías)
                        </Text>
                      </Text>
                    </View>

                    {/* Opción: Sin categoría padre (categoría principal) */}
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        padding: 14,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: formData.id_categoria_padre === null 
                          ? '#667eea' 
                          : 'rgba(255, 255, 255, 0.15)',
                        backgroundColor: formData.id_categoria_padre === null 
                          ? 'rgba(102, 126, 234, 0.2)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        marginBottom: 8,
                      }}
                      onPress={() => handleInputChange('id_categoria_padre', null)}
                      activeOpacity={0.7}
                    >
                      <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        backgroundColor: 'rgba(102, 126, 234, 0.3)',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <Ionicons name="home" size={22} color="#667eea" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          color: formData.id_categoria_padre === null ? '#667eea' : 'white',
                          fontWeight: '700',
                          fontSize: 15,
                        }}>
                          Categoría Principal
                        </Text>
                        <Text style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: 12,
                          marginTop: 2,
                        }}>
                          Sin categoría padre
                        </Text>
                      </View>
                      {formData.id_categoria_padre === null && (
                        <Ionicons name="checkmark-circle" size={24} color="#667eea" />
                      )}
                    </TouchableOpacity>

                    {/* Lista de categorías disponibles como padre */}
                    {categorias
                      .filter(cat => {
                        // Filtrar: solo categorías del mismo agente
                        if (!formData.id_agente || cat.id_agente !== formData.id_agente) return false;
                        
                        // Filtrar: no puede ser padre de sí misma (al editar)
                        if (editingCategoria && cat.id_categoria === editingCategoria.id_categoria) return false;
                        
                        // Filtrar: no mostrar categorías que ya son hijas de esta (evitar ciclos)
                        if (editingCategoria && cat.id_categoria_padre === editingCategoria.id_categoria) return false;
                        
                        return true;
                      })
                      .map((cat) => (
                        <TouchableOpacity
                          key={cat.id_categoria}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 12,
                            padding: 14,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor: formData.id_categoria_padre === cat.id_categoria 
                              ? '#667eea' 
                              : 'rgba(255, 255, 255, 0.15)',
                            backgroundColor: formData.id_categoria_padre === cat.id_categoria 
                              ? 'rgba(102, 126, 234, 0.2)' 
                              : 'rgba(255, 255, 255, 0.05)',
                            marginBottom: 8,
                          }}
                          onPress={() => handleInputChange('id_categoria_padre', cat.id_categoria)}
                          activeOpacity={0.7}
                        >
                          <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            backgroundColor: cat.color || '#667eea',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                            <Ionicons name={cat.icono || 'folder'} size={22} color="white" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{
                              color: formData.id_categoria_padre === cat.id_categoria ? '#667eea' : 'white',
                              fontWeight: '700',
                              fontSize: 15,
                            }}>
                              {cat.nombre}
                            </Text>
                            {cat.descripcion && (
                              <Text 
                                style={{
                                  color: 'rgba(255, 255, 255, 0.5)',
                                  fontSize: 12,
                                  marginTop: 2,
                                }}
                                numberOfLines={1}
                              >
                                {cat.descripcion}
                              </Text>
                            )}
                          </View>
                          {formData.id_categoria_padre === cat.id_categoria && (
                            <Ionicons name="checkmark-circle" size={24} color="#667eea" />
                          )}
                        </TouchableOpacity>
                      ))
                    }

                    {/* Mensaje si no hay categorías disponibles */}
                    {formData.id_agente && categorias.filter(cat => 
                      cat.id_agente === formData.id_agente && 
                      (!editingCategoria || cat.id_categoria !== editingCategoria.id_categoria)
                    ).length === 0 && (
                      <View style={{
                        padding: 16,
                        alignItems: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 12,
                        marginTop: 8,
                      }}>
                        <Ionicons name="information-circle" size={32} color="rgba(255, 255, 255, 0.3)" />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: 8, fontSize: 13, textAlign: 'center' }}>
                          No hay categorías disponibles del agente seleccionado
                        </Text>
                      </View>
                    )}

                    {/* Mensaje si no se ha seleccionado agente */}
                    {!formData.id_agente && (
                      <View style={{
                        padding: 16,
                        alignItems: 'center',
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: 'rgba(251, 191, 36, 0.3)',
                        marginTop: 8,
                      }}>
                        <Ionicons name="alert-circle" size={32} color="#fbbf24" />
                        <Text style={{ color: '#fbbf24', marginTop: 8, fontSize: 13, textAlign: 'center', fontWeight: '600' }}>
                          Primero selecciona un agente para ver categorías disponibles
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Nombre */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="text" size={16} color="#667eea" />
                      <Text style={styles.label}>
                        Nombre <Text style={styles.required}>*</Text>
                        <Text style={{ fontSize: 11, fontWeight: '400', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'none' }}>
                          {' '}(3-100 caracteres)
                        </Text>
                      </Text>
                    </View>
                    <TextInput
                      style={[styles.input, errors.nombre && { borderColor: '#ef4444', borderWidth: 2 }]}
                      value={formData.nombre}
                      onChangeText={(text) => handleInputChange('nombre', text)}
                      placeholder="Ej: Solicitud de Información"
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
                      {formData.nombre.length >= 3 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                          <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '600' }}>Válido</Text>
                        </View>
                      )}
                    </View>
                  </View>

                    {/* Icono */}
                    <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <Ionicons name="star" size={16} color="#667eea" />
                        <Text style={styles.label}>Icono</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        value={formData.icono}
                        onChangeText={(text) => handleInputChange('icono', text)}
                        placeholder="Ej: folder, document, star"
                        placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    />
                    </View>

                    {/* Color */}
                    <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <Ionicons name="color-palette" size={16} color="#667eea" />
                        <Text style={styles.label}>Color (Hex)</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        value={formData.color}
                        onChangeText={(text) => handleInputChange('color', text)}
                        placeholder="#667eea"
                        placeholderTextColor="rgba(255, 255, 255, 0.3)"
                        maxLength={7}
                    />
                    </View>

                    {/* Orden */}
                    <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <Ionicons name="reorder-three" size={16} color="#667eea" />
                        <Text style={styles.label}>Orden</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        value={formData.orden.toString()}
                        onChangeText={(text) => handleInputChange('orden', parseInt(text) || 0)}
                        placeholder="0"
                        placeholderTextColor="rgba(255, 255, 255, 0.3)"
                        keyboardType="numeric"
                    />
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
                      placeholder="Descripción de la categoría..."
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
                    <Text style={styles.checkboxLabel}>Categoría activa</Text>
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
                      name={editingCategoria ? "checkmark-circle" : "add-circle"} 
                      size={20} 
                      color="white" 
                    />
                    <Text style={styles.buttonText}>
                      {editingCategoria ? 'Actualizar' : 'Crear'}
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
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { agenteService } from '../../api/services/agenteService';
import { categoriaService } from '../../api/services/categoriaService';
import AdminSidebar from '../../components/Sidebar/sidebarAdmin';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';
import GestionCategoriaCard from '../../components/SuperAdministrador/GestionCategoriaCard';
import { styles } from '../../styles/gestionCategoriaStyles';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [searchAgente, setSearchAgente] = useState('');
  const [searchFilterAgente, setSearchFilterAgente] = useState('');
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [categoriaDetalle, setCategoriaDetalle] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [showAllAgentes, setShowAllAgentes] = useState(false);

  // Arrays de iconos y colores disponibles
  const iconosDisponibles = [
    'folder', 'document', 'file-tray', 'archive', 'briefcase',
    'cart', 'cash', 'card', 'calculator', 'calendar',
    'clipboard', 'bookmark', 'flag', 'star', 'heart',

    'bulb'
  ];

  const coloresDisponibles = [
    { nombre: 'Púrpura', hex: '#667eea' },
    { nombre: 'Azul', hex: '#3b82f6' },
    { nombre: 'Cyan', hex: '#06b6d4' },
    { nombre: 'Verde', hex: '#10b981' },
    { nombre: 'Lima', hex: '#84cc16' },
    { nombre: 'Amarillo', hex: '#fbbf24' },
    { nombre: 'Naranja', hex: '#f97316' },
    { nombre: 'Rojo', hex: '#ef4444' },
    { nombre: 'Rosa', hex: '#ec4899' },
    { nombre: 'Fucsia', hex: '#d946ef' },
    { nombre: 'Índigo', hex: '#6366f1' },
    { nombre: 'Violeta', hex: '#8b5cf6' },
    { nombre: 'Gris', hex: '#6b7280' },

    { nombre: 'Esmeralda', hex: '#059669' }
  ];

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    icono: 'folder',
    color: '#667eea',
    orden: 0,
    activo: true,
    eliminado: false,
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

      const categoriasActivas = Array.isArray(data)
        ? data.filter(cat => !cat.eliminado)
        : [];

      setCategorias(categoriasActivas);
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
        icono: formData.icono,
        color: formData.color,
        orden: parseInt(formData.orden),
        activo: formData.activo,
        eliminado: formData.eliminado || false,
        id_agente: parseInt(formData.id_agente),
        id_categoria_padre: formData.id_categoria_padre ? parseInt(formData.id_categoria_padre) : null,
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
      eliminado: categoria.eliminado || false,
      id_agente: categoria.id_agente || null,
      id_categoria_padre: categoria.id_categoria_padre || null,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = (id) => {
    // Guardar la categoría a eliminar y mostrar modal
    setCategoriaToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoriaToDelete) return;

    try {
      // ✅ Eliminado lógico
      await categoriaService.delete(categoriaToDelete);
      setSuccessMessage('🗑️ Categoría eliminada correctamente');
      setShowSuccessMessage(true);
      setShowDeleteModal(false);
      setCategoriaToDelete(null);
      await cargarCategorias();

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (err) {
      console.error('Error al eliminar:', err);

      setShowDeleteModal(false);
      setCategoriaToDelete(null);

      const errorMessage = err?.response?.data?.message
        || err?.message
        || 'No se pudo eliminar la categoría';

      // ✅ Mostrar modal de error personalizado
      setErrorModalMessage(errorMessage);
      setShowErrorModal(true);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      icono: 'folder',
      color: '#667eea',
      orden: 0,
      activo: true,
      eliminado: false,
      id_agente: null,
      id_categoria_padre: null,
    });
    setEditingCategoria(null);
    setErrors({});
    setSearchAgente('');
  };


  const handleOpenDetalle = (categoria) => {
    setCategoriaDetalle(categoria);
    setBreadcrumb([categoria]);
    setShowDetalleModal(true);
  };

  const handleNavigateToSubcategoria = (subcategoria) => {
    setBreadcrumb([...breadcrumb, subcategoria]);
    setCategoriaDetalle(subcategoria);
  };

  const handleBreadcrumbClick = (index) => {
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    setBreadcrumb(newBreadcrumb);
    setCategoriaDetalle(newBreadcrumb[newBreadcrumb.length - 1]);
  };

  const getSubcategorias = (idCategoriaPadre) => {
    return categorias.filter(cat =>
      cat.id_categoria_padre === idCategoriaPadre &&
      !cat.eliminado
    );
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

    const isCategoriaPadre = cat.id_categoria_padre === null;

    const noEliminada = !cat.eliminado;

    return matchesSearch && matchesActivo && matchesAgente && isCategoriaPadre && noEliminada;
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

              {/* Botones de filtro con ScrollView */}
              <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingVertical: 4,
                  paddingRight: 32,
                }}
                style={{
                  flexGrow: 0,
                }}
                onStartShouldSetResponder={() => Platform.OS === 'web'}
                onMoveShouldSetResponder={() => Platform.OS === 'web' && isDragging}
                onResponderGrant={(e) => {
                  if (Platform.OS === 'web' && e.nativeEvent.button === 0) {
                    setIsDragging(true);
                    setStartX(e.nativeEvent.pageX);
                    if (scrollRef.current) {
                      scrollRef.current.measure((x, y, width, height, pageX, pageY) => {
                        setScrollLeft(scrollRef.current.scrollLeft || 0);
                      });
                    }
                  }
                }}
                onResponderMove={(e) => {
                  if (Platform.OS === 'web' && isDragging && scrollRef.current) {
                    const x = e.nativeEvent.pageX;
                    const walk = (startX - x) * 2;
                    scrollRef.current.scrollTo({ x: (scrollLeft || 0) + walk, animated: false });
                  }
                }}
                onResponderRelease={() => {
                  if (Platform.OS === 'web') {
                    setIsDragging(false);
                  }
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 8,
                    cursor: Platform.OS === 'web' ? (isDragging ? 'grabbing' : 'grab') : 'default',
                  }}
                  onMouseDown={(e) => {
                    if (Platform.OS === 'web') {
                      e.preventDefault();
                      setIsDragging(true);
                      setStartX(e.pageX);
                      if (scrollRef.current) {
                        setScrollLeft(scrollRef.current.scrollLeft || 0);
                      }
                    }
                  }}
                  onMouseMove={(e) => {
                    if (Platform.OS === 'web' && isDragging && scrollRef.current) {
                      e.preventDefault();
                      const x = e.pageX;
                      const walk = (startX - x) * 2;
                      scrollRef.current.scrollTo({ x: (scrollLeft || 0) + walk, animated: false });
                    }
                  }}
                  onMouseUp={() => {
                    if (Platform.OS === 'web') {
                      setIsDragging(false);
                    }
                  }}
                  onMouseLeave={() => {
                    if (Platform.OS === 'web') {
                      setIsDragging(false);
                    }
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
              </ScrollView>
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
                  onPress={handleOpenDetalle}
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
              <View style={[styles.modal, !isWeb && { maxHeight: '85%', height: '85%' }]}>

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
                <ScrollView
                  style={styles.modalContent}
                  contentContainerStyle={{ paddingBottom: 120 }}
                  showsVerticalScrollIndicator={true}
                  bounces={true}
                >

                  {/* Selector de Agente */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="person-circle" size={16} color="#667eea" />
                      <Text style={styles.label}>
                        Agente Virtual <Text style={styles.required}>*</Text>
                      </Text>
                      <TooltipIcon text="Selecciona el agente virtual al que pertenecerá esta categoría." />
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
                          <>
                            {/* Mostrar solo los primeros 3 o todos según showAllAgentes */}
                            {(showAllAgentes ? filteredAgentes : filteredAgentes.slice(0, 3)).map((agente) => (
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
                            ))}

                            {/* Botón "Ver más" / "Ver menos" */}
                            {filteredAgentes.length > 3 && (
                              <TouchableOpacity
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 8,
                                  padding: 12,
                                  borderRadius: 10,
                                  backgroundColor: 'rgba(102, 126, 234, 0.15)',
                                  borderWidth: 1,
                                  borderColor: 'rgba(102, 126, 234, 0.3)',
                                  marginTop: 8,
                                }}
                                onPress={() => setShowAllAgentes(!showAllAgentes)}
                                activeOpacity={0.7}
                              >
                                <Ionicons
                                  name={showAllAgentes ? "chevron-up" : "chevron-down"}
                                  size={18}
                                  color="#667eea"
                                />
                                <Text style={{
                                  color: '#667eea',
                                  fontSize: 14,
                                  fontWeight: '600',
                                }}>
                                  {showAllAgentes
                                    ? 'Ver menos'
                                    : `Ver ${filteredAgentes.length - 3} agente${filteredAgentes.length - 3 === 1 ? '' : 's'} más`
                                  }
                                </Text>
                              </TouchableOpacity>
                            )}
                          </>
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

                  {/* ========== Selector de Categoría Padre/Hija ========== */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="git-branch" size={16} color="#667eea" />
                      <Text style={styles.label}>
                        Nivel de Categoría
                        <Text style={{ fontSize: 11, fontWeight: '400', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'none' }}>
                          {' '}(¿Es una categoría independiente o depende de otra?)
                        </Text>
                      </Text>
                      <TooltipIcon text="Elige si esta categoría es independiente (aparecerá en el menú principal) o si depende de otra categoría existente (será una subcategoría que se mostrará dentro de otra)." />
                    </View>

                    {/* Opción: Categoría independiente (sin padre) */}
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
                          Categoría Independiente
                        </Text>
                        <Text style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: 12,
                          marginTop: 2,
                        }}>
                          Aparecerá directamente en el menú principal
                        </Text>
                      </View>
                      {formData.id_categoria_padre === null && (
                        <Ionicons name="checkmark-circle" size={24} color="#667eea" />
                      )}
                    </TouchableOpacity>

                    {/* Texto explicativo si hay categorías disponibles */}
                    {formData.id_agente && categorias.filter(cat =>
                      cat.id_agente === formData.id_agente &&
                      (!editingCategoria || cat.id_categoria !== editingCategoria.id_categoria)
                    ).length > 0 && (
                        <View style={{
                          padding: 12,
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          borderRadius: 10,
                          marginBottom: 8,
                          borderLeftWidth: 3,
                          borderLeftColor: '#667eea',
                        }}>
                          <Text style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: 12,
                            lineHeight: 18,
                          }}>
                            O selecciona una categoría existente para crear una subcategoría dentro de ella:
                          </Text>
                        </View>
                      )}

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
                            No hay otras categorías disponibles del agente seleccionado.
                            Esta será una categoría independiente.
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
                          Primero selecciona un agente para ver las categorías disponibles
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
                      <TooltipIcon text="Ingresa un nombre descriptivo para la categoría. Debe tener entre 3 y 100 caracteres." />
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

                  {/* Selector de Icono */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="star" size={16} color="#667eea" />
                      <Text style={styles.label}>Icono Seleccionado</Text>
                      <TooltipIcon text="Elige un icono representativo para esta categoría. El icono ayuda a identificar visualmente la categoría en la interfaz." />
                    </View>

                    {/* Vista previa del icono seleccionado */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 16,
                      borderRadius: 12,
                      backgroundColor: 'rgba(102, 126, 234, 0.15)',
                      borderWidth: 1,
                      borderColor: 'rgba(102, 126, 234, 0.3)',
                      marginBottom: 12,
                    }}>
                      <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: formData.color || '#667eea',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <Ionicons name={formData.icono || 'folder'} size={28} color="white" />
                      </View>
                      <View>
                        <Text style={{ color: '#667eea', fontWeight: '700', fontSize: 15 }}>
                          {formData.icono || 'folder'}
                        </Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginTop: 2 }}>
                          Vista previa del icono
                        </Text>
                      </View>
                    </View>

                    {/* Grid de iconos */}
                    <View style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 8,
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      maxHeight: 300,
                    }}>
                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
                      >
                        {iconosDisponibles.map((icono) => (
                          <TouchableOpacity
                            key={icono}
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: 12,
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: formData.icono === icono
                                ? 'rgba(102, 126, 234, 0.3)'
                                : 'rgba(255, 255, 255, 0.05)',
                              borderWidth: 2,
                              borderColor: formData.icono === icono
                                ? '#667eea'
                                : 'transparent',
                            }}
                            onPress={() => handleInputChange('icono', icono)}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name={icono}
                              size={24}
                              color={formData.icono === icono ? '#667eea' : 'rgba(255, 255, 255, 0.6)'}
                            />
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>

                  {/* Selector de Color */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="color-palette" size={16} color="#667eea" />
                      <Text style={styles.label}>Color Seleccionado</Text>
                      <TooltipIcon text="Selecciona un color que identifique esta categoría. El color se usará en tarjetas, badges y otros elementos visuales." />
                    </View>

                    {/* Color actual */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 16,
                      borderRadius: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      marginBottom: 12,
                    }}>
                      <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: formData.color || '#667eea',
                        borderWidth: 2,
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      }} />
                      <View>
                        <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>
                          {coloresDisponibles.find(c => c.hex === formData.color)?.nombre || 'Personalizado'}
                        </Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginTop: 2 }}>
                          {formData.color || '#667eea'}
                        </Text>
                      </View>
                    </View>

                    {/* Grid de colores */}
                    <View style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 12,
                      padding: 16,
                      borderRadius: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}>
                      {coloresDisponibles.map((color) => (
                        <TouchableOpacity
                          key={color.hex}
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 14,
                            backgroundColor: color.hex,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 3,
                            borderColor: formData.color === color.hex
                              ? 'white'
                              : 'transparent',
                            shadowColor: color.hex,
                            shadowOpacity: formData.color === color.hex ? 0.5 : 0.2,
                            shadowRadius: 8,
                            shadowOffset: { width: 0, height: 4 },
                            elevation: formData.color === color.hex ? 8 : 2,
                          }}
                          onPress={() => handleInputChange('color', color.hex)}
                          activeOpacity={0.8}
                        >
                          {formData.color === color.hex && (
                            <Ionicons name="checkmark" size={28} color="white" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Orden */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="reorder-three" size={16} color="#667eea" />
                      <Text style={styles.label}>Orden</Text>
                      <TooltipIcon text="Define el orden de aparición de esta categoría. Un número menor aparecerá primero. Ejemplo: 1, 2, 3... Las categorías se ordenarán de menor a mayor." />
                    </View>

                    {/* Selector visual de 1 a 10 */}
                    <View style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 8,
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((numero) => (
                        <TouchableOpacity
                          key={numero}
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 12,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: formData.orden === numero
                              ? 'rgba(102, 126, 234, 0.3)'
                              : 'rgba(255, 255, 255, 0.05)',
                            borderWidth: 2,
                            borderColor: formData.orden === numero
                              ? '#667eea'
                              : 'rgba(255, 255, 255, 0.15)',
                          }}
                          onPress={() => handleInputChange('orden', numero)}
                          activeOpacity={0.7}
                        >
                          <Text style={{
                            color: formData.orden === numero ? '#667eea' : 'rgba(255, 255, 255, 0.7)',
                            fontSize: 18,
                            fontWeight: '700',
                          }}>
                            {numero}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Muestra el número seleccionado */}
                    <View style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 10,
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      borderLeftWidth: 3,
                      borderLeftColor: '#667eea',
                    }}>
                      <Text style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: 13,
                      }}>
                        Orden seleccionado: <Text style={{ color: '#667eea', fontWeight: '700', fontSize: 15 }}>{formData.orden}</Text>
                      </Text>
                    </View>
                  </View>

                  {/* Descripción */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="document-text" size={16} color="#667eea" />
                      <Text style={styles.label}>
                        Descripción
                      </Text>
                      <TooltipIcon text="Agrega una descripción detallada de la categoría. Máximo 500 caracteres." />
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

          {/* ============ MODAL DETALLE CATEGORÍA ============ */}
          <Modal visible={showDetalleModal} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
              <View style={[styles.modal, { maxWidth: 700 }]}>

                {/* Header del Modal */}
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    {/* Breadcrumb */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                      {breadcrumb.map((item, index) => (
                        <View key={item.id_categoria} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <TouchableOpacity
                            onPress={() => handleBreadcrumbClick(index)}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 8,
                              backgroundColor: index === breadcrumb.length - 1
                                ? 'rgba(102, 126, 234, 0.3)'
                                : 'rgba(255, 255, 255, 0.05)',
                            }}
                          >
                            <Text style={{
                              color: index === breadcrumb.length - 1 ? '#667eea' : 'rgba(255, 255, 255, 0.6)',
                              fontSize: 13,
                              fontWeight: index === breadcrumb.length - 1 ? '700' : '500',
                            }}>
                              {item.nombre}
                            </Text>
                          </TouchableOpacity>
                          {index < breadcrumb.length - 1 && (
                            <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.4)" />
                          )}
                        </View>
                      ))}
                    </View>

                    {/* Título e info */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        backgroundColor: categoriaDetalle?.color || '#667eea',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <Ionicons
                          name={categoriaDetalle?.icono || 'folder'}
                          size={28}
                          color="white"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalTitle}>{categoriaDetalle?.nombre}</Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginTop: 2 }}>
                          {getAgenteNombre(categoriaDetalle?.id_agente)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setShowDetalleModal(false);
                      setCategoriaDetalle(null);
                      setBreadcrumb([]);
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
                <ScrollView
                  style={styles.modalContent}
                  contentContainerStyle={{ paddingBottom: 24 }}
                  showsVerticalScrollIndicator={true}
                  bounces={true}
                >

                  {/* Información de la categoría */}
                  <View style={{ gap: 16 }}>

                    {/* Estado */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: categoriaDetalle?.activo
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                        borderWidth: 1,
                        borderColor: categoriaDetalle?.activo
                          ? 'rgba(16, 185, 129, 0.3)'
                          : 'rgba(239, 68, 68, 0.3)',
                      }}>
                        <Text style={{
                          color: categoriaDetalle?.activo ? '#10b981' : '#ef4444',
                          fontWeight: '700',
                          fontSize: 13,
                        }}>
                          {categoriaDetalle?.activo ? '✓ Activa' : '✗ Inactiva'}
                        </Text>
                      </View>

                      <View style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: 'rgba(102, 126, 234, 0.15)',
                        borderWidth: 1,
                        borderColor: 'rgba(102, 126, 234, 0.3)',
                      }}>
                        <Text style={{ color: '#667eea', fontWeight: '700', fontSize: 13 }}>
                          Orden: {categoriaDetalle?.orden || 0}
                        </Text>
                      </View>
                    </View>

                    {/* Descripción */}
                    {categoriaDetalle?.descripcion && (
                      <View style={{
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <Ionicons name="document-text" size={16} color="#667eea" />
                          <Text style={{ color: '#667eea', fontWeight: '700', fontSize: 14 }}>
                            Descripción
                          </Text>
                        </View>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, lineHeight: 20 }}>
                          {categoriaDetalle.descripcion}
                        </Text>
                      </View>
                    )}

                    {/* Acciones rápidas */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          padding: 14,
                          borderRadius: 12,
                          backgroundColor: 'rgba(102, 126, 234, 0.15)',
                          borderWidth: 1,
                          borderColor: 'rgba(102, 126, 234, 0.3)',
                        }}
                        onPress={() => {
                          setShowDetalleModal(false);
                          handleEdit(categoriaDetalle);
                        }}
                      >
                        <Ionicons name="create" size={20} color="#667eea" />
                        <Text style={{ color: '#667eea', fontWeight: '700', fontSize: 14 }}>
                          Editar
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          padding: 14,
                          borderRadius: 12,
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          borderWidth: 1,
                          borderColor: 'rgba(239, 68, 68, 0.3)',
                        }}
                        onPress={() => {
                          setShowDetalleModal(false);
                          handleDelete(categoriaDetalle?.id_categoria);
                        }}
                      >
                        <Ionicons name="trash" size={20} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 14 }}>
                          Eliminar
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Subcategorías */}
                    {categoriaDetalle && (
                      <View style={{ marginTop: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                          <Ionicons name="git-branch" size={18} color="#667eea" />
                          <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
                            Subcategorías
                          </Text>
                          <View style={{
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 6,
                            backgroundColor: 'rgba(102, 126, 234, 0.3)',
                          }}>
                            <Text style={{ color: '#667eea', fontWeight: '700', fontSize: 12 }}>
                              {getSubcategorias(categoriaDetalle.id_categoria).length}
                            </Text>
                          </View>
                        </View>

                        {getSubcategorias(categoriaDetalle.id_categoria).length > 0 ? (
                          <View style={{ gap: 12 }}>
                            {getSubcategorias(categoriaDetalle.id_categoria).map((sub) => (
                              <TouchableOpacity
                                key={sub.id_categoria}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  gap: 12,
                                  padding: 16,
                                  borderRadius: 12,
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  borderWidth: 1,
                                  borderColor: 'rgba(255, 255, 255, 0.1)',
                                }}
                                onPress={() => handleNavigateToSubcategoria(sub)}
                                activeOpacity={0.7}
                              >
                                <View style={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: 12,
                                  backgroundColor: sub.color || '#667eea',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}>
                                  <Ionicons name={sub.icono || 'folder'} size={24} color="white" />
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>
                                    {sub.nombre}
                                  </Text>
                                  {sub.descripcion && (
                                    <Text
                                      style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginTop: 2 }}
                                      numberOfLines={1}
                                    >
                                      {sub.descripcion}
                                    </Text>
                                  )}
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                    <View style={{
                                      paddingHorizontal: 6,
                                      paddingVertical: 2,
                                      borderRadius: 4,
                                      backgroundColor: sub.activo
                                        ? 'rgba(16, 185, 129, 0.2)'
                                        : 'rgba(239, 68, 68, 0.2)',
                                    }}>
                                      <Text style={{
                                        color: sub.activo ? '#10b981' : '#ef4444',
                                        fontSize: 10,
                                        fontWeight: '700',
                                      }}>
                                        {sub.activo ? 'Activa' : 'Inactiva'}
                                      </Text>
                                    </View>
                                    {getSubcategorias(sub.id_categoria).length > 0 && (
                                      <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 11 }}>
                                        {getSubcategorias(sub.id_categoria).length} sub
                                      </Text>
                                    )}
                                  </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.3)" />
                              </TouchableOpacity>
                            ))}
                          </View>
                        ) : (
                          <View style={{
                            padding: 24,
                            alignItems: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.05)',
                          }}>
                            <Ionicons name="file-tray-outline" size={40} color="rgba(255, 255, 255, 0.2)" />
                            <Text style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: 8, fontSize: 13 }}>
                              No hay subcategorías
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                  </View>

                </ScrollView>

              </View>
            </View>
          </Modal>

          {/* ============ MODAL CONFIRMACIÓN ELIMINAR ============ */}
          <Modal visible={showDeleteModal} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
              <View style={[styles.modal, { maxWidth: 500, padding: 0 }]}>

                {/* Header del Modal */}
                <View style={{
                  padding: 24,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(255, 255, 255, 0.1)',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Ionicons name="warning" size={28} color="#ef4444" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: 'white',
                        fontSize: 18,
                        fontWeight: '700',
                      }}>
                        Confirmar eliminación
                      </Text>
                      <Text style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: 13,
                        marginTop: 4,
                      }}>
                        Esta acción no se puede deshacer
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Contenido */}
                <View style={{ padding: 24 }}>
                  <Text
                    style={{
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontSize: 15,
                      lineHeight: 22,
                      textAlign: 'center',
                    }}
                  >
                    ¿Está seguro de eliminar esta categoría?
                    {'\n'}
                    Esta acción es permanente y no se podrán restaurar los datos.
                  </Text>
                </View>

                {/* Footer con botones */}
                <View style={{
                  flexDirection: 'row',
                  gap: 12,
                  padding: 24,
                  paddingTop: 0,
                }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      setShowDeleteModal(false);
                      setCategoriaToDelete(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{
                      color: 'white',
                      fontSize: 15,
                      fontWeight: '600',
                    }}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 12,
                      backgroundColor: '#ef4444',
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                    onPress={confirmDelete}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash" size={20} color="white" />
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

          {/* ============ MODAL DE ERROR ============ */}
          <Modal visible={showErrorModal} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
              <View style={[styles.modal, { maxWidth: 500, padding: 0 }]}>

                {/* Header del Modal */}
                <View style={{
                  padding: 24,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(239, 68, 68, 0.2)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Ionicons name="close-circle" size={28} color="#ef4444" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: '#ef4444',
                        fontSize: 18,
                        fontWeight: '700',
                      }}>
                        No se puede eliminar
                      </Text>
                      <Text style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: 12,
                        marginTop: 2,
                      }}>
                        La categoría tiene dependencias
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Contenido */}
                <View style={{ padding: 24 }}>
                  <View style={{
                    flexDirection: 'row',
                    gap: 12,
                    padding: 16,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: '#ef4444',
                  }}>
                    <Ionicons name="information-circle" size={24} color="#ef4444" />
                    <Text style={{
                      flex: 1,
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: 14,
                      lineHeight: 20,
                    }}>
                      {errorModalMessage}
                    </Text>
                  </View>

                  <Text style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: 13,
                    marginTop: 16,
                    lineHeight: 18,
                  }}>
                    Para eliminar esta categoría, primero debes:
                  </Text>

                  <View style={{ marginTop: 12, gap: 8 }}>
                    {errorModalMessage.includes('contenido') && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="checkmark-circle-outline" size={16} color="#667eea" />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 13 }}>
                          Eliminar o mover los contenidos asociados
                        </Text>
                      </View>
                    )}
                    {errorModalMessage.includes('subcategoría') && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="checkmark-circle-outline" size={16} color="#667eea" />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 13 }}>
                          Eliminar o mover las subcategorías
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Footer */}
                <View style={{
                  padding: 24,
                  paddingTop: 0,
                }}>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 14,
                      borderRadius: 12,
                      backgroundColor: '#667eea',
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                    onPress={() => setShowErrorModal(false)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark" size={20} color="white" />
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
        </View>
      </View>
    </View>
  );
}
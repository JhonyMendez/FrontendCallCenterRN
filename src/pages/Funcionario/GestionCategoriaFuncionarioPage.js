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
import authService from '../../api/services/authService';
import { categoriaService } from '../../api/services/categoriaService';
import { usuarioAgenteService } from '../../api/services/usuarioAgenteService';
import FuncionarioSidebar from '../../components/Sidebar/sidebarFuncionario';
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
    const [showDetalleModal, setShowDetalleModal] = useState(false);
    const [categoriaDetalle, setCategoriaDetalle] = useState(null);
    const [breadcrumb, setBreadcrumb] = useState([]);
    const [tienePermiso, setTienePermiso] = useState(false);
    const [verificandoPermiso, setVerificandoPermiso] = useState(true);
    const [agentesPermitidos, setAgentesPermitidos] = useState([]);
    const [mensajeError, setMensajeError] = useState('');
    const [departamentoUsuario, setDepartamentoUsuario] = useState(null);
    const [estadoCarga, setEstadoCarga] = useState('cargando');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoriaToDelete, setCategoriaToDelete] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState('');


    const verificarPermisoCategoria = async () => {
        try {
            setVerificandoPermiso(true);

            // 1️⃣ Obtener ID del usuario actual
            const idUsuarioActual = await authService.getUsuarioId();

            if (!idUsuarioActual) {
                setTienePermiso(false);
                setMensajeError('No se pudo obtener el usuario actual. Por favor inicia sesión nuevamente.');
                setVerificandoPermiso(false);
                return;
            }

            // 2️⃣ Obtener datos del usuario para verificar su rol
            const usuarioData = await authService.getUsuarioActual();

            console.log('👤 Usuario verificando permisos de categorías:', usuarioData?.username);

            // 3️⃣ Si es SuperAdmin, tiene acceso total
            const rolPrincipal = usuarioData?.rol_principal?.nombre_rol?.toLowerCase();

            if (rolPrincipal === 'superadministrador') {
                console.log('✅ SuperAdmin detectado - Acceso total');
                setTienePermiso(true);
                setVerificandoPermiso(false);
                return;
            }

            // 4️⃣ Para funcionarios y jefes, verificar permiso específico
            const permisosData = await usuarioAgenteService.getAgentesByUsuario(idUsuarioActual, true);

            console.log('🔍 Permisos del usuario:', permisosData);

            // 5️⃣ Verificar si tiene permiso "puede_gestionar_categorias" en AL MENOS UN agente
            const tienePermisoCategoria = permisosData?.some(relacion =>
                relacion.puede_gestionar_categorias === true
            );

            console.log('🔍 ¿Tiene permiso para gestionar categorías?:', tienePermisoCategoria);

            // 🔥 NUEVO: No setear tienePermiso aquí, se hará en cargarAgentes
            // setTienePermiso(tienePermisoCategoria);  // ❌ COMENTADO
            setAgentesPermitidos(permisosData || []);

            if (!tienePermisoCategoria) {
                setMensajeError('No tienes permisos para gestionar categorías en ningún agente. Contacta a tu administrador.');
            }

        } catch (error) {
            console.error('❌ Error verificando permisos:', error);
            setTienePermiso(false);
            setMensajeError('Error al verificar permisos. Por favor intenta nuevamente.');
        } finally {
            setVerificandoPermiso(false);
        }
    };

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
        const inicializar = async () => {
            await verificarPermisoCategoria();
            await cargarAgentes(); // ✅ Ahora carga agentes después de verificar permisos
        };
        inicializar();
    }, []);

    useEffect(() => {
        if (tienePermiso && agentes.length > 0 && estadoCarga === 'ok') {
            cargarCategorias();
        }
    }, [tienePermiso, agentes, estadoCarga]);

    // ============ FUNCIONES ============
    const cargarAgentes = async () => {
        try {
            setLoadingAgentes(true);

            // 1️⃣ Obtener ID del usuario actual
            const idUsuarioActual = await authService.getUsuarioId();

            if (!idUsuarioActual) {
                setEstadoCarga('sin_departamento');
                setMensajeError('No se pudo obtener el usuario actual. Por favor inicia sesión nuevamente.');
                setLoadingAgentes(false);
                return;
            }

            // 2️⃣ Obtener datos del usuario para verificar su departamento
            const usuarioData = await authService.getUsuarioActual();
            const rolPrincipal = usuarioData?.rol_principal?.nombre_rol?.toLowerCase();

            console.log('========================================');
            console.log('👤 Usuario actual:', usuarioData?.username);
            console.log('👤 ID Usuario:', idUsuarioActual);
            console.log('🏢 ID Departamento (directo):', usuarioData?.id_departamento);
            console.log('🏢 ID Departamento (nested):', usuarioData?.departamento?.id_departamento);
            console.log('📋 Rol Principal:', rolPrincipal);
            console.log('========================================');

            // 3️⃣ Obtener todos los agentes
            const data = await agenteService.getAll();
            const todosAgentes = Array.isArray(data) ? data : [];

            console.log('🤖 Total de agentes activos:', todosAgentes.length);

            // 4️⃣ Si es SuperAdmin, mostrar todos
            if (rolPrincipal === 'superadministrador') {
                console.log('✅ SuperAdmin - Mostrando todos los agentes');
                setAgentes(todosAgentes);
                setEstadoCarga('ok');
                setTienePermiso(true);
                setLoadingAgentes(false);
                return;
            }

            // 5️⃣ Verificar múltiples formas de obtener el departamento
            const idDepartamento =
                usuarioData?.id_departamento ||
                usuarioData?.departamento?.id_departamento ||
                usuarioData?.departamento_id;

            console.log('🔍 ID Departamento detectado:', idDepartamento);

            if (!idDepartamento) {
                console.log('❌ Usuario SIN departamento');
                setEstadoCarga('sin_departamento');
                setMensajeError('No tienes un departamento asignado. Por favor contacta a un administrador.');
                setLoadingAgentes(false);
                return;
            }

            setDepartamentoUsuario(idDepartamento);

            // 6️⃣ Buscar agente del departamento del usuario
            console.log('🔍 Buscando agente para departamento:', idDepartamento);
            console.log('🔍 Tipo de idDepartamento:', typeof idDepartamento);
            console.log('📋 Agentes disponibles:', todosAgentes.map(a => ({
                id: a.id_agente,
                nombre: a.nombre_agente,
                id_dept: a.id_departamento,
                tipo_dept: typeof a.id_departamento
            })));

            const agenteDelDepartamento = todosAgentes.find(agente => {
                const agenteDeptId = agente.id_departamento;
                const match = agenteDeptId != null && agenteDeptId.toString() === idDepartamento.toString();

                console.log(`🔍 Comparando agente "${agente.nombre_agente}":`, {
                    agente_dept: agenteDeptId,
                    usuario_dept: idDepartamento,
                    match: match
                });

                return match;
            });

            console.log('🎯 Agente encontrado:', agenteDelDepartamento);

            if (!agenteDelDepartamento) {
                console.log('❌ Departamento SIN agente asignado');
                setEstadoCarga('sin_agente');
                setMensajeError('Tu departamento aún no tiene un agente asignado. Por favor contacta a un administrador.');
                setAgentes([]);
                setLoadingAgentes(false);
                return;
            }

            console.log('✅ Agente del departamento:', agenteDelDepartamento.nombre_agente);

            // 7️⃣ Obtener permisos del usuario
            const permisosData = await usuarioAgenteService.getAgentesByUsuario(idUsuarioActual, true);

            console.log('========================================');
            console.log('🔐 PERMISOS DEL USUARIO:');
            console.log('📦 Permisos completos:', JSON.stringify(permisosData, null, 2));
            console.log('========================================');

            // 8️⃣ Verificar si tiene permiso de gestionar categorías en este agente
            const permisoDelAgente = permisosData?.find(
                relacion => relacion.id_agente === agenteDelDepartamento.id_agente
            );

            console.log('🔍 Permiso del agente específico:', permisoDelAgente);
            console.log('🔍 puede_gestionar_categorias:', permisoDelAgente?.puede_gestionar_categorias);
            console.log('🔍 Tipo:', typeof permisoDelAgente?.puede_gestionar_categorias);

            const tienePermisoCategoria = permisosData?.some(relacion =>
                relacion.id_agente === agenteDelDepartamento.id_agente &&
                relacion.puede_gestionar_categorias === true
            );

            console.log('========================================');
            console.log('🎯 RESULTADO FINAL:');
            console.log('✓ ¿Tiene permiso para gestionar categorías?:', tienePermisoCategoria);
            console.log('========================================');

            if (!tienePermisoCategoria) {
                console.log('❌ Usuario sin permiso para gestionar categorías de este agente');
                setMensajeError('No tienes permisos para gestionar categorías de este agente. Contacta a tu administrador.');
                setTienePermiso(false);
            } else {
                console.log('✅ Usuario CON permiso para gestionar categorías');
                setTienePermiso(true);
            }

            // 9️⃣ Filtrar solo el agente del departamento del usuario
            setAgentes([agenteDelDepartamento]);
            setAgentesPermitidos(permisosData);
            setEstadoCarga('ok');

        } catch (err) {
            console.error('❌ Error al cargar agentes:', err);
            console.error('❌ Stack:', err.stack);
            Alert.alert('Error', 'No se pudieron cargar los agentes');
            setAgentes([]);
            setEstadoCarga('sin_departamento');
        } finally {
            setLoadingAgentes(false);
        }
    };
    const cargarCategorias = async () => {
        try {
            setLoading(true);

            // 1️⃣ Obtener datos del usuario
            const usuarioData = await authService.getUsuarioActual();
            const rolPrincipal = usuarioData?.rol_principal?.nombre_rol?.toLowerCase();

            // 2️⃣ Obtener todas las categorías
            const data = await categoriaService.getAll();
            const todasCategorias = Array.isArray(data) ? data : [];

            // 3️⃣ Si es SuperAdmin, mostrar todas (pero filtrar eliminadas)
            if (rolPrincipal === 'superadministrador') {
                const categoriasActivas = todasCategorias.filter(cat => !cat.eliminado);
                console.log('✅ SuperAdmin - Mostrando categorías activas:', categoriasActivas.length);
                setCategorias(categoriasActivas);
            } else {
                // 4️⃣ Filtrar categorías del departamento Y no eliminadas
                const categoriasDelDepartamento = todasCategorias.filter(categoria => {
                    // Filtrar eliminadas
                    if (categoria.eliminado) return false;

                    // Buscar si el agente de esta categoría pertenece al departamento del usuario
                    const agenteDeCategoria = agentes.find(a => a.id_agente === categoria.id_agente);

                    if (!agenteDeCategoria) return false;

                    // Verificar que el agente sea del departamento del usuario
                    const esDeMiDepartamento = agenteDeCategoria.id_departamento === departamentoUsuario;

                    // Verificar que tenga permiso de gestión
                    const tienePermiso = agentesPermitidos.some(
                        relacion => relacion.id_agente === categoria.id_agente &&
                            relacion.puede_gestionar_categorias === true
                    );

                    return esDeMiDepartamento && tienePermiso;
                });

                console.log('🔒 Categorías del departamento (no eliminadas):', categoriasDelDepartamento.length);
                setCategorias(categoriasDelDepartamento);
            }

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
        // 🔥 VALIDACIÓN: Verificar que el usuario puede editar esta categoría
        // Solo si NO es SuperAdmin
        const usuarioData = authService.getUsuarioActual();
        const rolPrincipal = usuarioData?.rol_principal?.nombre_rol?.toLowerCase();

        if (rolPrincipal !== 'superadministrador') {
            // Verificar si el usuario tiene permiso para gestionar este agente
            const tienePermisoAgente = agentesPermitidos.some(
                relacion => relacion.id_agente === categoria.id_agente &&
                    relacion.puede_gestionar_categorias === true
            );

            if (!tienePermisoAgente) {
                Alert.alert(
                    '⛔ Acceso Denegado',
                    'No tienes permisos para editar categorías de este agente. Solo puedes modificar categorías de los agentes que tienes asignados.',
                    [{ text: 'Entendido', style: 'cancel' }]
                );
                return;
            }
        }

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

    const handleDelete = (id) => {
        // 🔥 VALIDACIÓN: Buscar la categoría para verificar permisos
        const categoria = categorias.find(cat => cat.id_categoria === id);

        if (!categoria) {
            Alert.alert('Error', 'No se encontró la categoría');
            return;
        }

        // 🔥 VALIDACIÓN: Verificar que el usuario puede eliminar esta categoría
        const usuarioData = authService.getUsuarioActual();
        const rolPrincipal = usuarioData?.rol_principal?.nombre_rol?.toLowerCase();

        if (rolPrincipal !== 'superadministrador') {
            const tienePermisoAgente = agentesPermitidos.some(
                relacion => relacion.id_agente === categoria.id_agente &&
                    relacion.puede_gestionar_categorias === true
            );

            if (!tienePermisoAgente) {
                Alert.alert(
                    '⛔ Acceso Denegado',
                    'No tienes permisos para eliminar categorías de este agente.',
                    [{ text: 'Entendido', style: 'cancel' }]
                );
                return;
            }
        }

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
        return categorias.filter(cat => cat.id_categoria_padre === idCategoriaPadre);
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

        // ✅ NUEVO: No mostrar categorías eliminadas
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

            {/* Sidebar */}
            <FuncionarioSidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />

            {/* Botón Toggle */}
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

            {/* Contenido Principal */}
            <View style={[
                contentStyles.mainContent,
                sidebarOpen && contentStyles.mainContentWithSidebar
            ]}>

                {/* ============ PANTALLA DE CARGA ============ */}
                {verificandoPermiso ? (
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#0f172a',
                    }}>
                        <ActivityIndicator size="large" color="#667eea" />
                        <Text style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginTop: 16,
                            fontSize: 16,
                            fontWeight: '600',
                        }}>
                            Verificando permisos...
                        </Text>
                    </View>
                ) : estadoCarga === 'cargando' ? (
                    /* ============ PANTALLA DE CARGA DE DEPARTAMENTO/AGENTE ============ */
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#667eea" />
                        <Text style={styles.loadingText}>Verificando departamento y agente...</Text>
                    </View>

                ) : estadoCarga === 'sin_departamento' ? (
                    /* ============ PANTALLA SIN DEPARTAMENTO ============ */
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 40,
                    }}>
                        <View style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            padding: 40,
                            borderRadius: 24,
                            borderWidth: 2,
                            borderColor: '#ef4444',
                            maxWidth: 500,
                            alignItems: 'center',
                        }}>
                            <Text style={{ fontSize: 64, marginBottom: 20 }}>🏢</Text>
                            <Text style={{
                                fontSize: 24,
                                fontWeight: '700',
                                color: '#ef4444',
                                marginBottom: 12,
                                textAlign: 'center',
                            }}>
                                Sin Departamento Asignado
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                color: 'rgba(255, 255, 255, 0.7)',
                                textAlign: 'center',
                                lineHeight: 22,
                            }}>
                                {mensajeError}
                            </Text>
                        </View>
                    </View>

                ) : estadoCarga === 'sin_agente' ? (
                    /* ============ PANTALLA SIN AGENTE ============ */
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 40,
                    }}>
                        <View style={{
                            backgroundColor: 'rgba(251, 191, 36, 0.1)',
                            padding: 40,
                            borderRadius: 24,
                            borderWidth: 2,
                            borderColor: '#fbbf24',
                            maxWidth: 500,
                            alignItems: 'center',
                        }}>
                            <Text style={{ fontSize: 64, marginBottom: 20 }}>🤖</Text>
                            <Text style={{
                                fontSize: 24,
                                fontWeight: '700',
                                color: '#fbbf24',
                                marginBottom: 12,
                                textAlign: 'center',
                            }}>
                                Agente No Configurado
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                color: 'rgba(255, 255, 255, 0.7)',
                                textAlign: 'center',
                                lineHeight: 22,
                            }}>
                                {mensajeError}
                            </Text>
                        </View>
                    </View>

                ) : !tienePermiso ? (
                    /* ============ PANTALLA SIN PERMISOS ============ */
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 32,
                        backgroundColor: '#0f172a',
                    }}>
                        <View style={{
                            width: 120,
                            height: 120,
                            borderRadius: 60,
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 24,
                            borderWidth: 3,
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                        }}>
                            <Ionicons name="lock-closed" size={56} color="#ef4444" />
                        </View>

                        <Text style={{
                            color: 'white',
                            fontSize: 24,
                            fontWeight: '700',
                            marginBottom: 12,
                            textAlign: 'center',
                        }}>
                            Acceso Restringido
                        </Text>

                        <Text style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: 16,
                            textAlign: 'center',
                            lineHeight: 24,
                            maxWidth: 500,
                        }}>
                            {mensajeError}
                        </Text>

                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                                marginTop: 32,
                                paddingHorizontal: 24,
                                paddingVertical: 12,
                                borderRadius: 12,
                                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                                borderWidth: 1,
                                borderColor: 'rgba(102, 126, 234, 0.3)',
                            }}
                            onPress={() => {
                                // Aquí puedes agregar navegación de regreso si tienes router
                            }}
                        >
                            <Ionicons name="arrow-back" size={20} color="#667eea" />
                            <Text style={{
                                color: '#667eea',
                                fontSize: 15,
                                fontWeight: '600',
                            }}>
                                Volver
                            </Text>
                        </TouchableOpacity>
                    </View>

                ) : estadoCarga === 'ok' && tienePermiso ? (
                    /* ============ CONTENIDO NORMAL (SI TIENE PERMISOS) ============ */
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

                        {/* Badge informativo cuando solo hay 1 agente */}
                        {agentes.length === 1 && (
                            <View style={{
                                margin: 16,
                                backgroundColor: agentes[0].activo
                                    ? 'rgba(16, 185, 129, 0.1)'
                                    : 'rgba(251, 191, 36, 0.1)',
                                padding: 12,
                                borderRadius: 10,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: agentes[0].activo
                                    ? 'rgba(16, 185, 129, 0.3)'
                                    : 'rgba(251, 191, 36, 0.3)',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 10,
                            }}>
                                <View style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 10,
                                    backgroundColor: agentes[0].activo ? '#10b981' : '#fbbf24',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    <Ionicons
                                        name={agentes[0].activo ? "checkmark-circle" : "warning"}
                                        size={20}
                                        color="white"
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{
                                        color: agentes[0].activo ? '#10b981' : '#fbbf24',
                                        fontWeight: '700',
                                        fontSize: 13
                                    }}>
                                        {agentes[0].activo ? 'Agente de tu departamento' : '⚠️ Agente Desactivado'}
                                    </Text>
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 11, marginTop: 2 }}>
                                        {agentes[0].nombre_agente} - {agentes[0].activo
                                            ? 'Gestiona solo categorías de este agente'
                                            : 'El agente está desactivado temporalmente'}
                                    </Text>
                                </View>
                            </View>
                        )}

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

                                        {/* Selector de Icono */}
                                        <View style={styles.formGroup}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                                <Ionicons name="star" size={16} color="#667eea" />
                                                <Text style={styles.label}>Icono Seleccionado</Text>
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
                                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>

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
                    </View>
                ) : null}
            </View>
        </View>
    );
}
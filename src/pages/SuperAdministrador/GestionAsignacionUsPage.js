import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { agenteService } from '../../api/services/agenteService';
import { departamentoService } from '../../api/services/departamentoService';
import { usuarioAgenteService } from '../../api/services/usuarioAgenteService';
import { usuarioService } from '../../api/services/usuarioService';
import PermisosModal from '../../components/Modals/PermisosModal';
import SuperAdminSidebar from '../../components/Sidebar/sidebarSuperAdmin';
import {
  DepartamentoCard,
  InfoCard,
  ResumenCard,
  UsuarioCard,
  UsuarioDetalleModal
} from '../../components/SuperAdministrador/GestionAsignacionUsCard';
import { styles } from '../../styles/GestionAsignacionUsStyles';

const isWeb = Platform.OS === 'web';

export default function GestionAsignacionUsPage() {
  const router = useRouter();

  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [departamentos, setDepartamentos] = useState([]);

  // Departamento seleccionado
  const [selectedDepartamento, setSelectedDepartamento] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);


  const [agentesDelDepartamento, setAgentesDelDepartamento] = useState([]);

  // Selección de usuarios
  const [selectedUsuarios, setSelectedUsuarios] = useState([]);

  // Departamento destino
  const [nuevoDepartamento, setNuevoDepartamento] = useState(null);

  // Búsqueda
  const [busquedaDept, setBusquedaDept] = useState('');
  const [busquedaUsuario, setBusquedaUsuario] = useState('');

  const [mostrarCambioDept, setMostrarCambioDept] = useState(false);
  const [mostrarAsignacionSinDept, setMostrarAsignacionSinDept] = useState(false);
  const [usuariosSinDept, setUsuariosSinDept] = useState([]);
  const [loadingSinDept, setLoadingSinDept] = useState(false);

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mostrarDetalleUsuario, setMostrarDetalleUsuario] = useState(false);
  const [mostrarModalPermisos, setMostrarModalPermisos] = useState(false);

  const [modoEdicion, setModoEdicion] = useState(false);
  const [permisosActuales, setPermisosActuales] = useState(null);
  const [usuarioEditandoPermisos, setUsuarioEditandoPermisos] = useState(null);

  const [mostrarModalRevocacion, setMostrarModalRevocacion] = useState(false);
  const [usuarioARevocar, setUsuarioARevocar] = useState(null);
  const [loadingRevocacion, setLoadingRevocacion] = useState(false);

  useEffect(() => {
    cargarDepartamentos();
  }, []);

  useEffect(() => {
    if (selectedDepartamento) {
      cargarUsuariosDepartamento(selectedDepartamento);
      cargarAgentesDelDepartamento(selectedDepartamento);
    } else {
      setUsuarios([]);
      setSelectedUsuarios([]);
      setNuevoDepartamento(null);
      setAgentesDelDepartamento([]);
    }
  }, [selectedDepartamento]);

  useEffect(() => {
    if (!mostrarAsignacionSinDept && selectedDepartamento && !mostrarCambioDept) {
      cargarUsuariosDepartamento(selectedDepartamento);
    }
  }, [mostrarAsignacionSinDept]);

  const cargarUsuariosSinDepartamento = async () => {
    try {
      setLoadingSinDept(true);
      const response = await usuarioService.listarCompleto({
        estado: 'activo'
      });

      // ✅ Filtrar: sin departamento Y solo funcionarios
      const sinDept = (response?.usuarios || []).filter(u =>
        (!u.departamento && !u.id_departamento) &&
        (u.rol_principal?.nombre_rol?.toLowerCase() === 'funcionario' ||
          u.roles?.some(r => r.nombre_rol?.toLowerCase() === 'funcionario'))
      );

      console.log('✅ Usuarios sin departamento (Funcionarios):', sinDept.length);
      setUsuariosSinDept(sinDept);
    } catch (error) {
      console.error('Error cargando usuarios sin departamento:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios sin departamento');
    } finally {
      setLoadingSinDept(false);
    }
  };

  const cargarDepartamentos = async () => {
    try {
      setLoading(true);
      const response = await departamentoService.getAll({ activo: true });
      setDepartamentos(response || []);
    } catch (error) {
      console.error('Error cargando departamentos:', error);
      Alert.alert('Error', 'No se pudieron cargar los departamentos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const cargarUsuariosDepartamento = async (idDepartamento) => {
    try {
      setLoadingUsuarios(true);
      const response = await usuarioService.listarCompleto({
        id_departamento: idDepartamento,
        estado: 'activo'
      });
      // ✅ Filtrar: solo funcionarios
      const usuariosFuncionarios = (response?.usuarios || []).filter(u =>
        u.rol_principal?.nombre_rol?.toLowerCase() === 'funcionario' ||
        u.roles?.some(r => r.nombre_rol?.toLowerCase() === 'funcionario')
      );
      console.log('✅ Funcionarios en departamento:', usuariosFuncionarios.length);
      setUsuarios(usuariosFuncionarios);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios del departamento');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const cargarAgentesDelDepartamento = async (idDepartamento) => {
    try {
      console.log('🔍 Cargando agentes para departamento:', idDepartamento);
      const agentesResponse = await obtenerAgentesDelDepartamento(idDepartamento);
      const agentes = agentesResponse || [];
      setAgentesDelDepartamento(agentes);
      console.log('✅ Agentes cargados:', agentes.length);
    } catch (error) {
      console.error('❌ Error cargando agentes del departamento:', error);
      setAgentesDelDepartamento([]);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    cargarDepartamentos();
  };

  const toggleUsuario = (idUsuario) => {
    setSelectedUsuarios(prev => {
      if (prev.includes(idUsuario)) {
        return prev.filter(id => id !== idUsuario);
      } else {
        return [...prev, idUsuario];
      }
    });
  };

  const seleccionarTodos = () => {
    const usuariosFiltrados = getUsuariosFiltrados();
    if (selectedUsuarios.length === usuariosFiltrados.length) {
      setSelectedUsuarios([]);
    } else {
      setSelectedUsuarios(usuariosFiltrados.map(u => u.id_usuario));
    }
  };

  const handleMoverUsuarios = async () => {
    // Si es asignación de usuarios sin departamento
    if (mostrarAsignacionSinDept) {
      if (selectedUsuarios.length === 0) {
        Alert.alert('⚠️', 'Debes seleccionar al menos un usuario');
        return;
      }

      if (!selectedDepartamento) {
        Alert.alert('⚠️', 'Debes seleccionar un departamento destino');
        return;
      }

      // ✅ NUEVO: Abrir modal de permisos
      setMostrarModalPermisos(true);
      return;
    }

    // Si es cambio de departamento
    if (selectedUsuarios.length === 0) {
      window.alert('⚠️ Debes seleccionar al menos un usuario para mover');
      return;
    }

    if (!nuevoDepartamento) {
      window.alert('⚠️ Selecciona el departamento destino');
      return;
    }

    const nuevoDeptoNum = Number(nuevoDepartamento);
    const selectedDeptoNum = Number(selectedDepartamento);

    if (nuevoDeptoNum === selectedDeptoNum) {
      window.alert('⚠️ El departamento destino debe ser diferente al actual');
      return;
    }

    const nombreDepartamentoDestino = getDepartamentoNombre(nuevoDeptoNum);

    if (!nombreDepartamentoDestino) {
      window.alert('❌ No se encontró el departamento destino');
      return;
    }

    const confirmar = window.confirm(`¿Mover ${selectedUsuarios.length} usuario(s) a ${nombreDepartamentoDestino}?`);

    if (!confirmar) return;

    try {
      setLoading(true);

      const promesas = selectedUsuarios.map(idUsuario =>
        usuarioService.cambiarDepartamento(idUsuario, {
          id_departamento: nuevoDeptoNum,
        })
      );

      const resultados = await Promise.all(promesas);

      window.alert(`✅ ${selectedUsuarios.length} usuario(s) movido(s) correctamente a ${nombreDepartamentoDestino}`);

      await cargarUsuariosDepartamento(selectedDepartamento);
      setSelectedUsuarios([]);
      setNuevoDepartamento(null);

    } catch (error) {
      console.error('❌ Error moviendo usuarios:', error);
      window.alert('❌ Error: ' + (error.message || 'No se pudieron mover los usuarios'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarConPermisos = async (permisos) => {
    try {
      setLoading(true);
      setMostrarModalPermisos(false);

      // ✅ NUEVO: Si es modo edición, actualizar permisos existentes
      if (modoEdicion && usuarioEditandoPermisos) {
        console.log('📝 Modo edición activado');
        console.log('📝 Usuario:', usuarioEditandoPermisos.usuario.id_usuario);
        console.log('📝 Agente:', usuarioEditandoPermisos.agente.id_agente);
        console.log('📝 Nuevos permisos:', permisos);

        try {
          await usuarioAgenteService.actualizar(
            usuarioEditandoPermisos.usuario.id_usuario,
            usuarioEditandoPermisos.agente.id_agente,
            {
              puede_ver_contenido: permisos.puede_ver_contenido,
              puede_crear_contenido: permisos.puede_crear_contenido,
              puede_editar_contenido: permisos.puede_editar_contenido,
              puede_eliminar_contenido: permisos.puede_eliminar_contenido,
              puede_publicar_contenido: permisos.puede_publicar_contenido,
              puede_ver_metricas: permisos.puede_ver_metricas,
              puede_exportar_datos: permisos.puede_exportar_datos,
              puede_configurar_agente: permisos.puede_configurar_agente,
              puede_gestionar_permisos: permisos.puede_gestionar_permisos,
              puede_gestionar_categorias: permisos.puede_gestionar_categorias,
              puede_gestionar_widgets: permisos.puede_gestionar_widgets,
            }
          );

          // Limpiar estados
          setModoEdicion(false);
          setUsuarioEditandoPermisos(null);
          setPermisosActuales(null);
          setLoading(false);

          Alert.alert(
            '✅ Permisos Actualizados',
            `Los permisos de ${usuarioEditandoPermisos.usuario.persona?.nombre} ${usuarioEditandoPermisos.usuario.persona?.apellido} se actualizaron correctamente.`,
            [{ text: 'Perfecto', style: 'default' }]
          );

          return;
        } catch (error) {
          console.error('❌ Error actualizando permisos:', error);
          Alert.alert('Error', 'No se pudieron actualizar los permisos');
          setLoading(false);
          return;
        }
      }

      // ✅ RESTO DEL CÓDIGO (para asignación nueva)
      const usuariosAsignados = selectedUsuarios.length;
      const nombreDept = departamentoActual?.nombre;
      const idsUsuarios = [...selectedUsuarios];

      console.log('🔍 Iniciando asignación de usuarios:', idsUsuarios);
      console.log('🔍 Departamento destino:', selectedDepartamento, '-', nombreDept);
      console.log('🔍 Permisos a aplicar:', permisos);

      const promesasDepartamento = idsUsuarios.map(idUsuario =>
        usuarioService.cambiarDepartamento(idUsuario, {
          id_departamento: selectedDepartamento,
        })
      );

      await Promise.all(promesasDepartamento);
      console.log('✅ Usuarios asignados al departamento exitosamente');

      const agentesResponse = await obtenerAgentesDelDepartamento(selectedDepartamento);
      const agentes = agentesResponse || [];

      console.log('🔍 Agentes obtenidos:', agentes.length, 'agente(s)');
      console.log('🔍 Detalle de agentes:', agentes.map(a => ({ id: a.id_agente, nombre: a.nombre })));

      if (agentes.length === 0) {
        // ✅ PRIMERO: Recargar datos
        await cargarUsuariosDepartamento(selectedDepartamento);
        await cargarUsuariosSinDepartamento();
        await cargarAgentesDelDepartamento(selectedDepartamento);

        // ✅ SEGUNDO: Limpiar estados (esto cierra la vista de asignación)
        setMostrarAsignacionSinDept(false);
        setSelectedUsuarios([]);
        setNuevoDepartamento(null);
        setLoading(false);

        // ✅ TERCERO: Mostrar alerta
        Alert.alert(
          '⚠️ Advertencia',
          `Los ${usuariosAsignados} usuario(s) se asignaron correctamente al departamento "${nombreDept}", pero este departamento no tiene agentes virtuales.\n\n✓ El cambio de departamento fue exitoso\n✓ Los permisos se aplicarán automáticamente cuando se creen agentes en este departamento.`,
          [{ text: 'Entendido', style: 'default' }]
        );

        return;
      }

      const promesasPermisos = [];

      for (const idUsuario of idsUsuarios) {
        for (const agente of agentes) {
          const datosAsignacion = {
            id_usuario: idUsuario,
            id_agente: agente.id_agente,
            puede_ver_contenido: permisos.puede_ver_contenido,
            puede_crear_contenido: permisos.puede_crear_contenido,
            puede_editar_contenido: permisos.puede_editar_contenido,
            puede_eliminar_contenido: permisos.puede_eliminar_contenido,
            puede_publicar_contenido: permisos.puede_publicar_contenido,
            puede_ver_metricas: permisos.puede_ver_metricas,
            puede_exportar_datos: permisos.puede_exportar_datos,
            puede_configurar_agente: permisos.puede_configurar_agente,
            puede_gestionar_permisos: permisos.puede_gestionar_permisos,
            puede_gestionar_categorias: permisos.puede_gestionar_categorias,
            puede_gestionar_widgets: permisos.puede_gestionar_widgets,
            notas: `Asignado automáticamente al ingresar al departamento ${nombreDept}`
          };

          console.log(`📝 Preparando asignación: Usuario ${idUsuario} → Agente ${agente.id_agente} (${agente.nombre})`);

          promesasPermisos.push(
            usuarioAgenteService.asignar(datosAsignacion)
          );
        }
      }

      console.log('🔍 Total de asignaciones a realizar:', promesasPermisos.length);
      console.log(`🔍 Desglose: ${idsUsuarios.length} usuario(s) × ${agentes.length} agente(s) = ${promesasPermisos.length} asignaciones`);

      if (promesasPermisos.length > 0) {
        const resultados = await Promise.all(promesasPermisos);
        console.log('✅ Asignaciones completadas:', resultados.length);
      }

      // ✅ PRIMERO: Recargar datos
      await cargarUsuariosDepartamento(selectedDepartamento);
      await cargarUsuariosSinDepartamento();
      await cargarAgentesDelDepartamento(selectedDepartamento);

      // ✅ SEGUNDO: Limpiar estados (esto cierra la vista de asignación)
      setMostrarAsignacionSinDept(false);
      setSelectedUsuarios([]);
      setNuevoDepartamento(null);
      setLoading(false);

      // ✅ TERCERO: Mostrar alerta
      const resumenPermisos = Object.entries(permisos)
        .filter(([_, value]) => value === true)
        .length;

      Alert.alert(
        '✅ Asignación Exitosa',
        `${usuariosAsignados} usuario(s) asignado(s) a "${nombreDept}"\n\n` +
        `✓ Departamento actualizado\n` +
        `✓ ${promesasPermisos.length} relación(es) usuario-agente creadas\n` +
        `✓ ${resumenPermisos} permiso(s) activo(s) por usuario`,
        [{ text: 'Perfecto', style: 'default' }]
      );

    } catch (error) {
      console.error('❌ Error asignando usuarios:', error);
      console.error('❌ Stack:', error.stack);

      Alert.alert(
        '❌ Error en la Asignación',
        `No se pudieron asignar los usuarios:\n\n${error.message || 'Error desconocido'}\n\nIntenta nuevamente o contacta al administrador.`,
        [{ text: 'Cerrar', style: 'cancel' }]
      );

      setLoading(false);
    }
  };

  const obtenerAgentesDelDepartamento = async (idDepartamento) => {
    try {
      console.log('🔍 [obtenerAgentesDelDepartamento] Buscando agentes para departamento:', idDepartamento);

      const response = await agenteService.getAll({ id_departamento: idDepartamento });

      console.log('🔍 [obtenerAgentesDelDepartamento] Respuesta completa del servicio:', response);
      console.log('🔍 [obtenerAgentesDelDepartamento] response.agentes:', response?.agentes);
      console.log('🔍 [obtenerAgentesDelDepartamento] response.data:', response?.data);
      console.log('🔍 [obtenerAgentesDelDepartamento] response directamente:', Array.isArray(response) ? response : 'No es array');

      // Intentar diferentes estructuras de respuesta
      let agentes = [];

      if (Array.isArray(response)) {
        // Caso 1: La respuesta ES directamente el array de agentes
        agentes = response;
        console.log('✅ Caso 1: response es array directo');
      } else if (response?.agentes && Array.isArray(response.agentes)) {
        // Caso 2: La respuesta tiene propiedad 'agentes'
        agentes = response.agentes;
        console.log('✅ Caso 2: response.agentes');
      } else if (response?.data && Array.isArray(response.data)) {
        // Caso 3: La respuesta tiene propiedad 'data'
        agentes = response.data;
        console.log('✅ Caso 3: response.data');
      } else if (response?.data?.agentes && Array.isArray(response.data.agentes)) {
        // Caso 4: La respuesta tiene data.agentes
        agentes = response.data.agentes;
        console.log('✅ Caso 4: response.data.agentes');
      } else {
        console.log('⚠️ No se pudo determinar la estructura de la respuesta');
      }

      // Filtrar solo agentes activos del departamento específico
      const agentesFiltrados = agentes.filter(a =>
        a.id_departamento === idDepartamento ||
        a.id_departamento === Number(idDepartamento)
      );

      console.log('🔍 [obtenerAgentesDelDepartamento] Agentes filtrados:', agentesFiltrados.length);
      console.log('🔍 [obtenerAgentesDelDepartamento] Detalle:', agentesFiltrados.map(a => ({
        id: a.id_agente,
        nombre: a.nombre,
        id_departamento: a.id_departamento
      })));

      return agentesFiltrados;
    } catch (error) {
      console.error('❌ [obtenerAgentesDelDepartamento] Error obteniendo agentes:', error);
      console.error('❌ [obtenerAgentesDelDepartamento] Error completo:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return [];
    }
  };

  const cargarPermisosUsuario = async (usuario, agente) => {
    try {
      console.log('🔍 Cargando permisos para:', { usuario: usuario.id_usuario, agente: agente.id_agente });

      const response = await usuarioAgenteService.obtenerPorUsuarioYAgente(usuario.id_usuario, agente.id_agente);

      console.log('🔍 Respuesta de permisos:', response);

      if (response) {
        return {
          puede_ver_contenido: response.puede_ver_contenido || false,
          puede_crear_contenido: response.puede_crear_contenido || false,
          puede_editar_contenido: response.puede_editar_contenido || false,
          puede_eliminar_contenido: response.puede_eliminar_contenido || false,
          puede_publicar_contenido: response.puede_publicar_contenido || false,
          puede_ver_metricas: response.puede_ver_metricas || false,
          puede_exportar_datos: response.puede_exportar_datos || false,
          puede_configurar_agente: response.puede_configurar_agente || false,
          puede_gestionar_permisos: response.puede_gestionar_permisos || false,
          puede_gestionar_categorias: response.puede_gestionar_categorias || false,
          puede_gestionar_widgets: response.puede_gestionar_widgets || false,
        };
      }

      // Si no hay permisos, retornar permisos por defecto
      return {
        puede_ver_contenido: true,
        puede_crear_contenido: true,
        puede_editar_contenido: true,
        puede_eliminar_contenido: false,
        puede_publicar_contenido: false,
        puede_ver_metricas: true,
        puede_exportar_datos: false,
        puede_configurar_agente: false,
        puede_gestionar_permisos: false,
        puede_gestionar_categorias: false,
        puede_gestionar_widgets: false,
      };
    } catch (error) {
      console.error('❌ Error cargando permisos:', error);
      // Retornar permisos por defecto en caso de error
      return {
        puede_ver_contenido: true,
        puede_crear_contenido: true,
        puede_editar_contenido: true,
        puede_eliminar_contenido: false,
        puede_publicar_contenido: false,
        puede_ver_metricas: true,
        puede_exportar_datos: false,
        puede_configurar_agente: false,
        puede_gestionar_permisos: false,
        puede_gestionar_categorias: false,
        puede_gestionar_widgets: false,
      };
    }
  };


  const handleEditarPermisos = async (usuario) => {
    try {
      console.log('📝 Iniciando edición de permisos para usuario:', usuario.id_usuario);

      // Obtener agentes del departamento del usuario
      const agentesResponse = await obtenerAgentesDelDepartamento(usuario.departamento?.id_departamento || usuario.id_departamento);
      const agentes = agentesResponse || [];

      if (agentes.length === 0) {
        // ✅ Recargar ANTES de mostrar el alert
        await cargarUsuariosDepartamento(selectedDepartamento);
        await cargarUsuariosSinDepartamento();

        // ✅ Limpiar estados
        setMostrarAsignacionSinDept(false);
        setSelectedUsuarios([]);
        setNuevoDepartamento(null);
        setLoading(false);

        Alert.alert(
          '⚠️ Advertencia',
          `Los ${usuariosAsignados} usuario(s) se asignaron correctamente al departamento "${nombreDept}", pero este departamento no tiene agentes virtuales.\n\n✓ El cambio de departamento fue exitoso\n✓ Los permisos se aplicarán automáticamente cuando se creen agentes en este departamento.`,
          [{ text: 'Entendido', style: 'default' }]
        );

        return;
      }

      // Por ahora tomamos el primer agente (puedes mejorar esto después para seleccionar cuál agente)
      const agente = agentes[0];

      // Cargar permisos actuales
      const permisos = await cargarPermisosUsuario(usuario, agente);

      console.log('📝 Permisos cargados:', permisos);

      // Configurar estado para edición
      setUsuarioEditandoPermisos({ usuario, agente });
      setPermisosActuales(permisos);
      setModoEdicion(true);
      setMostrarModalPermisos(true);

    } catch (error) {
      console.error('❌ Error al preparar edición de permisos:', error);
      Alert.alert('Error', 'No se pudieron cargar los permisos del usuario');
    }
  };

  const handleRevocarAsignacion = async (usuario) => {
    setUsuarioARevocar(usuario);
    setMostrarModalRevocacion(true);
  };

  const confirmarRevocacion = async () => {
    if (!usuarioARevocar) return;

    try {
      setLoadingRevocacion(true);

      const nombreUsuario = `${usuarioARevocar.persona?.nombre} ${usuarioARevocar.persona?.apellido}`;

      // 1. Obtener agentes del departamento
      const agentesResponse = await obtenerAgentesDelDepartamento(
        usuarioARevocar.departamento?.id_departamento || usuarioARevocar.id_departamento
      );
      const agentes = agentesResponse || [];

      // 2. ELIMINAR registros de usuario_agente
      if (agentes.length > 0) {
        const promesasEliminar = agentes.map(agente =>
          usuarioAgenteService.eliminar(
            usuarioARevocar.id_usuario,
            agente.id_agente
          )
        );

        await Promise.all(promesasEliminar);
        console.log('✅ Registros eliminados de usuario_agente:', agentes.length, 'agente(s)');
      }

      // 3. Remover departamento del usuario
      await usuarioService.cambiarDepartamento(usuarioARevocar.id_usuario, {
        id_departamento: null,
      });

      console.log('✅ Departamento removido del usuario');

      // 4. Recargar datos
      await cargarUsuariosDepartamento(selectedDepartamento);

      setLoadingRevocacion(false);
      setMostrarModalRevocacion(false);
      setUsuarioARevocar(null);

      Alert.alert(
        '✅ Revocación Exitosa',
        `${nombreUsuario} ha sido removido del departamento.\n\n` +
        `✓ Departamento: Removido\n` +
        `✓ Relaciones usuario-agente: Eliminadas (${agentes.length} registro(s))`,
        [{ text: 'Entendido', style: 'default' }]
      );

    } catch (error) {
      console.error('❌ Error revocando asignación:', error);
      setLoadingRevocacion(false);
      Alert.alert('Error', 'No se pudo revocar la asignación: ' + error.message);
    }
  };

  const getDepartamentoNombre = (idDepartamento) => {
    return departamentos.find(d => d.id_departamento === idDepartamento)?.nombre || '';
  };

  const getDepartamentosFiltrados = () => {
    if (!busquedaDept.trim()) return departamentos;

    const busqueda = busquedaDept.toLowerCase();
    return departamentos.filter(d =>
      d.nombre.toLowerCase().includes(busqueda) ||
      d.codigo.toLowerCase().includes(busqueda) ||
      (d.facultad && d.facultad.toLowerCase().includes(busqueda))
    );
  };

  const getUsuariosFiltrados = () => {
    if (!busquedaUsuario.trim()) return usuarios;

    const busqueda = busquedaUsuario.toLowerCase();
    return usuarios.filter(u =>
      u.persona?.nombre.toLowerCase().includes(busqueda) ||
      u.persona?.apellido.toLowerCase().includes(busqueda) ||
      u.username.toLowerCase().includes(busqueda) ||
      u.email.toLowerCase().includes(busqueda) ||
      (u.persona?.cedula && u.persona.cedula.includes(busqueda))
    );
  };

  const resetSeleccion = () => {
    setSelectedDepartamento(null);
    setSelectedUsuarios([]);
    setNuevoDepartamento(null);
    setBusquedaUsuario('');
    setMostrarCambioDept(false);
    setMostrarAsignacionSinDept(false);
    setUsuariosSinDept([]);
  };

  const departamentoActual = departamentos.find(d => d.id_departamento === selectedDepartamento);
  const departamentoDestino = departamentos.find(d => Number(d.id_departamento) === Number(nuevoDepartamento));

  const departamentosFiltrados = getDepartamentosFiltrados();
  const usuariosFiltrados = getUsuariosFiltrados();
  const ModalRevocacion = () => {
    if (!mostrarModalRevocacion || !usuarioARevocar) return null;

    const nombreCompleto = `${usuarioARevocar.persona?.nombre} ${usuarioARevocar.persona?.apellido}`;
    const nombreDepartamento = usuarioARevocar.departamento?.nombre || 'departamento';

    return (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: 20,
      }}>
        <View style={{
          backgroundColor: '#ffffff',
          borderRadius: 20,
          padding: 24,
          width: '100%',
          maxWidth: 500,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}>

          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#fee2e2',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <Ionicons name="warning" size={48} color="#ef4444" />
            </View>
            <Text style={{
              fontSize: 24,
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: 8,
            }}>
              Confirmar Revocación
            </Text>
          </View>

          {/* Contenido */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontSize: 16,
              color: '#4b5563',
              lineHeight: 24,
              textAlign: 'center',
              marginBottom: 16,
            }}>
              ¿Estás seguro de revocar la asignación de{' '}
              <Text style={{ fontWeight: '700', color: '#1f2937' }}>{nombreCompleto}</Text>
              {' '}del departamento{' '}
              <Text style={{ fontWeight: '700', color: '#1f2937' }}>"{nombreDepartamento}"</Text>?
            </Text>

            <View style={{
              backgroundColor: '#fef3c7',
              padding: 16,
              borderRadius: 12,
              borderLeftWidth: 4,
              borderLeftColor: '#f59e0b',
            }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#92400e',
                marginBottom: 8,
              }}>
                Esta acción realizará lo siguiente:
              </Text>
              <View style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Text style={{ color: '#92400e', marginRight: 8 }}>•</Text>
                  <Text style={{ flex: 1, color: '#92400e', fontSize: 14 }}>
                    Removerá el departamento del usuario
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Text style={{ color: '#92400e', marginRight: 8 }}>•</Text>
                  <Text style={{ flex: 1, color: '#92400e', fontSize: 14 }}>
                    Desactivará todos los permisos en los agentes virtuales
                  </Text>
                </View>
              </View>
            </View>

            <View style={{
              backgroundColor: '#dbeafe',
              padding: 12,
              borderRadius: 8,
              marginTop: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}>
              <Ionicons name="information-circle" size={20} color="#2563eb" />
              <Text style={{
                flex: 1,
                fontSize: 13,
                color: '#1e40af',
              }}>
                Esta acción puede revertirse asignándolo nuevamente
              </Text>
            </View>
          </View>

          {/* Botones */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 10,
                backgroundColor: '#f3f4f6',
                alignItems: 'center',
              }}
              onPress={() => {
                setMostrarModalRevocacion(false);
                setUsuarioARevocar(null);
              }}
              disabled={loadingRevocacion}
              activeOpacity={0.7}
            >
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#4b5563',
              }}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 10,
                backgroundColor: loadingRevocacion ? '#fca5a5' : '#ef4444',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}
              onPress={confirmarRevocacion}
              disabled={loadingRevocacion}
              activeOpacity={0.7}
            >
              {loadingRevocacion ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#ffffff',
                  }}>
                    Revocando...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color="#ffffff" />
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#ffffff',
                  }}>
                    Revocar
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.wrapper}>

      {/* Sidebar WEB - Fijo al lado */}
      {isWeb && (
        <SuperAdminSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onNavigate={() => setSidebarOpen(false)}
        />
      )}

      {/* Botón Toggle */}
      <TouchableOpacity
        style={[
          styles.toggleButton,
          { left: sidebarOpen ? 296 : 16 }
        ]}
        onPress={() => setSidebarOpen(!sidebarOpen)}
      >
        <Ionicons name={sidebarOpen ? "close" : "menu"} size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Contenido Principal */}
      <View style={styles.mainContent}>
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="swap-horizontal" size={28} color="#3b82f6" />
              </View>
              <View>
                <Text style={styles.title}>Asignacion por Departamentos</Text>
                <Text style={styles.subtitle}>
                  {departamentos.length} departamentos • {usuarios.length} usuarios en departamento seleccionado
                </Text>
              </View>
            </View>

            {selectedDepartamento && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetSeleccion}
              >
                <Ionicons name="close-circle" size={20} color="#ef4444" />
                <Text style={styles.resetButtonText}>Limpiar Selección</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Breadcrumb */}
          {selectedDepartamento && (
            <View style={styles.breadcrumb}>
              <TouchableOpacity
                style={styles.breadcrumbItem}
                onPress={resetSeleccion}
              >
                <Ionicons name="home" size={16} color="#3b82f6" />
                <Text style={styles.breadcrumbText}>Departamentos</Text>
              </TouchableOpacity>
              <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
              <View style={styles.breadcrumbItem}>
                <Text style={styles.breadcrumbTextActive}>
                  {departamentoActual?.nombre}
                </Text>
              </View>
            </View>
          )}

          {/* PASO 1: Seleccionar Departamento */}
          {!selectedDepartamento ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>1</Text>
                </View>
                <Text style={styles.sectionTitle}>Selecciona un Departamento</Text>
              </View>

              {/* Búsqueda Departamentos */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#94a3b8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar departamento por nombre, código o facultad..."
                  placeholderTextColor="#94a3b8"
                  value={busquedaDept}
                  onChangeText={setBusquedaDept}
                />
                {busquedaDept.length > 0 && (
                  <TouchableOpacity onPress={() => setBusquedaDept('')}>
                    <Ionicons name="close-circle" size={20} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text style={styles.loadingText}>Cargando departamentos...</Text>
                </View>
              ) : departamentosFiltrados.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="business-outline" size={64} color="#cbd5e1" />
                  <Text style={styles.emptyTitle}>No se encontraron departamentos</Text>
                  <Text style={styles.emptyText}>
                    {busquedaDept ? 'Intenta con otros términos de búsqueda' : 'No hay departamentos disponibles'}
                  </Text>
                </View>
              ) : (
                <View style={styles.departamentosGrid}>
                  {departamentosFiltrados.map((dept) => (
                    <DepartamentoCard
                      key={dept.id_departamento}
                      departamento={dept}
                      onPress={() => setSelectedDepartamento(dept.id_departamento)}
                      isSelected={false}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <>
              {/* PASO 2: Ver Usuarios del Departamento */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepNumber}>2</Text>
                  </View>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>Usuarios en {departamentoActual?.nombre}</Text>
                    <Text style={styles.sectionSubtitle}>
                      {usuarios.length} usuarios totales
                      {mostrarCambioDept && ` • ${selectedUsuarios.length} seleccionados`}
                    </Text>
                  </View>
                </View>

                {/* Botones de Acción */}
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.actionToggleButton, mostrarCambioDept && styles.actionToggleButtonActive]}
                    onPress={() => {
                      setMostrarCambioDept(!mostrarCambioDept);
                      setMostrarAsignacionSinDept(false);
                      setSelectedUsuarios([]);
                      setNuevoDepartamento(null);
                    }}
                  >
                    <Ionicons name="swap-horizontal" size={20} color={mostrarCambioDept ? "#ffffff" : "#3b82f6"} />
                    <Text style={[styles.actionToggleText, mostrarCambioDept && styles.actionToggleTextActive]}>
                      {mostrarCambioDept ? 'Cancelar Cambio' : 'Cambiar de Departamento'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionToggleButton, mostrarAsignacionSinDept && styles.actionToggleButtonActive]}
                    onPress={() => {
                      setMostrarAsignacionSinDept(!mostrarAsignacionSinDept);
                      setMostrarCambioDept(false);
                      setSelectedUsuarios([]);
                      setNuevoDepartamento(null);

                      if (!mostrarAsignacionSinDept) {
                        cargarUsuariosSinDepartamento();
                      }
                    }}
                  >
                    <Ionicons name="add-circle" size={20} color={mostrarAsignacionSinDept ? "#ffffff" : "#10b981"} />
                    <Text style={[styles.actionToggleText, mostrarAsignacionSinDept && styles.actionToggleTextActive]}>
                      {mostrarAsignacionSinDept ? 'Cancelar Asignación' : 'Asignar Usuarios Sin Departamento'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Mostrar usuarios sin departamento (para asignar) */}
                {mostrarAsignacionSinDept ? (
                  <>
                    <InfoCard
                      icon="information-circle"
                      color="#10b981"
                      text={`Selecciona usuarios sin departamento para asignarlos a ${departamentoActual?.nombre}`}
                    />

                    <TouchableOpacity
                      style={[styles.actionToggleButton]}
                      onPress={() => setMostrarAsignacionSinDept(false)}
                    >
                      <Ionicons name="arrow-back" size={20} color="#3b82f6" />
                      <Text style={styles.actionToggleText}>
                        Volver a Usuarios del Departamento
                      </Text>
                    </TouchableOpacity>

                    {loadingSinDept ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#10b981" />
                        <Text style={styles.loadingText}>Cargando usuarios sin departamento...</Text>
                      </View>
                    ) : usuariosSinDept.length === 0 ? (
                      <View style={styles.emptyContainer}>
                        <Ionicons name="checkmark-circle" size={64} color="#10b981" />
                        <Text style={styles.emptyTitle}>Todos los usuarios tienen departamento</Text>
                      </View>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={styles.selectAllButton}
                          onPress={() => {
                            if (selectedUsuarios.length === usuariosSinDept.length) {
                              setSelectedUsuarios([]);
                            } else {
                              setSelectedUsuarios(usuariosSinDept.map(u => u.id_usuario));
                            }
                          }}
                        >
                          <Ionicons
                            name={selectedUsuarios.length === usuariosSinDept.length ? "checkbox" : "square-outline"}
                            size={20}
                            color="#10b981"
                          />
                          <Text style={styles.selectAllText}>
                            {selectedUsuarios.length === usuariosSinDept.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                          </Text>
                        </TouchableOpacity>

                        <View style={styles.usuariosList}>
                          {usuariosSinDept.map((usuario) => (
                            <UsuarioCard
                              key={usuario.id_usuario}
                              usuario={usuario}
                              isSelected={selectedUsuarios.includes(usuario.id_usuario)}
                              onPress={() => toggleUsuario(usuario.id_usuario)}
                              showCheckbox={true}
                              showChevron={false}
                              showNoDeptBadge={true}
                              checkboxColor="#10b981"
                              selectedStyle="green"
                            />
                          ))}
                        </View>

                        {selectedUsuarios.length > 0 && (
                          <ResumenCard
                            selectedCount={selectedUsuarios.length}
                            departamentoOrigen={null}
                            departamentoDestino={departamentoActual}
                            loading={loading}
                            onConfirm={handleMoverUsuarios}
                            confirmButtonText={`Confirmar y Asignar ${selectedUsuarios.length} Usuario(s)`}
                            confirmButtonColor="#10b981"
                            isAsignacion={true}
                          />
                        )}
                      </>
                    )}
                  </>
                ) : (
                  /* Mostrar usuarios del departamento actual */
                  <>
                    {/* Búsqueda Usuarios */}
                    <View style={styles.searchContainer}>
                      <Ionicons name="search" size={20} color="#94a3b8" />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar usuario..."
                        placeholderTextColor="#94a3b8"
                        value={busquedaUsuario}
                        onChangeText={setBusquedaUsuario}
                      />
                      {busquedaUsuario.length > 0 && (
                        <TouchableOpacity onPress={() => setBusquedaUsuario('')}>
                          <Ionicons name="close-circle" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                      )}
                    </View>

                    {mostrarCambioDept && usuariosFiltrados.length > 0 && (
                      <TouchableOpacity
                        style={styles.selectAllButton}
                        onPress={seleccionarTodos}
                      >
                        <Ionicons
                          name={selectedUsuarios.length === usuariosFiltrados.length ? "checkbox" : "square-outline"}
                          size={20}
                          color="#3b82f6"
                        />
                        <Text style={styles.selectAllText}>
                          {selectedUsuarios.length === usuariosFiltrados.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {loadingUsuarios ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text style={styles.loadingText}>Cargando usuarios...</Text>
                      </View>
                    ) : usuariosFiltrados.length === 0 ? (
                      <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyTitle}>No hay usuarios en este departamento</Text>
                        <Text style={styles.emptyText}>
                          {busquedaUsuario ? 'Intenta con otros términos' : 'Este departamento no tiene usuarios asignados'}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.usuariosList}>
                        {usuariosFiltrados.map((usuario) => {
                          console.log('🔍 Renderizando usuario:', usuario.persona?.nombre, 'showEdit:', !mostrarCambioDept);
                          return (
                            <UsuarioCard
                              key={usuario.id_usuario}
                              usuario={usuario}
                              isSelected={selectedUsuarios.includes(usuario.id_usuario)}
                              onPress={() => {
                                if (mostrarCambioDept) {
                                  toggleUsuario(usuario.id_usuario);
                                } else {
                                  setUsuarioSeleccionado(usuario);
                                  setMostrarDetalleUsuario(true);
                                }
                              }}
                              showCheckbox={mostrarCambioDept}
                              showChevron={false}
                              showEditPermisosButton={!mostrarCambioDept && agentesDelDepartamento.length > 0}
                              onPressEditPermisos={handleEditarPermisos}
                            />
                          );
                        })}
                      </View>
                    )}
                  </>
                )}
              </View>

              {/* PASO 3: Seleccionar Departamento Destino */}
              {selectedUsuarios.length > 0 && mostrarCambioDept && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepNumber}>3</Text>
                    </View>
                    <Text style={styles.sectionTitle}>Selecciona Departamento Destino</Text>
                  </View>

                  <View style={styles.departamentosGrid}>
                    {departamentos
                      .filter(d => d.id_departamento !== selectedDepartamento)
                      .map((dept) => (
                        <DepartamentoCard
                          key={dept.id_departamento}
                          departamento={dept}
                          onPress={() => setNuevoDepartamento(dept.id_departamento)}
                          isSelected={nuevoDepartamento === dept.id_departamento}
                          showRadio={true}
                        />
                      ))}
                  </View>
                </View>
              )}

              {/* Resumen del Cambio */}
              {nuevoDepartamento && departamentoActual && departamentoDestino && selectedUsuarios.length > 0 && (
                <ResumenCard
                  selectedCount={selectedUsuarios.length}
                  departamentoOrigen={departamentoActual}
                  departamentoDestino={departamentoDestino}
                  loading={loading}
                  onConfirm={handleMoverUsuarios}
                  confirmButtonText="Confirmar cambio de departamento"
                />
              )}
            </>
          )}

        </ScrollView>
      </View>

      {/* Modal de Detalle de Usuario */}
      {mostrarDetalleUsuario && usuarioSeleccionado && (
        <UsuarioDetalleModal
          usuario={usuarioSeleccionado}
          onClose={() => {
            setMostrarDetalleUsuario(false);
            setUsuarioSeleccionado(null);
          }}
          onEditarPermisos={(usuario) => {
            setMostrarDetalleUsuario(false);
            handleEditarPermisos(usuario);
          }}
          onRevocarAsignacion={handleRevocarAsignacion}
        />
      )}

      {/* ✅ NUEVO: Modal de Permisos */}
      <PermisosModal
        isOpen={mostrarModalPermisos}
        onClose={() => {
          setMostrarModalPermisos(false);
          setModoEdicion(false);
          setUsuarioEditandoPermisos(null);
          setPermisosActuales(null);
        }}
        onConfirm={handleConfirmarConPermisos}
        selectedCount={modoEdicion ? 1 : selectedUsuarios.length}
        departamentoDestino={modoEdicion ? usuarioEditandoPermisos?.usuario?.departamento : departamentoActual}
        permisosIniciales={modoEdicion ? permisosActuales : null}
        modoEdicion={modoEdicion}
        usuarioEditando={usuarioEditandoPermisos?.usuario}
      />
      {/* ✅ Modal de Revocación */}
      <ModalRevocacion />

      {/* Sidebar MÓVIL - Overlay deslizante */}
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
            <SuperAdminSidebar
              isOpen={sidebarOpen}
              onNavigate={() => setSidebarOpen(false)}
            />
          </View>
        </>
      )}
    </View>
  );
}
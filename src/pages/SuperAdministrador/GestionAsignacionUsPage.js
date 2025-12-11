import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { departamentoService } from '../../api/services/departamentoService';
import { usuarioService } from '../../api/services/usuarioService';
import SuperAdminSidebar from '../../components/Sidebar/sidebarSuperAdmin';

export default function GestionAsignacionUsPage() {
  const router = useRouter();
  
  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [departamentos, setDepartamentos] = useState([]);
  
  // Departamento seleccionado
  const [selectedDepartamento, setSelectedDepartamento] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  
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
  

  useEffect(() => {
    cargarDepartamentos();
  }, []);

  useEffect(() => {
    if (selectedDepartamento) {
      cargarUsuariosDepartamento(selectedDepartamento);
    } else {
      setUsuarios([]);
      setSelectedUsuarios([]);
      setNuevoDepartamento(null);
      
    }
  }, [selectedDepartamento]);

  useEffect(() => {
  console.log('🔵 Estado actualizado:');
  console.log('  - selectedDepartamento:', selectedDepartamento);
  console.log('  - nuevoDepartamento:', nuevoDepartamento);
  console.log('  - selectedUsuarios:', selectedUsuarios.length);
  console.log('  - mostrarCambioDept:', mostrarCambioDept);
  console.log('  - departamentoDestino:', departamentoDestino ? 'encontrado' : 'NO encontrado');
}, [selectedDepartamento, nuevoDepartamento, selectedUsuarios, mostrarCambioDept]);


useEffect(() => {
  // Cuando se cierra el modo asignación y hay un departamento seleccionado
  if (!mostrarAsignacionSinDept && selectedDepartamento && !mostrarCambioDept) {
    console.log('🔄 Modo asignación cerrado, recargando usuarios del departamento...');
    cargarUsuariosDepartamento(selectedDepartamento);
  }
}, [mostrarAsignacionSinDept]);

  const cargarUsuariosSinDepartamento = async () => {
    try {
      setLoadingSinDept(true);
      const response = await usuarioService.listarCompleto({ 
        estado: 'activo'
      });
      // Filtrar solo usuarios sin departamento
      const sinDept = (response?.usuarios || []).filter(u => !u.departamento);
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
      setUsuarios(response?.usuarios || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios del departamento');
    } finally {
      setLoadingUsuarios(false);
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
    console.log('🔵 handleMoverUsuarios - INICIADO');
    console.log('🔵 mostrarAsignacionSinDept:', mostrarAsignacionSinDept);
    console.log('🔵 selectedUsuarios:', selectedUsuarios);
    console.log('🔵 nuevoDepartamento:', nuevoDepartamento);
    console.log('🔵 selectedDepartamento:', selectedDepartamento);

    // Si es asignación de usuarios sin departamento
    if (mostrarAsignacionSinDept) {
      console.log('🟢 Modo: Asignación de usuarios sin departamento');

      if (selectedUsuarios.length === 0) {
        window.alert('⚠️ Debes seleccionar al menos un usuario');
        return;
      }

      if (!selectedDepartamento) {
        window.alert('⚠️ Debes seleccionar un departamento destino');
        return;
      }

      const confirmar = window.confirm(
        `¿Asignar ${selectedUsuarios.length} usuario(s) a ${departamentoActual?.nombre}?`
      );

      if (!confirmar) {
        console.log('❌ Usuario canceló la asignación');
        return;
      }

      try {
        setLoading(true);
        console.log('📤 Asignando usuarios sin departamento...');
        
        const promesas = selectedUsuarios.map(idUsuario => {
          console.log(`📤 Asignando usuario ${idUsuario} a departamento ${selectedDepartamento}`);
          return usuarioService.cambiarDepartamento(idUsuario, {
            id_departamento: selectedDepartamento,
          });
        });

        const resultados = await Promise.all(promesas);
        console.log('✅ Resultados de asignación:', resultados);

        // 🔥 Cerrar modo asignación (el useEffect se encargará de recargar)
        setMostrarAsignacionSinDept(false);
        setSelectedUsuarios([]);

        // Mostrar mensaje de éxito
        window.alert(`✅ ${resultados.length} usuario(s) asignado(s) correctamente a ${departamentoActual?.nombre}`);
        
      } catch (error) {
        console.error('❌ Error asignando usuarios:', error);
        console.error('❌ Detalles:', error.response || error.message);
        window.alert('❌ Error: ' + (error.message || 'No se pudieron asignar los usuarios'));
      } finally {
        setLoading(false);
      }
      return;
    }

    // Si es cambio de departamento (el código que ya funciona)
    console.log('🟡 Modo: Cambio de departamento');

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

    console.log('🔵 nuevoDeptoNum:', nuevoDeptoNum, 'tipo:', typeof nuevoDeptoNum);
    console.log('🔵 selectedDeptoNum:', selectedDeptoNum, 'tipo:', typeof selectedDeptoNum);

    if (nuevoDeptoNum === selectedDeptoNum) {
      window.alert('⚠️ El departamento destino debe ser diferente al actual');
      return;
    }

    const nombreDepartamentoDestino = getDepartamentoNombre(nuevoDeptoNum);
    
    console.log('🔵 nombreDepartamentoDestino:', nombreDepartamentoDestino);

    if (!nombreDepartamentoDestino) {
      window.alert('❌ No se encontró el departamento destino');
      return;
    }

    const confirmar = window.confirm(`¿Mover ${selectedUsuarios.length} usuario(s) a ${nombreDepartamentoDestino}?`);

    if (!confirmar) {
      console.log('❌ Usuario canceló la operación');
      return;
    }

    try {
      setLoading(true);
      console.log('📤 Moviendo usuarios entre departamentos...');
      
      const promesas = selectedUsuarios.map(idUsuario => {
        console.log(`📤 Moviendo usuario ${idUsuario} a departamento ${nuevoDeptoNum}`);
        return usuarioService.cambiarDepartamento(idUsuario, {
          id_departamento: nuevoDeptoNum,
        });
      });

      const resultados = await Promise.all(promesas);
      console.log('✅ Resultados:', resultados);

      window.alert(`✅ ${selectedUsuarios.length} usuario(s) movido(s) correctamente a ${nombreDepartamentoDestino}`);
      
      await cargarUsuariosDepartamento(selectedDepartamento);
      setSelectedUsuarios([]);
      setNuevoDepartamento(null);
      
    } catch (error) {
      console.error('❌ Error moviendo usuarios:', error);
      console.error('❌ Detalles del error:', error.response || error.message);
      window.alert('❌ Error: ' + (error.message || 'No se pudieron mover los usuarios'));
    } finally {
      setLoading(false);
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

  return (
    <View style={styles.wrapper}>
      
      {/* Sidebar */}
      <SuperAdminSidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

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
      <View style={[
        styles.mainContent, 
        sidebarOpen && styles.mainContentWithSidebar
      ]}>
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
                    <TouchableOpacity
                      key={dept.id_departamento}
                      style={styles.deptCard}
                      onPress={() => setSelectedDepartamento(dept.id_departamento)}
                    >
                      <View style={styles.deptCardHeader}>
                        <View style={styles.deptIconContainer}>
                          <Ionicons name="business" size={24} color="#3b82f6" />
                        </View>
                        <Text style={styles.deptCardCode}>{dept.codigo}</Text>
                      </View>
                      
                      <Text style={styles.deptCardName}>{dept.nombre}</Text>
                      
                      {dept.facultad && (
                        <View style={styles.deptFacultadBadge}>
                          <Ionicons name="school" size={12} color="#8b5cf6" />
                          <Text style={styles.deptFacultadText}>{dept.facultad}</Text>
                        </View>
                      )}
                      
                      <View style={styles.deptCardFooter}>
                        <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
                      </View>
                    </TouchableOpacity>
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
                    <View style={styles.infoCard}>
                      <Ionicons name="information-circle" size={20} color="#10b981" />
                      <Text style={styles.infoCardText}>
                        Selecciona usuarios sin departamento para asignarlos a {departamentoActual?.nombre}
                      </Text>
                    </View>

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
                            <TouchableOpacity
                              key={usuario.id_usuario}
                              style={[
                                styles.usuarioCard,
                                selectedUsuarios.includes(usuario.id_usuario) && styles.usuarioCardSelectedGreen
                              ]}
                              onPress={() => toggleUsuario(usuario.id_usuario)}
                            >
                              <Ionicons 
                                name={selectedUsuarios.includes(usuario.id_usuario) ? "checkbox" : "square-outline"} 
                                size={24} 
                                color={selectedUsuarios.includes(usuario.id_usuario) ? "#10b981" : "#94a3b8"}
                              />
                              
                              <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                  {usuario.persona?.nombre?.charAt(0)}{usuario.persona?.apellido?.charAt(0)}
                                </Text>
                              </View>
                              
                              <View style={styles.usuarioInfo}>
                                <Text style={styles.usuarioNombre}>
                                  {usuario.persona?.nombre} {usuario.persona?.apellido}
                                </Text>
                                <View style={styles.usuarioMeta}>
                                  <View style={styles.metaItem}>
                                    <Ionicons name="at" size={12} color="#64748b" />
                                    <Text style={styles.metaText}>{usuario.username}</Text>
                                  </View>
                                  <Text style={styles.metaDot}>•</Text>
                                  <View style={styles.metaItem}>
                                    <Ionicons name="mail" size={12} color="#64748b" />
                                    <Text style={styles.metaText}>{usuario.email}</Text>
                                  </View>
                                </View>
                                {usuario.persona?.cargo && (
                                  <Text style={styles.usuarioCargo}>{usuario.persona.cargo}</Text>
                                )}
                              </View>
                              
                              <View style={styles.noDeptBadge}>
                                <Text style={styles.noDeptBadgeText}>Sin Depto</Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>

                        {selectedUsuarios.length > 0 && (
                          <View style={styles.resumenCard}>
                            <View style={styles.resumenHeader}>
                              <Ionicons name="information-circle" size={24} color="#10b981" />
                              <Text style={styles.resumenTitle}>Resumen de Asignación</Text>
                            </View>
                            
                            <View style={styles.resumenContent}>
                              <View style={styles.resumenRow}>
                                <Text style={styles.resumenLabel}>Usuarios seleccionados:</Text>
                                <Text style={styles.resumenValue}>{selectedUsuarios.length}</Text>
                              </View>
                              
                              <View style={styles.resumenDivider} />
                              
                              <View style={styles.resumenRow}>
                                <View style={styles.resumenDept}>
                                  <Ionicons name="business" size={16} color="#10b981" />
                                  <View>
                                    <Text style={styles.resumenDeptLabel}>Asignar a</Text>
                                    <Text style={styles.resumenDeptValue}>{departamentoActual?.nombre}</Text>
                                    <Text style={styles.resumenDeptCode}>{departamentoActual?.codigo}</Text>
                                  </View>
                                </View>
                              </View>
                            </View>

                            <TouchableOpacity
                              style={[
                                styles.confirmarButton,
                                { backgroundColor: '#10b981' },
                                loading && { opacity: 0.5 }
                              ]}
                              onPress={() => {
                                console.log('🟢 BOTÓN CONFIRMAR ASIGNACIÓN PRESIONADO');
                                handleMoverUsuarios();
                              }}
                              disabled={loading}
                              activeOpacity={0.7}
                            >
                              {loading ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                              ) : (
                                <>
                                  <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                                  <Text style={styles.confirmarButtonText}>
                                    Confirmar y Asignar {selectedUsuarios.length} Usuario(s)
                                  </Text>
                                </>
                              )}
                            </TouchableOpacity>
                          </View>
                        )}






                      </>
                    )}
                  </>
                ) : (
                  /* Mostrar usuarios del departamento actual (siempre visibles) */
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

                    {/* Mostrar "Seleccionar todos" solo si está en modo cambio */}
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
                        {usuariosFiltrados.map((usuario) => (


                    <TouchableOpacity
                      key={usuario.id_usuario}
                      style={[
                        styles.usuarioCard,
                        selectedUsuarios.includes(usuario.id_usuario) && styles.usuarioCardSelected
                      ]}
                      onPress={() => {
                        if (mostrarCambioDept) {
                          // Si está en modo cambio, seleccionar para mover
                          toggleUsuario(usuario.id_usuario);
                        } else {
                          // Si no está en modo cambio, abrir detalle
                          console.log('👤 Abriendo detalle de usuario:', usuario.id_usuario);
                          setUsuarioSeleccionado(usuario);
                          setMostrarDetalleUsuario(true);
                        }
                      }}
                    >
                      {/* Mostrar checkbox solo si está en modo cambio */}
                      {mostrarCambioDept && (
                        <Ionicons 
                          name={selectedUsuarios.includes(usuario.id_usuario) ? "checkbox" : "square-outline"} 
                          size={24} 
                          color={selectedUsuarios.includes(usuario.id_usuario) ? "#3b82f6" : "#94a3b8"}
                        />
                      )}
                      
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {usuario.persona?.nombre?.charAt(0)}{usuario.persona?.apellido?.charAt(0)}
                        </Text>
                      </View>
                      
                      <View style={styles.usuarioInfo}>
                        <Text style={styles.usuarioNombre}>
                          {usuario.persona?.nombre} {usuario.persona?.apellido}
                        </Text>
                        <View style={styles.usuarioMeta}>
                          <View style={styles.metaItem}>
                            <Ionicons name="at" size={12} color="#64748b" />
                            <Text style={styles.metaText}>{usuario.username}</Text>
                          </View>
                          <Text style={styles.metaDot}>•</Text>
                          <View style={styles.metaItem}>
                            <Ionicons name="mail" size={12} color="#64748b" />
                            <Text style={styles.metaText}>{usuario.email}</Text>
                          </View>
                        </View>
                        {usuario.persona?.cargo && (
                          <Text style={styles.usuarioCargo}>{usuario.persona.cargo}</Text>
                        )}
                      </View>
                      
                      {!mostrarCambioDept && (
                        <Ionicons 
                          name="chevron-forward" 
                          size={20} 
                          color="#cbd5e1" 
                        />
                      )}
                    </TouchableOpacity>


                        ))}
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
                        <TouchableOpacity
                          key={dept.id_departamento}
                          style={[
                            styles.deptCard,
                            nuevoDepartamento === dept.id_departamento && styles.deptCardSelected
                          ]}
                          onPress={() => {
                            console.log('🔵 Departamento destino seleccionado:', dept.id_departamento, 'tipo:', typeof dept.id_departamento);
                            setNuevoDepartamento(dept.id_departamento);
                          }}
                        >
                          <View style={styles.deptCardHeader}>
                            <Ionicons 
                              name={nuevoDepartamento === dept.id_departamento ? "radio-button-on" : "radio-button-off"} 
                              size={24} 
                              color={nuevoDepartamento === dept.id_departamento ? "#3b82f6" : "#94a3b8"}
                            />
                            <Text style={styles.deptCardCode}>{dept.codigo}</Text>
                          </View>
                          
                          <Text style={styles.deptCardName}>{dept.nombre}</Text>
                          
                          {dept.facultad && (
                            <View style={styles.deptFacultadBadge}>
                              <Ionicons name="school" size={12} color="#8b5cf6" />
                              <Text style={styles.deptFacultadText}>{dept.facultad}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              )}

              {/* PASO 4: Motivo del Cambio */}
            


              {/* Resumen del Cambio */}
              {nuevoDepartamento && departamentoActual && departamentoDestino && selectedUsuarios.length > 0 && (
                <View style={styles.resumenCard}>
                  <View style={styles.resumenHeader}>
                    <Ionicons name="information-circle" size={24} color="#3b82f6" />
                    <Text style={styles.resumenTitle}>Resumen del Cambio</Text>
                  </View>
                  
                  <View style={styles.resumenContent}>
                    <View style={styles.resumenRow}>
                      <Text style={styles.resumenLabel}>Usuarios seleccionados:</Text>
                      <Text style={styles.resumenValue}>{selectedUsuarios.length}</Text>
                    </View>
                    
                    <View style={styles.resumenDivider} />
                    
                    <View style={styles.resumenRow}>
                      <View style={styles.resumenDept}>
                        <Ionicons name="business" size={16} color="#64748b" />
                        <View>
                          <Text style={styles.resumenDeptLabel}>Desde</Text>
                          <Text style={styles.resumenDeptValue}>{departamentoActual.nombre}</Text>
                          <Text style={styles.resumenDeptCode}>{departamentoActual.codigo}</Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.resumenArrow}>
                      <Ionicons name="arrow-down" size={24} color="#3b82f6" />
                    </View>
                    
                    <View style={styles.resumenRow}>
                      <View style={styles.resumenDept}>
                        <Ionicons name="business" size={16} color="#3b82f6" />
                        <View>
                          <Text style={styles.resumenDeptLabel}>Hacia</Text>
                          <Text style={styles.resumenDeptValue}>{departamentoDestino.nombre}</Text>
                          <Text style={styles.resumenDeptCode}>{departamentoDestino.codigo}</Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.resumenDivider} />
                    

                  </View>


                </View>
              )}
            </>
          )}

        </ScrollView>



{/* Modal de Detalle de Usuario */}
{mostrarDetalleUsuario && usuarioSeleccionado && (
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <ScrollView style={styles.modalScroll}>
        
        {/* Header del Modal */}
        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderLeft}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>
                {usuarioSeleccionado.persona?.nombre?.charAt(0)}
                {usuarioSeleccionado.persona?.apellido?.charAt(0)}
              </Text>
            </View>
            <View>
              <Text style={styles.modalTitle}>
                {usuarioSeleccionado.persona?.nombre} {usuarioSeleccionado.persona?.apellido}
              </Text>
              <Text style={styles.modalSubtitle}>
                @{usuarioSeleccionado.username}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setMostrarDetalleUsuario(false);
              setUsuarioSeleccionado(null);
            }}
          >
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Información Personal */}
        <View style={styles.modalSection}>
          <View style={styles.modalSectionHeader}>
            <Ionicons name="person" size={20} color="#3b82f6" />
            <Text style={styles.modalSectionTitle}>Información Personal</Text>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Cédula</Text>
              <Text style={styles.infoValue}>
                {usuarioSeleccionado.persona?.cedula || 'N/A'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{usuarioSeleccionado.email}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>
                {usuarioSeleccionado.persona?.telefono || 'N/A'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Cargo</Text>
              <Text style={styles.infoValue}>
                {usuarioSeleccionado.persona?.cargo || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Información de Usuario */}
        <View style={styles.modalSection}>
          <View style={styles.modalSectionHeader}>
            <Ionicons name="briefcase" size={20} color="#8b5cf6" />
            <Text style={styles.modalSectionTitle}>Información de Usuario</Text>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Departamento</Text>
              <Text style={styles.infoValue}>
                {usuarioSeleccionado.departamento?.nombre || 'Sin departamento'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Estado</Text>
              <View style={[
                styles.estadoBadge,
                usuarioSeleccionado.estado === 'activo' && styles.estadoActivo,
                usuarioSeleccionado.estado === 'inactivo' && styles.estadoInactivo
              ]}>
                <Text style={styles.estadoBadgeText}>
                  {usuarioSeleccionado.estado?.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Roles</Text>
              <View style={styles.rolesContainer}>
                {usuarioSeleccionado.roles && usuarioSeleccionado.roles.length > 0 ? (
                  usuarioSeleccionado.roles.map((rol, index) => (
                    <View key={index} style={styles.rolBadge}>
                      <Ionicons name="shield-checkmark" size={12} color="#10b981" />
                      <Text style={styles.rolBadgeText}>{rol.nombre}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.infoValue}>Sin roles asignados</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Permisos */}
        <View style={styles.modalSection}>
          <View style={styles.modalSectionHeader}>
            <Ionicons name="lock-closed" size={20} color="#ef4444" />
            <Text style={styles.modalSectionTitle}>Permisos del Usuario</Text>
          </View>
          
          <View style={styles.permisosGrid}>
            {/* Permiso: Ver Contenido */}
            <View style={styles.permisoItem}>
              <View style={styles.permisoHeader}>
                <Ionicons name="eye" size={18} color="#3b82f6" />
                <Text style={styles.permisoLabel}>Ver Contenido</Text>
              </View>
              <View style={[styles.permisoToggle, styles.permisoTrue]}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.permisoValueTrue}>TRUE</Text>
              </View>
            </View>

            {/* Permiso: Crear Contenido */}
            <View style={styles.permisoItem}>
              <View style={styles.permisoHeader}>
                <Ionicons name="add-circle" size={18} color="#10b981" />
                <Text style={styles.permisoLabel}>Crear Contenido</Text>
              </View>
              <View style={[styles.permisoToggle, styles.permisoFalse]}>
                <Ionicons name="close-circle" size={16} color="#ef4444" />
                <Text style={styles.permisoValueFalse}>FALSE</Text>
              </View>
            </View>

            {/* Permiso: Editar Contenido */}
            <View style={styles.permisoItem}>
              <View style={styles.permisoHeader}>
                <Ionicons name="create" size={18} color="#f59e0b" />
                <Text style={styles.permisoLabel}>Editar Contenido</Text>
              </View>
              <View style={[styles.permisoToggle, styles.permisoTrue]}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.permisoValueTrue}>TRUE</Text>
              </View>
            </View>

            {/* Permiso: Eliminar Contenido */}
            <View style={styles.permisoItem}>
              <View style={styles.permisoHeader}>
                <Ionicons name="trash" size={18} color="#ef4444" />
                <Text style={styles.permisoLabel}>Eliminar Contenido</Text>
              </View>
              <View style={[styles.permisoToggle, styles.permisoFalse]}>
                <Ionicons name="close-circle" size={16} color="#ef4444" />
                <Text style={styles.permisoValueFalse}>FALSE</Text>
              </View>
            </View>

            {/* Permiso: Publicar Contenido */}
            <View style={styles.permisoItem}>
              <View style={styles.permisoHeader}>
                <Ionicons name="paper-plane" size={18} color="#8b5cf6" />
                <Text style={styles.permisoLabel}>Publicar Contenido</Text>
              </View>
              <View style={[styles.permisoToggle, styles.permisoTrue]}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.permisoValueTrue}>TRUE</Text>
              </View>
            </View>

            {/* Permiso: Ver Métricas */}
            <View style={styles.permisoItem}>
              <View style={styles.permisoHeader}>
                <Ionicons name="stats-chart" size={18} color="#06b6d4" />
                <Text style={styles.permisoLabel}>Ver Métricas</Text>
              </View>
              <View style={[styles.permisoToggle, styles.permisoFalse]}>
                <Ionicons name="close-circle" size={16} color="#ef4444" />
                <Text style={styles.permisoValueFalse}>FALSE</Text>
              </View>
            </View>

            {/* Permiso: Exportar Datos */}
            <View style={styles.permisoItem}>
              <View style={styles.permisoHeader}>
                <Ionicons name="download" size={18} color="#14b8a6" />
                <Text style={styles.permisoLabel}>Exportar Datos</Text>
              </View>
              <View style={[styles.permisoToggle, styles.permisoTrue]}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.permisoValueTrue}>TRUE</Text>
              </View>
            </View>

            {/* Permiso: Configurar Agente */}
            <View style={styles.permisoItem}>
              <View style={styles.permisoHeader}>
                <Ionicons name="settings" size={18} color="#6366f1" />
                <Text style={styles.permisoLabel}>Configurar Agente</Text>
              </View>
              <View style={[styles.permisoToggle, styles.permisoFalse]}>
                <Ionicons name="close-circle" size={16} color="#ef4444" />
                <Text style={styles.permisoValueFalse}>FALSE</Text>
              </View>
            </View>

            {/* Permiso: Gestionar Permisos */}
            <View style={styles.permisoItem}>
              <View style={styles.permisoHeader}>
                <Ionicons name="key" size={18} color="#dc2626" />
                <Text style={styles.permisoLabel}>Gestionar Permisos</Text>
              </View>
              <View style={[styles.permisoToggle, styles.permisoFalse]}>
                <Ionicons name="close-circle" size={16} color="#ef4444" />
                <Text style={styles.permisoValueFalse}>FALSE</Text>
              </View>
            </View>

            {/* Permiso: Gestionar Categorías */}
            <View style={styles.permisoItem}>
              <View style={styles.permisoHeader}>
                <Ionicons name="list" size={18} color="#f59e0b" />
                <Text style={styles.permisoLabel}>Gestionar Categorías</Text>
              </View>
              <View style={[styles.permisoToggle, styles.permisoTrue]}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.permisoValueTrue}>TRUE</Text>
              </View>
            </View>

            {/* Permiso: Gestionar Widgets */}
            <View style={styles.permisoItem}>
              <View style={styles.permisoHeader}>
                <Ionicons name="grid" size={18} color="#8b5cf6" />
                <Text style={styles.permisoLabel}>Gestionar Widgets</Text>
              </View>
              <View style={[styles.permisoToggle, styles.permisoFalse]}>
                <Ionicons name="close-circle" size={16} color="#ef4444" />
                <Text style={styles.permisoValueFalse}>FALSE</Text>
              </View>
            </View>
          </View>

          {/* Notas */}
          <View style={styles.notasContainer}>
            <View style={styles.notasHeader}>
              <Ionicons name="document-text" size={18} color="#64748b" />
              <Text style={styles.notasLabel}>Notas sobre permisos</Text>
            </View>
            <View style={styles.notasBox}>
              <Text style={styles.notasText}>
                Este usuario tiene permisos básicos de visualización y edición.
                No puede eliminar contenido ni gestionar configuraciones avanzadas.
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  </View>
)}




      </View>




    </View>
  );
}

const styles = {
  wrapper: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  toggleButton: {
    position: 'absolute',
    top: 16,
    zIndex: 1001,
    backgroundColor: '#1e1b4b',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  mainContent: {
    flex: 1,
    marginLeft: 0
  },
  mainContentWithSidebar: {
    marginLeft: 280
  },
  container: {
    flex: 1,
    padding: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  iconContainer: {
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b'
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  resetButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600'
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500'
  },
  breadcrumbTextActive: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600'
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20
  },
  stepBadge: {
    backgroundColor: '#3b82f6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b'
  },
  sectionTitleContainer: {
    flex: 1
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b'
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748b'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center'
  },
  departamentosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16
  },
  deptCard: {
    width: '31%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    minHeight: 160
  },
  deptCardSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6'
  },deptCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  deptIconContainer: {
    backgroundColor: '#dbeafe',
    padding: 10,
    borderRadius: 10
  },
  deptCardCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  deptCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8
  },
  deptFacultadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8
  },
  deptFacultadText: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '500'
  },
  deptCardFooter: {
    marginTop: 12,
    alignItems: 'flex-end'
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6'
  },
  usuariosList: {
    gap: 12
  },
  usuarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0'
  },
  usuarioCardSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff'
  },
  usuarioInfo: {
    flex: 1,
    gap: 4
  },
  usuarioNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b'
  },
  usuarioMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap'
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    fontSize: 12,
    color: '#64748b'
  },
  metaDot: {
    fontSize: 12,
    color: '#94a3b8'
  },
  usuarioCargo: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '500',
    marginTop: 2
  },
  textArea: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 100,
    textAlignVertical: 'top'
  },
  charCount: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 8
  },
  resumenCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#bfdbfe',
    marginBottom: 20
  },
  resumenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20
  },
  resumenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e40af'
  },
  resumenContent: {
    gap: 16,
    marginBottom: 20
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  resumenLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600'
  },
  resumenValue: {
    fontSize: 18,
    color: '#1e293b',
    fontWeight: '700'
  },
  resumenDivider: {
    height: 1,
    backgroundColor: '#bfdbfe'
  },
  resumenDept: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1
  },
  resumenDeptLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4
  },
  resumenDeptValue: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '700',
    marginBottom: 2
  },
  resumenDeptCode: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600'
  },
  resumenArrow: {
    alignItems: 'center',
    paddingVertical: 8
  },
  resumenMotivoContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe'
  },
  resumenMotivoLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  resumenMotivoText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20
  },
  confirmarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    gap: 8
  },
  confirmarButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  },
  actionButtonsContainer: {
  flexDirection: 'row',
  gap: 12,
  marginBottom: 20
},
actionToggleButton: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#ffffff',
  paddingVertical: 14,
  paddingHorizontal: 16,
  borderRadius: 12,
  gap: 8,
  borderWidth: 2,
  borderColor: '#e2e8f0'
},
actionToggleButtonActive: {
  backgroundColor: '#3b82f6',
  borderColor: '#3b82f6'
},
actionToggleText: {
  fontSize: 13,
  fontWeight: '600',
  color: '#3b82f6'
},
actionToggleTextActive: {
  color: '#ffffff'
},
infoCard: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  backgroundColor: '#ecfdf5',
  padding: 16,
  borderRadius: 12,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: '#86efac'
},
infoCardText: {
  flex: 1,
  fontSize: 13,
  color: '#047857',
  lineHeight: 18
},
usuarioCardSelectedGreen: {
  backgroundColor: '#d1fae5',
  borderColor: '#10b981'
},
noDeptBadge: {
  backgroundColor: '#fef3c7',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#fcd34d'
},
noDeptBadgeText: {
  fontSize: 11,
  fontWeight: '600',
  color: '#d97706',
  textTransform: 'uppercase'
},


  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 900,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  },
  modalScroll: {
    padding: 24
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0'
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarLargeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff'
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b'
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  modalSection: {
    marginBottom: 24
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b'
  },
  infoGrid: {
    gap: 16
  },
  infoItem: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 6
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b'
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  estadoActivo: {
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#86efac'
  },
  estadoInactivo: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  estadoBadgeText: {
    fontSize: 12,
    fontWeight: '700'
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4
  },
  rolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86efac'
  },
  rolBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857'
  },
  permisosGrid: {
    gap: 12
  },
  permisoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  permisoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  permisoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b'
  },
  permisoToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2
  },
  permisoTrue: {
    backgroundColor: '#d1fae5',
    borderColor: '#86efac'
  },
  permisoFalse: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca'
  },
  permisoValueTrue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857'
  },
  permisoValueFalse: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626'
  },
  notasContainer: {
    marginTop: 20,
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fef3c7'
  },
  notasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  notasLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e'
  },
  notasBox: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8
  },
  notasText: {
    fontSize: 13,
    color: '#78716c',
    lineHeight: 20
  }


};
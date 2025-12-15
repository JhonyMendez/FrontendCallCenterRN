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
import {
  DepartamentoCard,
  InfoCard,
  ResumenCard,
  UsuarioCard,
  UsuarioDetalleModal
} from '../../components/SuperAdministrador/GestionAsignacionUsCard';
import { styles } from '../../styles/GestionAsignacionUsStyles';
 


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
    // Si es asignación de usuarios sin departamento
    if (mostrarAsignacionSinDept) {
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

      if (!confirmar) return;

      try {
        setLoading(true);
        
        const promesas = selectedUsuarios.map(idUsuario => 
          usuarioService.cambiarDepartamento(idUsuario, {
            id_departamento: selectedDepartamento,
          })
        );

        const resultados = await Promise.all(promesas);

        setMostrarAsignacionSinDept(false);
        setSelectedUsuarios([]);

        window.alert(`✅ ${resultados.length} usuario(s) asignado(s) correctamente a ${departamentoActual?.nombre}`);
        
      } catch (error) {
        console.error('❌ Error asignando usuarios:', error);
        window.alert('❌ Error: ' + (error.message || 'No se pudieron asignar los usuarios'));
      } finally {
        setLoading(false);
      }
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
                        {usuariosFiltrados.map((usuario) => (
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
                            showChevron={!mostrarCambioDept}
                          />
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
        />
      )}
    </View>
  );
}
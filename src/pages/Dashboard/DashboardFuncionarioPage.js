// ==================================================================================
// DashboardPageFuncionario.js
// Dashboard para Funcionario - Compatible con Web y Mobile
// ==================================================================================

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { apiClient } from '../../api/client';
import { agenteService } from '../../api/services/agenteService';
import authService from '../../api/services/authService';
import { departamentoService } from '../../api/services/departamentoService';
import { usuarioService } from '../../api/services/usuarioService';
import {
  HeaderCard,
  SectionHeader,
  StatCard
} from '../../components/Dashboard/DashboardSuperAdminCard';
import FuncionarioSidebar from '../../components/Sidebar/sidebarFuncionario';
import { dashboardStyles } from '../../styles/dashboardSuperAdminStyles';

const isWeb = Platform.OS === 'web';

// 🔐 ============ UTILIDADES DE SEGURIDAD ============
const SecurityUtils = {
    createRateLimiter(maxAttempts, windowMs) {
        const attempts = {};
        return {
            isAllowed(key) {
                const now = Date.now();
                if (!attempts[key]) {
                    attempts[key] = [];
                }
                attempts[key] = attempts[key].filter(time => now - time < windowMs);
                if (attempts[key].length >= maxAttempts) {
                    this.logSecurityEvent('RATE_LIMIT_EXCEEDED', { key, attempts: attempts[key].length });
                    return false;
                }
                attempts[key].push(now);
                return true;
            }
        };
    },

    validateId(id) {
        const numId = parseInt(id, 10);
        return !isNaN(numId) && numId > 0;
    },

    validateUserObject(user) {
        if (!user || typeof user !== 'object') return false;
        if (!user.id_usuario || !this.validateId(user.id_usuario)) return false;
        if (!user.username || typeof user.username !== 'string') return false;
        return true;
    },

    detectXssAttempt(text) {
        if (!text) return false;
        const xssPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /on\w+\s*=/gi,
            /<iframe/gi,
            /javascript:/gi,
            /eval\(/gi,
            /onerror\s*=/gi,
            /onload\s*=/gi,
        ];
        return xssPatterns.some(pattern => pattern.test(text));
    },

    logSecurityEvent(eventType, details) {
        const timestamp = new Date().toISOString();
        console.warn('🔒 SECURITY EVENT:', {
            timestamp,
            eventType,
            details,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
        });
    }
};

export default function DashboardPageFuncionario() {
  const router = useRouter();

  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  // 🔐 Rate limiters
  const rateLimiter = useRef(SecurityUtils.createRateLimiter(5, 60000)).current;
  const carouselRef = useRef(null);
  const scrollPosition = useRef(new Animated.Value(0)).current;
  const currentScroll = useRef(0);
  const [usuario, setUsuario] = useState({
    nombre_completo: '',
    username: '',
    role: '',
    id_usuario: null
  });

  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalAgentes: 0,
    totalDepartamentos: 0,
    conversacionesHoy: 0,
    interaccionesHoy: 0,
    ticketsAbiertos: 0,
    satisfaccion: 0
  });

  useEffect(() => {
    cargarDatos();
    
    // Iniciar animación del carrusel
    const carouselInterval = setInterval(() => {
      if (carouselRef.current) {
        currentScroll.current += 172; // 160 (ancho) + 12 (gap)
        if (currentScroll.current > 172 * 8) { // Si pasamos el último item
          currentScroll.current = 0;
        }
        carouselRef.current.scrollTo({ x: currentScroll.current, animated: true });
      }
    }, 3000); // Cambiar cada 3 segundos

    return () => clearInterval(carouselInterval);
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      console.log('🔄 [Dashboard Funcionario] Iniciando carga de datos...');

      // 🔐 Rate limiting
      if (!rateLimiter.isAllowed('cargarDatos')) {
        SecurityUtils.logSecurityEvent('RATE_LIMIT_LOAD_DASHBOARD_FUNCIONARIO', {
          razon: 'demasiadas_solicitudes'
        });
        console.log('⚠️ Rate limit excedido en cargarDatos');
        setLoading(false);
        return;
      }

      // ⭐ ESTRATEGIA 1: Primero intentar desde localStorage (MÁS RÁPIDO)
      console.log('🔄 [Dashboard Funcionario] Intentando cargar desde localStorage...');
      let usuarioConfigLoaded = false;

      try {
        const posiblesClaves = ['@datos_sesion', 'datos_sesion', '@user_session'];

        for (const clave of posiblesClaves) {
          const data = localStorage.getItem(clave);

          if (data) {
            const parsed = JSON.parse(data);
            console.log(`📦 [Dashboard Funcionario] Datos en ${clave}:`, parsed);

            if (parsed.usuario) {
              // 🔐 Validar estructura del usuario
              if (!SecurityUtils.validateUserObject(parsed.usuario)) {
                SecurityUtils.logSecurityEvent('INVALID_USER_STRUCTURE_FUNCIONARIO', {
                  source: 'localStorage',
                  razon: 'estructura_invalida'
                });
                continue;
              }

              // 🔐 Detectar XSS en campos críticos
              if (SecurityUtils.detectXssAttempt(parsed.usuario.username) ||
                  SecurityUtils.detectXssAttempt(parsed.usuario.email)) {
                SecurityUtils.logSecurityEvent('XSS_ATTEMPT_DASHBOARD_FUNCIONARIO', {
                  username: parsed.usuario.username
                });
                continue;
              }

              const usuarioConfig = {
                id_usuario: parsed.usuario.id_usuario,
                nombre_completo: parsed.usuario.nombre_completo ||
                  parsed.usuario.nombreCompleto ||
                  `${parsed.usuario.nombre || ''} ${parsed.usuario.apellido || ''}`.trim() ||
                  parsed.usuario.fullName ||
                  parsed.usuario.full_name ||
                  `${parsed.usuario.primer_nombre || ''} ${parsed.usuario.primer_apellido || ''}`.trim() ||
                  parsed.usuario.username ||
                  'Funcionario',
                username: parsed.usuario.username ||
                  parsed.usuario.userName ||
                  parsed.usuario.user_name ||
                  parsed.usuario.email?.split('@')[0] ||
                  'funcionario',
                role: parsed.rolPrincipal?.nombre_rol ||
                  parsed.rolPrincipal?.nombreRol ||
                  parsed.usuario.role ||
                  'Funcionario'
              };
              console.log('✅ [Dashboard Funcionario] Usuario configurado desde localStorage:', usuarioConfig);
              setUsuario(usuarioConfig);
              usuarioConfigLoaded = true;
              break;
            }
          }
        }
      } catch (localStorageError) {
        SecurityUtils.logSecurityEvent('ERROR_PARSING_LOCALSTORAGE_FUNCIONARIO', {
          error: localStorageError.message
        });
        console.warn('⚠️ [Dashboard Funcionario] Error leyendo localStorage:', localStorageError);
      }

      // ⭐ ESTRATEGIA 2: Si no se encontró en localStorage, intentar desde authService
      if (!usuarioConfigLoaded) {
        console.log('🔄 [Dashboard Funcionario] Intentando cargar desde authService...');
        const datosSesion = await authService.obtenerDatosSesion();
        console.log('📦 [Dashboard Funcionario] Datos de sesión:', datosSesion);

        if (datosSesion && datosSesion.usuario) {
          // 🔐 Validar estructura del usuario
          if (SecurityUtils.validateUserObject(datosSesion.usuario)) {
            const usuarioConfig = {
              id_usuario: datosSesion.usuario.id_usuario,
              nombre_completo: datosSesion.usuario.nombre_completo || 'Funcionario',
              username: datosSesion.usuario.username || 'funcionario',
              role: datosSesion.rolPrincipal?.nombre_rol || 'Funcionario'
            };
            console.log('✅ [Dashboard Funcionario] Usuario configurado desde authService:', usuarioConfig);
            setUsuario(usuarioConfig);
            usuarioConfigLoaded = true;
          } else {
            SecurityUtils.logSecurityEvent('INVALID_USER_FROM_AUTHSERVICE_FUNCIONARIO', {});
          }
        }
      }

      if (!usuarioConfigLoaded) {
        console.warn('⚠️ [Dashboard Funcionario] No se pudo obtener información del usuario');
        SecurityUtils.logSecurityEvent('USER_CONFIG_FAILED_FUNCIONARIO', {
          razon: 'no_user_data_available'
        });
      }

      // Cargar estadísticas en paralelo desde el backend
      console.log('📊 [Dashboard Funcionario] Iniciando carga de estadísticas...');

      console.log('📤 [Dashboard Funcionario] Llamando a usuarioService.listarCompleto()...');
      const usuarios = await usuarioService.listarCompleto({ limit: 1 }).catch((err) => {
        if (err?.isTokenExpired) {
          SecurityUtils.logSecurityEvent('TOKEN_EXPIRED_USUARIOS_FUNCIONARIO', {});
          throw err;
        }
        console.error('❌ [Dashboard Funcionario] Error al cargar usuarios:', err);
        return { total: 0 };
      });
      console.log('📦 [Dashboard Funcionario] Usuarios recibidos:', usuarios);

      console.log('📤 [Dashboard Funcionario] Llamando a agenteService.getAll()...');
      const agentes = await agenteService.getAll().catch((err) => {
        if (err?.isTokenExpired) {
          SecurityUtils.logSecurityEvent('TOKEN_EXPIRED_AGENTES_FUNCIONARIO', {});
          throw err;
        }
        console.error('❌ [Dashboard Funcionario] Error al cargar agentes:', err);
        return [];
      });
      console.log('📦 [Dashboard Funcionario] Agentes recibidos:', agentes);

      console.log('📤 [Dashboard Funcionario] Llamando a departamentoService.getAll()...');
      const departamentos = await departamentoService.getAll().catch((err) => {
        if (err?.isTokenExpired) {
          SecurityUtils.logSecurityEvent('TOKEN_EXPIRED_DEPARTAMENTOS_FUNCIONARIO', {});
          throw err;
        }
        console.error('❌ [Dashboard Funcionario] Error al cargar departamentos:', err);
        return [];
      });
      console.log('📦 [Dashboard Funcionario] Departamentos recibidos:', departamentos);

      // Actualizar estadísticas con datos reales
      const newStats = {
        totalUsuarios: usuarios.total || 0,
        totalAgentes: Array.isArray(agentes) ? agentes.length : (agentes.total || 0),
        totalDepartamentos: Array.isArray(departamentos) ? departamentos.length : 0,
        conversacionesHoy: 0,
        interaccionesHoy: 0,
        ticketsAbiertos: 0,
        satisfaccion: 0
      };

      console.log('📊 [Dashboard Funcionario] Actualizando stats:', newStats);
      setStats(newStats);

      console.log('✅ [Dashboard Funcionario] Datos cargados correctamente');
    } catch (error) {
      // 🔐 Manejo de token expirado
      if (error?.isTokenExpired) {
        SecurityUtils.logSecurityEvent('TOKEN_EXPIRED_DASHBOARD_FUNCIONARIO', {});
        console.log('🔒 Token expirado - SessionContext manejará');
        setLoading(false);
        return;
      }

      console.error('❌ [Dashboard Funcionario] Error CRÍTICO cargando datos:', error);
      SecurityUtils.logSecurityEvent('ERROR_LOAD_DASHBOARD_FUNCIONARIO', {
        error: error.message,
        stack: error.stack
      });
    } finally {
      console.log('🏁 [Dashboard Funcionario] Finalizando carga (loading = false)');
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Refrescando datos...');
    await cargarDatos();
  };

  const handleLogout = async () => {
    try {
      await apiClient.removeToken();
      await authService.limpiarSesion();
      router.replace('/auth/login');
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
    }
  };

  const handleNavigateToProfile = () => {
    console.log('📍 Navegando a perfil de funcionario...');
    router.push('/funcionario/PerfilFuncionario');
  };

  // Configuración de tarjetas de estadísticas
  const statsCards = [
    {
      title: 'Total Usuarios',
      value: stats.totalUsuarios,
      subtitle: 'Usuarios registrados',
      icon: 'people',
      color: '#3b82f6',
      trend: 0
    },
    {
      title: 'Agentes IA',
      value: stats.totalAgentes,
      subtitle: 'Agentes activos',
      icon: 'hardware-chip',
      color: '#8b5cf6',
      trend: 0
    },
    {
      title: 'Departamentos',
      value: stats.totalDepartamentos,
      subtitle: 'Áreas organizadas',
      icon: 'business',
      color: '#10b981',
      trend: 0
    },
    {
      title: 'Conversaciones',
      value: stats.conversacionesHoy,
      subtitle: 'Hoy',
      icon: 'chatbubbles',
      color: '#f59e0b',
      trend: 0
    }
  ];

  // Loading state
  if (loading) {
    return (
      <View style={dashboardStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={dashboardStyles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#0f172a' }}>

      {/* ============ SIDEBAR WEB ============ */}
      {isWeb && (
        <FuncionarioSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onNavigate={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido Principal */}
      <View style={{ flex: 1, backgroundColor: '#0f172a' }}>

        {/* Header con botón toggle */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#1e1b4b',
          borderBottomWidth: 1,
          borderBottomColor: '#312e81',
        }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#312e81',
              padding: 12,
              borderRadius: 12,
              marginRight: 12,
            }}
            onPress={() => setSidebarOpen(!sidebarOpen)}
          >
            <Ionicons name={sidebarOpen ? "close" : "menu"} size={24} color="#ffffff" />
          </TouchableOpacity>

          <Text style={{
            color: '#ffffff',
            fontSize: 18,
            fontWeight: '600',
            flex: 1,
          }}>
            Dashboard
          </Text>
        </View>

        <ScrollView
          style={dashboardStyles.container}
          contentContainerStyle={dashboardStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Header Card */}
          <HeaderCard
            nombre={usuario.nombre_completo}
            username={usuario.username}
            role={usuario.role}
            onPress={handleNavigateToProfile}
          />

          {/* Stats Section */}
          <SectionHeader
            title="Estadísticas Generales"
            subtitle="Vista general del sistema"
            icon="stats-chart"
          />

          <View style={dashboardStyles.statsGrid}>
            {statsCards.map((card, index) => (
              <View key={index} style={dashboardStyles.statCardWrapper}>
                <StatCard
                  title={card.title}
                  value={card.value}
                  subtitle={card.subtitle}
                  icon={card.icon}
                  color={card.color}
                  trend={card.trend}
                  onClick={() => console.log(`Clicked: ${card.title}`)}
                />
              </View>
            ))}
          </View>

          {/* ============ GUÍA DE CONFIGURACIÓN - CARRUSEL ANIMADO ============ */}
          <SectionHeader
            title="Guía de Configuración"
            subtitle="Pasos para configurar el sistema"
            icon="rocket"
          />

          {/* Nota sobre permisos - Diseño Premium */}
          <View style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundColor: '#667eea',
            padding: 16,
            marginBottom: 16,
            borderRadius: 12,
            shadowColor: '#667eea',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{
                width: 40,
                height: 40,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 2
              }}>
                <Ionicons name="key" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  color: '#ffffff', 
                  fontSize: 14,
                  fontWeight: '600',
                  marginBottom: 6
                }}>
                  Acceso según permisos
                </Text>
                <Text style={{ 
                  color: 'rgba(255, 255, 255, 0.85)', 
                  fontSize: 12,
                  lineHeight: 18,
                  fontWeight: '400'
                }}>
                  Tu capacidad para configurar cada paso depende de los permisos asignados por tu administrador.
                </Text>
              </View>
            </View>
          </View>

          <Animated.ScrollView
            ref={carouselRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16 }}
            contentContainerStyle={{ paddingHorizontal: 0, gap: 12 }}
          >
            {/* Paso 1 */}
            <View style={{ width: 160, marginRight: 8 }}>
              <StatCard
                title="Crear Usuarios"
                value="1"
                subtitle="Registra administradores"
                icon="people"
                color="#3b82f6"
                trend={0}
                onClick={() => console.log('Paso 1')}
              />
            </View>

            {/* Paso 2 */}
            <View style={{ width: 160, marginRight: 8 }}>
              <StatCard
                title="Crear Departamentos"
                value="2"
                subtitle="Organiza áreas de trabajo"
                icon="business"
                color="#8b5cf6"
                trend={0}
                onClick={() => console.log('Paso 2')}
              />
            </View>

            {/* Paso 3 */}
            <View style={{ width: 160, marginRight: 8 }}>
              <StatCard
                title="Asignar al Departamento"
                value="3"
                subtitle="Vincula funcionarios"
                icon="link"
                color="#f59e0b"
                trend={0}
                onClick={() => console.log('Paso 3')}
              />
            </View>

            {/* Paso 4 */}
            <View style={{ width: 160, marginRight: 8 }}>
              <StatCard
                title="Crear Agentes"
                value="4"
                subtitle="Configura agentes IA"
                icon="hardware-chip"
                color="#10b981"
                trend={0}
                onClick={() => console.log('Paso 4')}
              />
            </View>

            {/* Paso 5 */}
            <View style={{ width: 160, marginRight: 8 }}>
              <StatCard
                title="Crear Categorías"
                value="5"
                subtitle="Organiza contenido"
                icon="list"
                color="#06b6d4"
                trend={0}
                onClick={() => console.log('Paso 5')}
              />
            </View>

            {/* Paso 6 */}
            <View style={{ width: 160, marginRight: 8 }}>
              <StatCard
                title="Cargar Contenido"
                value="6"
                subtitle="Sube información"
                icon="document-text"
                color="#ec4899"
                trend={0}
                onClick={() => console.log('Paso 6')}
              />
            </View>

            {/* Paso 7 */}
            <View style={{ width: 160, marginRight: 8 }}>
              <StatCard
                title="Ver Métricas"
                value="7"
                subtitle="Consulta reportes"
                icon="bar-chart"
                color="#f97316"
                trend={0}
                onClick={() => console.log('Paso 7')}
              />
            </View>

            {/* Paso 8 */}
            <View style={{ width: 160, marginRight: 8 }}>
              <StatCard
                title="Exportar a Excel"
                value="8"
                subtitle="Descarga datos"
                icon="download"
                color="#22c55e"
                trend={0}
                onClick={() => console.log('Paso 8')}
              />
            </View>

            {/* Paso 9 */}
            <View style={{ width: 160, marginRight: 8 }}>
              <StatCard
                title="Conversaciones con Visitantes"
                value="9"
                subtitle="Brinda ayuda a clientes"
                icon="chatbubbles"
                color="#8b5cf6"
                trend={0}
                onClick={() => console.log('Paso 9')}
              />
            </View>
          </Animated.ScrollView>

        </ScrollView>

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
              <FuncionarioSidebar
                isOpen={sidebarOpen}
                onNavigate={() => setSidebarOpen(false)}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}
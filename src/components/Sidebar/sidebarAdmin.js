// ==================================================================================
// sidebarAdmin.js
// Componente Sidebar para Admin - Usa los mismos estilos que SuperAdmin
// ==================================================================================

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { apiClient } from '../../api/client';
import authService from '../../api/services/authService';
import { sidebarStyles } from './SidebarSuperAdminStyles';

export default function AdminSidebar({ isOpen }) {
  const [expandedMenus, setExpandedMenus] = useState({});
  const router = useRouter();

  // Si el sidebar está cerrado, no renderizar nada (width: 0)
  if (!isOpen) {
    return <View style={sidebarStyles.containerCollapsed} />;
  }

  // Configuración del menú para Admin
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'grid-outline',
      route: '/admin/dashboard',
    },
    {
      id: 'usuarios',
      label: 'Gestión de Usuarios',
      icon: 'people-outline',
      submenu: [
        { label: 'Ver Usuarios', route: '/admin/usuariosAdmin' },
        { label: 'Asignacion de Usuarios', route: '/superadmin/DepartamentoUsuarioAdmin' }
      ]
    },
    {
      id: 'departamentos',
      label: 'Departamentos',
      icon: 'business-outline',
      submenu: [
        { label: 'Mis Departamentos', route: '/admin/departamentoAdmin' },
        { label: 'Asignar Usuarios', route: '/admin/departamentos/asignar' },
      ]
    },

    {
      id: 'Agente Inteligente',
      label: 'Gestion para agentes inteligentes',
      icon: 'shield-checkmark-outline',
      submenu: [
        { label: 'Agentes Inteligentes', route: '/admin/agenteAdmin' },
        { label: 'Categoria', route: '/admin/categoriaAdmin' },
        { label: 'Unidad Contenido', route: '/admin/contenidoAdmin' },
      ]
    },

    {
      id: 'reportes',
      label: 'Reportes',
      icon: 'bar-chart-outline',
      submenu: [
        { label: 'Reportes Generales', route: '/admin/reportes' },
        { label: 'Actividad de Usuarios', route: '/admin/reportes/actividad' },
        { label: 'Métricas del Departamento', route: '/admin/reportes/metricas' },
      ]
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: 'settings-outline',
      submenu: [
        { label: 'Perfil', route: '/admin/configuracion/perfil' },
        { label: 'Preferencias', route: '/admin/configuracion/preferencias' },
        { label: 'Notificaciones', route: '/admin/configuracion/notificaciones' },
      ]
    },
  ];

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleNavigation = (route) => {
    console.log('Navegando a:', route);
    try {
      router.push(route);
    } catch (error) {
      console.error('Error al navegar:', error);
    }
  };

  // 🔐 Logout real desde el sidebar
  const handleLogout = async () => {
    try {
      console.log('Cerrando sesión desde sidebar...');
      await apiClient.removeToken();
      await authService.limpiarSesion();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <View style={sidebarStyles.container}>
      {/* Header */}
      <View style={sidebarStyles.header}>
        <View style={sidebarStyles.iconWrapperGradient}>
          <Ionicons name="person-circle" size={24} color="#ffffff" />
        </View>
        <View style={sidebarStyles.headerTitle}>
          <Text style={sidebarStyles.title}>Admin</Text>
          <Text style={sidebarStyles.subtitle}>Administrador</Text>
        </View>
      </View>

      {/* Scroll Content */}
      <ScrollView 
        style={sidebarStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={sidebarStyles.menuContainer}>
          {menuItems.map((item) => {
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedMenus[item.id];

            return (
              <View key={item.id} style={sidebarStyles.menuItem}>
                {/* Botón principal del menú */}
                <TouchableOpacity
                  style={sidebarStyles.menuButton}
                  onPress={() => {
                    if (hasSubmenu) {
                      toggleMenu(item.id);
                    } else {
                      handleNavigation(item.route);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={sidebarStyles.menuButtonContent}>
                    <View style={sidebarStyles.menuIcon}>
                      <Ionicons name={item.icon} size={20} color="#ffffff" />
                    </View>
                    <Text style={sidebarStyles.menuLabel}>{item.label}</Text>
                  </View>
                  {hasSubmenu && (
                    <Ionicons 
                      name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                      size={20} 
                      color="#c7d2fe" 
                    />
                  )}
                </TouchableOpacity>

                {/* Submenu */}
                {hasSubmenu && isExpanded && (
                  <View style={sidebarStyles.submenu}>
                    {item.submenu.map((subitem, index) => (
                      <TouchableOpacity
                        key={index}
                        style={sidebarStyles.submenuItem}
                        onPress={() => handleNavigation(subitem.route)}
                        activeOpacity={0.7}
                      >
                        <View style={sidebarStyles.submenuIcon}>
                          <Ionicons 
                            name="chevron-forward" 
                            size={12} 
                            color="#c7d2fe" 
                          />
                        </View>
                        <Text style={sidebarStyles.submenuLabel}>
                          {subitem.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={sidebarStyles.footer}>
        <TouchableOpacity
          style={sidebarStyles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <View style={sidebarStyles.logoutIcon}>
            <Ionicons name="log-out-outline" size={20} color="#ffffff" />
          </View>
          <Text style={sidebarStyles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
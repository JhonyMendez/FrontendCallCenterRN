// ==================================================================================
// SidebarSuperAdminStyles.js
// Estilos para el Sidebar de Super Admin - React Native (Layout Fixed)
// ==================================================================================

import { StyleSheet } from 'react-native';

const DRAWER_WIDTH = 280;

export const sidebarStyles = StyleSheet.create({
  // Contenedor del sidebar - VISIBLE
  container: {
    width: DRAWER_WIDTH,
    backgroundColor: '#1e1b4b',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },

  // Cuando está cerrado (colapsado) - IMPORTANTE: width 0
  containerCollapsed: {
    width: 0,
    overflow: 'hidden',
  },

  // Header
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99, 102, 241, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
  },
  iconWrapperGradient: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fbbf24',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#c7d2fe',
  },

  // Scroll Content
  scrollContent: {
    flex: 1,
  },
  menuContainer: {
    padding: 16,
  },

  // Menu Items
  menuItem: {
    marginBottom: 8,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  menuButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },

  // Submenu
  submenu: {
    marginLeft: 32,
    marginTop: 4,
    overflow: 'hidden',
  },
  submenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingLeft: 12,
    borderRadius: 8,
    marginBottom: 2,
  },
  submenuIcon: {
    marginRight: 8,
  },
  submenuLabel: {
    fontSize: 13,
    color: '#c7d2fe',
  },

  // Footer
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(99, 102, 241, 0.3)',
    backgroundColor: '#1e1b4b',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    justifyContent: 'center',
  },
  logoutIcon: {
    marginRight: 12,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export const contentStyles = StyleSheet.create({
  // Wrapper principal - flex row para colocar sidebar y contenido lado a lado
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0f172a',
  },
  
  // Contenido principal
  mainContent: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  
  // Contenido con sidebar (ya no se usa en el nuevo diseño, pero se mantiene por compatibilidad)
  mainContentWithSidebar: {
    flex: 1,
  },
});

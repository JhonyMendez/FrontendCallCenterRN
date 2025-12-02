// src/styles/dashboardFuncionarioStyles.js
import { StyleSheet } from 'react-native';

export const dashboardFuncionarioStyles = StyleSheet.create({
  // ==================== CONTAINER ====================
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  scrollView: {
    flex: 1,
  },

  // ==================== HEADER CARD ====================
  headerCard: {
    margin: 20,
    marginTop: 60,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },

  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  headerInfo: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },

  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginTop: 2,
  },

  userInfo: {
    alignItems: 'flex-end',
  },

  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },

  userRole: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginTop: 2,
  },

  // ==================== AGREGAR CONTENIDO ====================
  addButton: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },

  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },

  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },

  // ==================== SEARCH BAR ====================
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  searchPlaceholder: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#b2bec3',
    fontWeight: '500',
  },

  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ==================== FILTER BAR ====================
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
    gap: 10,
  },

  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },

  filterButtonText: {
    fontSize: 13,
    color: '#636e72',
    fontWeight: '600',
    flex: 1,
  },

  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },

  // ==================== TABLE HEADER ====================
  tableContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    overflow: 'hidden',
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },

  headerCell: {
    flex: 1,
  },

  headerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2d3436',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ==================== CONTENT ROW ====================
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },

  contentCell: {
    flex: 1,
    justifyContent: 'center',
  },

  contentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
  },

  // ==================== CATEGORIA BADGE ====================
  categoriaBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },

  categoriaText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ==================== ESTADO BADGE ====================
  estadoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  estadoPublicado: {
    backgroundColor: '#d1f2eb',
  },

  estadoActivo: {
    backgroundColor: '#d1f2eb',
  },

  estadoInactivo: {
    backgroundColor: '#fadbd8',
  },

  estadoDefault: {
    backgroundColor: '#e9ecef',
  },

  estadoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2d3436',
  },

  // ==================== FECHA ====================
  fechaText: {
    fontSize: 13,
    color: '#636e72',
    fontWeight: '500',
  },

  // ==================== ACTIONS ====================
  contentActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 10,
  },

  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ==================== FOOTER ====================
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  footerButton: {
    alignItems: 'center',
    gap: 6,
  },

  footerButtonText: {
    fontSize: 12,
    color: '#636e72',
    fontWeight: '600',
  },
});
// contentStyles.js
import { StyleSheet } from 'react-native';

export const contentStyles = StyleSheet.create({
  // Wrapper principal para toda la página
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0f0a1f',
  },

  // Contenido principal (área a la derecha del sidebar)
  mainContent: {
    flex: 1,
    marginLeft: 0,
    position: 'relative',
  },

  // Contenido principal cuando el sidebar está abierto
  mainContentWithSidebar: {
    marginLeft: 0, // Sin margen, el sidebar está en posición absolute
  },

  // Container genérico para páginas
  pageContainer: {
    flex: 1,
    padding: 16,
  },

  // Header genérico
  pageHeader: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },

  // Título de página
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },

  // Subtítulo de página
  pageSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // Card genérico
  card: {
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },

  // Sección con borde
  section: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(102, 126, 234, 0.2)',
  },

  // Grid de 2 columnas
  grid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  // Grid de 3 columnas
  grid3: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  // Grid de 4 columnas
  grid4: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  // Columna de grid (50%)
  gridCol2: {
    flex: 1,
    minWidth: '48%',
  },

  // Columna de grid (33%)
  gridCol3: {
    flex: 1,
    minWidth: '31%',
  },

  // Columna de grid (25%)
  gridCol4: {
    flex: 1,
    minWidth: '23%',
  },

  // Divider horizontal
  divider: {
    height: 1,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    marginVertical: 16,
  },

  // Espaciado
  spacer: {
    height: 16,
  },

  spacerLarge: {
    height: 24,
  },

  spacerSmall: {
    height: 8,
  },

  // Texto genérico
  text: {
    color: '#ffffff',
    fontSize: 14,
  },

  textMuted: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },

  textSmall: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },

  // Botones genéricos
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  buttonPrimary: {
    backgroundColor: '#667eea',
  },

  buttonSecondary: {
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },

  buttonDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },

  buttonSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },

  // Input genérico
  input: {
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
    color: '#ffffff',
    fontSize: 15,
  },

  // Label de input
  label: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  // Mensaje de error
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },

  // Contenedor de scroll
  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 10, 31, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  // Centrado
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Row con gap
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
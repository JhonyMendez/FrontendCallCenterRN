// src/styles/loginStyles.js
import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get('window');
const isTabletOrDesktop = width >= 768;

export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f23",
  },
  mainContainer: {
    flexDirection: isTabletOrDesktop ? "row" : "column",
    width: "95%",
    maxWidth: 1200,
    minHeight: isTabletOrDesktop ? 650 : height * 0.9,
    backgroundColor: "#1a1a2e",
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOpacity: 0.3,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 15 },
    elevation: 20,
  },
  
  // Sección del formulario con glassmorphism
  formSection: {
    flex: 1,
    padding: isTabletOrDesktop ? 60 : 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  glassContainer: {
    width: "100%",
    maxWidth: 450,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 30,
    padding: 40,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  
  // Header con logo
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  logoContainer: {
    marginBottom: 15,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  logo: {
    fontSize: 36,
    fontWeight: "900",
    color: "#2d3436",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2d3436",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#636e72",
    textAlign: "center",
    marginBottom: 35,
  },
  
  formContent: {
    width: "100%",
  },
  
  // Inputs mejorados
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2d3436",
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#2d3436",
    fontWeight: "500",
  },
  
  // Botones
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 16,
    marginTop: 10,
    shadowColor: "#667eea",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 1,
  },
  
  // Divisor elegante
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#dfe6e9",
  },
  dividerText: {
    marginHorizontal: 20,
    color: "#b2bec3",
    fontSize: 13,
    fontWeight: "600",
  },
  
  // Botón de Google premium
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  googleIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2d3436",
  },
  
  // Error mejorado
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffe5e5",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#ff4757",
  },
  error: {
    color: "#ff4757",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
    flex: 1,
  },
  
  // Sección de ilustración ultra moderna
  illustrationSection: {
    flex: 1,
    backgroundColor: "#16213e",
    justifyContent: "center",
    alignItems: "center",
    padding: 50,
    position: "relative",
    display: isTabletOrDesktop ? "flex" : "none",
    overflow: "hidden",
  },
  
  // Elementos decorativos flotantes
  floatingCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    top: -100,
    right: -100,
  },
  floatingCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(118, 75, 162, 0.1)",
    bottom: -50,
    left: -50,
  },
  gridPattern: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.05,
  },
  
  // Círculo principal
  illustrationCircle: {
    width: 380,
    height: 380,
    borderRadius: 190,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(102, 126, 234, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    shadowColor: "#667eea",
    shadowOpacity: 0.3,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
  },
  circleGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 190,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Card de imagen mejorada
  imageCard: {
    width: 280,
    height: 190,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  cardGradient: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  
  // Sol/Luna animado
  imageCircle: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    top: 25,
    left: 25,
    shadowColor: "#ffd93d",
    shadowOpacity: 0.8,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  sunGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },
  
  // Montañas mejoradas
  mountainContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  mountain1: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 65,
    borderRightWidth: 65,
    borderBottomWidth: 110,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "rgba(59, 172, 182, 0.9)",
    marginLeft: -20,
  },
  mountain2: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 70,
    borderRightWidth: 70,
    borderBottomWidth: 95,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "rgba(91, 192, 222, 0.85)",
    marginLeft: -45,
  },
  mountain3: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 55,
    borderRightWidth: 55,
    borderBottomWidth: 75,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "rgba(65, 201, 226, 0.8)",
    marginLeft: -35,
  },
  
  // Textos decorativos
  illustrationText: {
    marginTop: 40,
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 1,
  },
  illustrationSubtext: {
    marginTop: 8,
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },
});
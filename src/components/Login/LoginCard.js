// src/components/Login/LoginCard.js
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, TextInput, TouchableOpacity, View } from "react-native";
import { loginStyles } from "../../styles/loginStyles";

const CAROUSEL_APPS = [
  {
    id: 0,
    tipo: 'main',
    titulo: 'TEC-AI',
    subtitulo: 'Sistema Integral de Gestión',
    descripcion: 'Educación inteligente, resultados extraordinarios',
    color: '#667eea'
  },
  {
    id: 1,
    tipo: 'app',
    titulo: 'Gestión Móvil',
    subtitulo: '📊 Administración',
    descripcion: 'Administra tu organización desde cualquier lugar',
    color: '#764ba2',
    appName: 'GestionMovil'
  },
  {
    id: 2,
    tipo: 'app',
    titulo: 'TEC-AI Móvil',
    subtitulo: '🤖 ChatBot IA',
    descripcion: 'Chatea con el chatbot inteligente - Solo Android',
    color: '#667eea',
    appName: 'TecAIMobile'
  }
];

export default function LoginCard({
  username,
  password,
  setUsername,
  setPassword,
  errorMsg,
  handleLogin,
  isBlocked,
  tiempoRestante,
  intentosRestantes,
  mostrarPassword,
  setMostrarPassword,
}) {
  // Estado del carrusel
  const [currentSlide, setCurrentSlide] = useState(0);
  // Animaciones
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de flotación
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -20,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animación de pulso
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in inicial
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Auto-slide del carrusel
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_APPS.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Animación de shake cuando hay error
  useEffect(() => {
    if (errorMsg) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [errorMsg]);

  return (
    <View style={loginStyles.mainContainer}>
      {/* Sección del formulario con glassmorphism */}
      <Animated.View style={[loginStyles.formSection, { opacity: fadeIn }]}>
        <View style={[loginStyles.glassContainer, { borderWidth: 1, borderColor: '#f0f0f5' }]}>
          {/* Header con logo animado */}
          <View style={[loginStyles.header, { marginBottom: 30 }]}>
            <View style={loginStyles.logoContainer}>
              <LinearGradient
                colors={isBlocked ? ['#ff4757', '#ff6348'] : ['#667eea', '#764ba2', '#f093fb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[loginStyles.logoGradient, { shadowColor: isBlocked ? '#ff4757' : '#667eea', shadowOpacity: 0.6 }]}
              >
                <Ionicons 
                  name={isBlocked ? "lock-closed" : "shield-checkmark"} 
                  size={40} 
                  color="#fff" 
                />
              </LinearGradient>
            </View>
            <Text style={[loginStyles.logo, { fontSize: 32, marginTop: 16 }]}>TEC-AI</Text>
          </View>

          <Text style={[loginStyles.subtitle, { fontSize: 26, marginBottom: 12 }]}>
            {isBlocked ? "🔐 Cuenta bloqueada" : "👋 Bienvenido"}
          </Text>
          <Text style={[loginStyles.description, { marginBottom: 40, fontSize: 14, lineHeight: 22 }]}>
            {isBlocked 
              ? `⏱️ Tiempo restante: ${tiempoRestante}` 
              : "Accede con tu usuario y contraseña"
            }
          </Text>

          <View style={loginStyles.formContent}>
            {/* Mensaje de error con animación */}
            {errorMsg ? (
              <Animated.View 
                style={[
                  loginStyles.errorContainer,
                  { transform: [{ translateX: shakeAnim }] }
                ]}
              >
                <Ionicons name="alert-circle" size={20} color="#ff4757" />
                <Text style={loginStyles.error}>{errorMsg}</Text>
              </Animated.View>
            ) : null}

            {/* Indicador de intentos restantes */}
            {!isBlocked && intentosRestantes < 5 && intentosRestantes > 0 ? (
              <View style={loginStyles.warningContainer}>
                <Ionicons name="warning-outline" size={18} color="#ffa502" />
                <Text style={loginStyles.warningText}>
                  {intentosRestantes} intento{intentosRestantes !== 1 ? 's' : ''} restante{intentosRestantes !== 1 ? 's' : ''}
                </Text>
              </View>
            ) : null}

            {/* Input de correo con ícono */}
            <View style={loginStyles.inputGroup}>
              <Text style={[loginStyles.label, { fontSize: 13, letterSpacing: 0.8 }]}>👤 USUARIO</Text>
              <View style={[
                loginStyles.inputContainer,
                isBlocked && loginStyles.inputDisabled,
                { backgroundColor: '#fafbfc', borderColor: '#e1e8ed', height: 54, paddingHorizontal: 20 }
              ]}>
                <Ionicons 
                  name="person-outline" 
                  size={22} 
                  color={isBlocked ? "#ccc" : "#667eea"} 
                  style={{ marginRight: 14 }} 
                />
                <TextInput
                  placeholder="Ingrese su usuario"
                  placeholderTextColor="#c5cad3"
                  style={[loginStyles.input, { fontSize: 16 }]}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  editable={!isBlocked}
                  maxLength={50}
                />
              </View>
            </View>

            {/* Input de contraseña con ícono */}
            <View style={[loginStyles.inputGroup, { marginTop: 22 }]}>
              <Text style={[loginStyles.label, { fontSize: 13, letterSpacing: 0.8 }]}>🔑 CONTRASEÑA</Text>
              <View style={[
                loginStyles.inputContainer,
                isBlocked && loginStyles.inputDisabled,
                { backgroundColor: '#fafbfc', borderColor: '#e1e8ed', height: 54, paddingHorizontal: 20 }
              ]}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={22} 
                  color={isBlocked ? "#ccc" : "#667eea"} 
                  style={{ marginRight: 14 }} 
                />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#c5cad3"
                  secureTextEntry={!mostrarPassword}
                  style={[loginStyles.input, { flex: 1, fontSize: 16 }]}
                  value={password}
                  onChangeText={setPassword}
                  editable={!isBlocked}
                  maxLength={100}
                />
                {/* Botón para mostrar/ocultar contraseña */}
                <TouchableOpacity
                  onPress={() => setMostrarPassword(!mostrarPassword)}
                  style={{ padding: 10, marginRight: -6 }}
                  activeOpacity={0.6}
                  disabled={isBlocked}
                >
                  <Ionicons 
                    name={mostrarPassword ? "eye-off-outline" : "eye-outline"} 
                    size={22} 
                    color={isBlocked ? "#ccc" : "#667eea"} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Botón principal con gradiente */}
            <TouchableOpacity 
              onPress={handleLogin} 
              activeOpacity={0.85}
              disabled={isBlocked}
              style={{ marginTop: 32 }}
            >
              <LinearGradient
                colors={isBlocked ? ['#d4d4d4', '#a8a8a8'] : ['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  loginStyles.button,
                  isBlocked && loginStyles.buttonDisabled,
                  { 
                    height: 56, 
                    borderRadius: 14,
                    shadowColor: '#667eea',
                    shadowOpacity: isBlocked ? 0 : 0.35,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 8 }
                  }
                ]}
              >
                <Ionicons 
                  name={isBlocked ? "lock-closed" : "arrow-forward"} 
                  size={22} 
                  color="#fff" 
                  style={{ marginRight: 10 }} 
                />
                <Text style={[loginStyles.buttonText, { fontSize: 16, letterSpacing: 0.8 }]}>
                  {isBlocked ? "BLOQUEADO" : "INICIAR SESIÓN"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Información de seguridad */}
            {!isBlocked && (
              <View style={[loginStyles.securityInfo, { marginTop: 22 }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#667eea" />
                <Text style={[loginStyles.securityText, { color: '#667eea', fontSize: 13 }]}>
                  Conexión 100% segura y encriptada
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>

{/* Sección CARRUSEL con QR - TOTALMENTE RESPONSIVA */}
      <View style={loginStyles.illustrationSection}>
        {/* Elementos decorativos de fondo */}
        <Animated.View style={[loginStyles.floatingCircle1, { transform: [{ translateY: floatAnim }] }]} />
        <Animated.View style={[loginStyles.floatingCircle2, { transform: [{ translateY: floatAnim }] }]} />
        <View style={loginStyles.gridPattern} />

        {/* Carrusel Container */}
        <View style={{ 
          flex: 1, 
          alignItems: 'center', 
          justifyContent: 'center',
          paddingHorizontal: 20,
          paddingVertical: 40,
          width: '100%'
        }}>
          {/* Contenedor principal con flechas a los lados */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}>
            {/* Flecha Izquierda */}
            <TouchableOpacity
              onPress={() => setCurrentSlide((prev) => prev === 0 ? CAROUSEL_APPS.length - 1 : prev - 1)}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                marginRight: 80
              }}
            >
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Contenido del Slide */}
            <Animated.View style={{
              opacity: fadeIn,
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
            }}>
              {/* Slide Contenido */}
              {CAROUSEL_APPS[currentSlide].tipo === 'main' ? (
                // SLIDE PRINCIPAL - TEC-AI
                <View style={{ alignItems: 'center' }}>
                  <Animated.View style={{ 
                    transform: [{ scale: pulseAnim }], 
                    marginBottom: 25,
                  }}>
                    <Ionicons 
                      name="school" 
                      size={100} 
                      color="#667eea"
                      style={{
                        textShadowColor: 'rgba(102, 126, 234, 0.5)',
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 40,
                      }}
                    />
                  </Animated.View>
                  <Text style={{
                    fontSize: 48,
                    fontWeight: '900',
                    color: '#fff',
                    textAlign: 'center',
                    marginBottom: 15,
                    letterSpacing: -1,
                  }}>
                    TEC-AI
                  </Text>
                  <Text style={{
                    fontSize: 18,
                    color: '#E5E7EB',
                    textAlign: 'center',
                    lineHeight: 28,
                    fontWeight: '300',
                  }}>
                    Educación inteligente, resultados extraordinarios
                  </Text>
                </View>
              ) : (
                // SLIDES DE APPS - CON QR
                <View style={{ alignItems: 'center', width: '100%' }}>
                  {/* Espacio para código QR */}
                  <View style={{
                    width: 200,
                    height: 200,
                    backgroundColor: CAROUSEL_APPS[currentSlide].color,
                    borderRadius: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 25,
                    shadowColor: CAROUSEL_APPS[currentSlide].color,
                    shadowOpacity: 0.5,
                    shadowRadius: 25,
                    shadowOffset: { width: 0, height: 0 },
                    borderWidth: 3,
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  }}>
                    <Ionicons 
                      name="qr-code" 
                      size={130} 
                      color="rgba(255, 255, 255, 0.7)" 
                    />
                    <Text style={{
                      position: 'absolute',
                      bottom: 10,
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: '600',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 6
                    }}>
                      {CAROUSEL_APPS[currentSlide].appName}
                    </Text>
                  </View>

                  {/* Información de la app */}
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '800',
                    color: '#fff',
                    textAlign: 'center',
                    marginBottom: 8,
                    letterSpacing: 0.5
                  }}>
                    {CAROUSEL_APPS[currentSlide].titulo}
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    color: '#E5E7EB',
                    textAlign: 'center',
                    lineHeight: 20,
                    fontWeight: '300',
                    marginBottom: 10
                  }}>
                    {CAROUSEL_APPS[currentSlide].descripcion}
                  </Text>
                  <Text style={{
                    fontSize: 11,
                    color: CAROUSEL_APPS[currentSlide].color,
                    fontWeight: '600',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 18,
                    overflow: 'hidden'
                  }}>
                    {CAROUSEL_APPS[currentSlide].subtitulo}
                  </Text>
                </View>
              )}
            </Animated.View>

            {/* Flecha Derecha */}
            <TouchableOpacity
              onPress={() => setCurrentSlide((prev) => (prev + 1) % CAROUSEL_APPS.length)}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                marginLeft: 80
              }}
            >
              <Ionicons name="chevron-forward" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
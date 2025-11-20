// src/components/Login/LoginCard.js
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, TextInput, TouchableOpacity, View } from "react-native";
import { loginStyles } from "../../styles/loginStyles";

export default function LoginCard({
  username,
  password,
  setUsername,
  setPassword,
  errorMsg,
  handleLogin,
}) {
  // Animaciones
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

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
  }, []);

  return (
    <View style={loginStyles.mainContainer}>
      {/* Sección del formulario con glassmorphism */}
      <Animated.View style={[loginStyles.formSection, { opacity: fadeIn }]}>
        <View style={loginStyles.glassContainer}>
          {/* Header con logo animado */}
          <View style={loginStyles.header}>
            <View style={loginStyles.logoContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={loginStyles.logoGradient}
              >
                <Ionicons name="shield-checkmark" size={36} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={loginStyles.logo}>TEC-AI</Text>
          </View>

          <Text style={loginStyles.subtitle}>Bienvenido de nuevo</Text>
          <Text style={loginStyles.description}>Inicia sesión para continuar</Text>

          <View style={loginStyles.formContent}>
            {errorMsg ? (
              <View style={loginStyles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#ff4757" />
                <Text style={loginStyles.error}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Input de correo con ícono */}
            <View style={loginStyles.inputGroup}>
              <Text style={loginStyles.label}>Correo</Text>
              <View style={loginStyles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#a29bfe" style={loginStyles.inputIcon} />
                <TextInput
                  placeholder="tu@email.com"
                  placeholderTextColor="#bbb"
                  style={loginStyles.input}
                  value={username}
                  onChangeText={setUsername}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Input de contraseña con ícono */}
            <View style={loginStyles.inputGroup}>
              <Text style={loginStyles.label}>Contraseña</Text>
              <View style={loginStyles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#a29bfe" style={loginStyles.inputIcon} />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#bbb"
                  secureTextEntry
                  style={loginStyles.input}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {/* Botón principal con gradiente */}
            <TouchableOpacity onPress={handleLogin} activeOpacity={0.8}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={loginStyles.button}
              >
                <Text style={loginStyles.buttonText}>Iniciar Sesión</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Divisor elegante */}
            <View style={loginStyles.divider}>
              <View style={loginStyles.dividerLine} />
              <Text style={loginStyles.dividerText}>o continúa con</Text>
              <View style={loginStyles.dividerLine} />
            </View>

            {/* Botón de Google mejorado */}
            <TouchableOpacity style={loginStyles.googleButton} activeOpacity={0.7}>
              <View style={loginStyles.googleIconContainer}>
                <Ionicons name="logo-google" size={22} color="#DB4437" />
              </View>
              <Text style={loginStyles.googleButtonText}>Continuar con Google</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Sección de ilustración ultra moderna */}
      <View style={loginStyles.illustrationSection}>
        {/* Elementos decorativos de fondo */}
        <Animated.View style={[loginStyles.floatingCircle1, { transform: [{ translateY: floatAnim }] }]} />
        <Animated.View style={[loginStyles.floatingCircle2, { transform: [{ translateY: floatAnim }] }]} />
        <View style={loginStyles.gridPattern} />

        {/* Círculo principal con ilustración */}
        <Animated.View style={[loginStyles.illustrationCircle, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']}
            style={loginStyles.circleGradient}
          >
            <View style={loginStyles.imageCard}>
              <LinearGradient
                colors={['#17a2b8', '#138496']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={loginStyles.cardGradient}
              >
                {/* Sol/Luna */}
                <Animated.View style={[loginStyles.imageCircle, { transform: [{ scale: pulseAnim }] }]}>
                  <LinearGradient
                    colors={['#ffd93d', '#ff6b35']}
                    style={loginStyles.sunGradient}
                  />
                </Animated.View>

                {/* Montañas mejoradas */}
                <View style={loginStyles.mountainContainer}>
                  <View style={loginStyles.mountain1} />
                  <View style={loginStyles.mountain2} />
                  <View style={loginStyles.mountain3} />
                </View>
              </LinearGradient>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Texto decorativo */}
        <Text style={loginStyles.illustrationText}>Seguridad y confianza</Text>
        <Text style={loginStyles.illustrationSubtext}>Tu información está protegida</Text>
      </View>
    </View>
  );
}
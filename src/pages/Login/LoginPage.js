// src/pages/Login/LoginPage.js
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { apiClient } from "../../api/client";
import { usuarioService } from "../../api/services/usuarioService";
import LoginCard from "../../components/Login/LoginCard";
import { loginStyles } from "../../styles/loginStyles";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Validaciones básicas
    if (!username.trim()) {
      setErrorMsg("Por favor ingresa tu usuario");
      return;
    }

    if (!password.trim()) {
      setErrorMsg("Por favor ingresa tu contraseña");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);

    try {
      console.log("🔐 Intentando login con:", { username });

      // Llamada al servicio
      const response = await usuarioService.login({ 
        username: username.trim(), 
        password: password.trim()
      });

      console.log("✅ Respuesta del servidor:", response);

      // Verifica la estructura de la respuesta
      if (!response || !response.token) {
        throw new Error("Respuesta del servidor inválida");
      }

      // Guarda el token
      await apiClient.setToken(response.token);

      console.log("✅ Token guardado exitosamente");
      console.log("👤 Usuario:", response.usuario);

      // Verifica si requiere cambio de contraseña
      if (response.usuario?.requiere_cambio_password) {
        console.log("⚠️ Usuario requiere cambio de contraseña");
        router.replace("/cambiar-password");
        return;
      }

      // Redirige a departamentos
      console.log("🚀 Redirigiendo a departamentos...");
      router.replace("/departamentos");

    } catch (error) {
      console.error("❌ Error completo:", error);
      
      // Manejo detallado de errores
      if (error.status === 401) {
        setErrorMsg("Usuario o contraseña incorrectos");
      } else if (error.status === 403) {
        setErrorMsg(error.message || "Usuario bloqueado o inactivo");
      } else if (error.isTimeout) {
        setErrorMsg("Tiempo de espera agotado. Verifica tu conexión");
      } else if (error.message === "Network request failed") {
        setErrorMsg("No se pudo conectar al servidor. Verifica tu conexión");
      } else if (error.message) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("Error al iniciar sesión. Intenta nuevamente");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={loginStyles.container}>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <LoginCard
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
          errorMsg={errorMsg}
          handleLogin={handleLogin}
        />
      )}
    </View>
  );
}
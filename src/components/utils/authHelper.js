// authHelper.js
import { jwtDecode } from "jwt-decode";
import { apiClient } from "../../api/client"; // ← IMPORTAR ESTO

export const getUserIdFromToken = async () => {
  try {
    // Usar apiClient en lugar de AsyncStorage directamente
    const token = await apiClient.getToken();

    if (!token) {
      console.log("❌ No hay token - usuario no autenticado");
      return null;
    }

    const decoded = jwtDecode(token);
    console.log("🔍 Token decodificado:", decoded);

    // El ID está en "sub" como STRING
    const userId = decoded.sub ? parseInt(decoded.sub) : null;
    
    console.log("✅ ID obtenido:", userId);
    return userId;

  } catch (error) {
    console.error("❌ Error obteniendo ID desde token:", error);
    return null;
  }
};
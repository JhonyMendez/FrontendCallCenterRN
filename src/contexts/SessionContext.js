// src/contexts/SessionContext.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useRef, useState } from 'react';
import { Platform } from 'react-native';
import SessionExpiredModal from '../components/Modals/SessionExpiredModal';

const isWeb = Platform.OS === 'web';

// ==================== STORAGE UNIVERSAL ====================
const Storage = {
    async getItem(key) {
        if (isWeb) {
            return localStorage.getItem(key);
        } else {
            return await AsyncStorage.getItem(key);
        }
    },
    
    async removeItem(key) {
        if (isWeb) {
            localStorage.removeItem(key);
        } else {
            await AsyncStorage.removeItem(key);
        }
    }
};

const SessionContext = createContext();

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession debe usarse dentro de SessionProvider');
    }
    return context;
};

export const SessionProvider = ({ children }) => {
    const [showExpiredModal, setShowExpiredModal] = useState(false);
    const cleaningSession = useRef(false); // Prevenir limpiezas múltiples
    const modalShown = useRef(false); // Prevenir mostrar modal múltiples veces

    // ✅ FUNCIÓN PRINCIPAL: Detecta sesión expirada
    const handleSessionExpired = async () => {
        // Prevenir múltiples llamadas simultáneas
        if (cleaningSession.current || modalShown.current) {
            console.log('🔄 [SessionContext] Ya procesando sesión expirada, ignorando...');
            return;
        }

        cleaningSession.current = true;
        modalShown.current = true;
        
        console.log('🔒 [SessionContext] Sesión expirada - Limpiando datos...');
        
        try {
            // ✅ Limpiar TODOS los datos de sesión
            const keysToRemove = [
                'auth_token',
                '@usuario_id',
                '@usuario_username',
                '@usuario_email',
                '@usuario_nombre_completo',
                '@usuario_id_departamento',
                '@usuario_es_admin',
                '@usuario_es_superadmin',
                '@rol_principal_id',
                '@rol_principal_nombre',
                '@todos_roles',
                '@permisos',
                '@datos_sesion',
                'userData',
                'userRole',
            ];

            await Promise.all(keysToRemove.map(key => Storage.removeItem(key)));
            
            console.log('✅ [SessionContext] Datos de sesión limpiados completamente');
        } catch (error) {
            console.error('❌ [SessionContext] Error limpiando sesión:', error);
        }

        // ✅ Mostrar modal
        console.log('🔔 [SessionContext] Mostrando modal de sesión expirada');
        setShowExpiredModal(true);
    };

    // ✅ CERRAR MODAL Y REDIRIGIR
    const handleCloseModal = async () => {
        console.log('🔄 [SessionContext] Cerrando modal y redirigiendo al login');
        setShowExpiredModal(false);

        // Pequeño delay para que la animación del modal termine
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Redirigir a login
        router.replace('/auth/login');
        
        // ✅ Resetear flags después de completar todo
        setTimeout(() => {
            cleaningSession.current = false;
            modalShown.current = false;
            console.log('✅ [SessionContext] Sesión completamente limpiada y reseteada');
        }, 300);
    };

    // ✅ FUNCIÓN PARA LOGOUT MANUAL (sin modal)
    const handleManualLogout = async () => {
        if (cleaningSession.current) {
            console.log('🔄 [SessionContext] Ya limpiando sesión, ignorando logout manual');
            return;
        }

        cleaningSession.current = true;
        console.log('🚪 [SessionContext] Logout manual iniciado');

        try {
            // Intentar notificar al backend
            try {
                const token = await Storage.getItem('auth_token');
                if (token) {
                    const endpoint = isWeb ? '/api/auth/logout' : 'YOUR_API_URL/auth/logout';
                    await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    console.log('✅ [SessionContext] Backend notificado del logout');
                }
            } catch (error) {
                console.log('⚠️ [SessionContext] Error notificando logout:', error.message);
            }

            // Limpiar datos
            const keysToRemove = [
                'auth_token',
                '@usuario_id',
                '@usuario_username',
                '@usuario_email',
                '@usuario_nombre_completo',
                '@usuario_id_departamento',
                '@usuario_es_admin',
                '@usuario_es_superadmin',
                '@rol_principal_id',
                '@rol_principal_nombre',
                '@todos_roles',
                '@permisos',
                '@datos_sesion',
                'userData',
                'userRole',
            ];

            await Promise.all(keysToRemove.map(key => Storage.removeItem(key)));
            
            console.log('✅ [SessionContext] Logout completado');
            
            // Redirigir sin mostrar modal
            await new Promise(resolve => setTimeout(resolve, 100));
            router.replace('/auth/login');
            
            // Resetear flag
            setTimeout(() => {
                cleaningSession.current = false;
            }, 200);

        } catch (error) {
            console.error('❌ [SessionContext] Error en logout manual:', error);
            cleaningSession.current = false;
        }
    };

    return (
        <SessionContext.Provider value={{ 
            handleSessionExpired,
            handleManualLogout 
        }}>
            {children}
            <SessionExpiredModal
                visible={showExpiredModal}
                onClose={handleCloseModal}
            />
        </SessionContext.Provider>
    );
};
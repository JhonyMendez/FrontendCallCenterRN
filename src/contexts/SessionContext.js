import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useRef, useState } from 'react';
import { Platform } from 'react-native';
import SessionExpiredModal from '../components/Modals/SessionExpiredModal';

// Storage universal
const Storage = {
    async removeItem(key) {
        if (Platform.OS === 'web') {
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

    const handleSessionExpired = async () => {
        // Prevenir múltiples llamadas simultáneas
        if (cleaningSession.current) {
            console.log('🔄 Ya estamos limpiando la sesión, ignorando...');
            return;
        }

        cleaningSession.current = true;
        console.log('🔒 Sesión expirada - Limpiando datos...');
        
        try {
            // Limpiar TODOS los datos de sesión
            await Promise.all([
                Storage.removeItem('auth_token'),
                Storage.removeItem('@usuario_id'),
                Storage.removeItem('@usuario_username'),
                Storage.removeItem('@usuario_email'),
                Storage.removeItem('@rol_principal_id'),
                Storage.removeItem('@rol_principal_nombre'),
                Storage.removeItem('@todos_roles'),
                Storage.removeItem('@permisos'),
                Storage.removeItem('@datos_sesion'),
                Storage.removeItem('userData'),
                Storage.removeItem('userRole'),
            ]);
            console.log('✅ Datos de sesión limpiados completamente');
        } catch (error) {
            console.error('❌ Error limpiando sesión:', error);
        }

        console.log('🔔 Mostrando modal de sesión expirada');
        setShowExpiredModal(true);
    };

    const handleCloseModal = async () => {
        console.log('🔄 Cerrando modal y redirigiendo al login');
        setShowExpiredModal(false);

        // ✅ Pequeño delay para que el modal se cierre visualmente
        await new Promise(resolve => setTimeout(resolve, 100));

        // ✅ CLAVE: usar replace() para reemplazar la historia de navegación
        // Esto previene que el usuario pueda retroceder
        if (Platform.OS === 'web') {
            // En web, también limpiamos el historial
            router.replace('/auth/login');
            // Opcional: forzar recarga para limpiar cualquier estado en memoria
            // window.location.href = '/auth/login';
        } else {
            // En mobile
            router.replace('/auth/login');
        }
        
        cleaningSession.current = false;
        console.log('✅ Redirigido a login - sesión completamente limpiada');
    };

    return (
        <SessionContext.Provider value={{ handleSessionExpired }}>
            {children}
            <SessionExpiredModal
                visible={showExpiredModal}
                onClose={handleCloseModal}
            />
        </SessionContext.Provider>
    );
};
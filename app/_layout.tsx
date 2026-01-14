// app/_layout.tsx
import { setSessionExpiredCallback } from '@/src/components/utils/authHelper'; // ✅ CORRECTO
import { SessionProvider, useSession } from '@/src/contexts/SessionContext';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';

// Componente interno que configura el callback
function RootLayoutContent() {
    const { handleSessionExpired } = useSession();

    useEffect(() => {
        // ✅ Vincular el callback para que authHelper pueda notificar sesiones expiradas
        setSessionExpiredCallback(handleSessionExpired);
        console.log('✅ [RootLayout] Callback de sesión expirada vinculado');

        return () => {
            setSessionExpiredCallback(null);
            console.log('🔌 [RootLayout] Callback desvinculado');
        };
    }, [handleSessionExpired]);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="not-found" />
            
            {/* Rutas de autenticación (públicas) */}
            <Stack.Screen name="auth" />
            
            {/* Rutas protegidas por rol */}
            <Stack.Screen name="(superadmin)" />
            <Stack.Screen name="(admin)" />
            <Stack.Screen name="(funcionario)" />
            
            {/* Otras rutas */}
            <Stack.Screen name="constants" />
            <Stack.Screen name="routes" />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <SessionProvider>
            <RootLayoutContent />
        </SessionProvider>
    );
}
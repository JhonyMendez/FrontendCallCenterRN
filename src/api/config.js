import { Platform } from 'react-native';

/**
 * Obtiene la URL base automáticamente según la plataforma
 */
const getBaseURL = () => {
  const API_PATH = '/api/v1/';  // ✅ AGREGADO: Barra final para evitar problemas con FastAPI
  
  // 🔧 CONFIGURACIÓN DE IPs Y URLs
  const LOCAL_IP = '192.168.18.193';
  const LOCAL_PORT = '8000';
  const PRODUCTION_URL = 'https://api.engine-tecai.me';
  
  // 🚀 MODO: Cambia entre 'development' o 'production'
  const MODE = 'development'; // ✅ PRODUCCIÓN: Usa HTTPS a api.engine-tecai.me

  // 🤖 ANDROID
  if (Platform.OS === 'android') {
    const url = MODE === 'development' 
      ? `http://${LOCAL_IP}:${LOCAL_PORT}${API_PATH}`
      : `${PRODUCTION_URL}${API_PATH}`;
    console.log(`🤖 ANDROID [${MODE.toUpperCase()}] - URL:`, url);
    return url;
  }

  // 💻 WEB - Desde el navegador del host, conecta a la IP del host
  if (Platform.OS === 'web') {
    const url = MODE === 'development'
      ? `http://${LOCAL_IP}:${LOCAL_PORT}${API_PATH}`
      : `${PRODUCTION_URL}${API_PATH}`;
    console.log(`🌐 WEB [${MODE.toUpperCase()}] - URL:`, url);
    return url;
  }

  // 📱 iOS
  if (Platform.OS === 'ios') {
    const url = MODE === 'development'
      ? `http://${LOCAL_IP}:${LOCAL_PORT}${API_PATH}`
      : `${NGROK_URL}${API_PATH}`;
    console.log(`📱 iOS [${MODE.toUpperCase()}] - URL:`, url);
    return url;
  }

  // Default - Fallback para cualquier otra plataforma
  return `http://64.23.152.92:${LOCAL_PORT}${API_PATH}`;
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  TIMEOUT: 15000,
  HEADERS: {
    'Content-Type': 'application/json',
  }
};

export const ENDPOINTS = {
  // Agentes Virtuales
  AGENTES: {
    BASE: 'agentes/',  // ✅ SIN barra inicial (baseURL ya tiene trailing slash)
    BY_ID: (id) => `agentes/${id}`,
    ESTADISTICAS: 'agentes/estadisticas',
    BUSCAR: 'agentes/buscar',
    ESTADISTICAS_BY_ID: (id) => `agentes/${id}/estadisticas`,
  },

  // Conversaciones
  CONVERSACIONES: {
    BASE: 'conversaciones/',  // ✅ SIN barra inicial
    BY_ID: (id) => `conversaciones/${id}`,
    ACTIVAS: 'conversaciones/activas',
    ESTADISTICAS: 'conversaciones/estadisticas',
    ESTADISTICAS_FECHA: (fecha) => `conversaciones/estadisticas/fecha/${fecha}`,
    BY_VISITANTE: (id) => `conversaciones/visitante/${id}`,
    BY_AGENTE: (id) => `conversaciones/agente/${id}`,
    BY_MONGODB: (id) => `conversaciones/mongodb/${id}`,
    FINALIZAR: (id) => `conversaciones/${id}/finalizar`,
    DERIVAR: (id, nuevoId) => `conversaciones/${id}/derivar/${nuevoId}`,
    MENSAJES: (id) => `conversaciones/${id}/mensajes`,
  },

  CONVERSACIONES_MONGO: {
    BASE: 'conversations/',  // ✅ SIN barra inicial
    BY_SESSION_ID: (sessionId) => `conversations/${sessionId}`,
    
    // Mensajes
    ADD_MESSAGE: (sessionId) => `conversations/${sessionId}/messages`,
    GET_MESSAGES: (sessionId) => `conversations/${sessionId}/messages`,
    
    // Estadísticas
    STATS_OVERVIEW: 'conversations/stats/overview',
    STATS_AGENT: (idAgente) => `conversations/stats/agent/${idAgente}`,
    STATS_DAILY: 'conversations/stats/daily',
    
    // Gestión de estados
    FINALIZE: (sessionId) => `conversations/${sessionId}/finalize`,
    ESCALATE: (sessionId) => `conversations/${sessionId}/escalate`,
    RATING: (sessionId) => `conversations/${sessionId}/rating`,
    
    // Utilidades
    INACTIVE: 'conversations/inactive/list',
    OBTAIN_OR_CREATE: 'conversations/obtain-or-create',
    EXPORT_EXCEL: 'conversations/export/excel',
    EXPORT_WORD: 'conversations/export/word',
  },

  // Departamentos
  DEPARTAMENTOS: {
    BASE: 'departamentos/',  // ✅ SIN barra inicial
    BY_ID: (id) => `departamentos/${id}`,
    ESTADISTICAS: 'departamentos/estadisticas',
    BUSCAR: 'departamentos/buscar',
    BY_CODIGO: (codigo) => `departamentos/codigo/${codigo}`,
    ESTADISTICAS_BY_ID: (id) => `departamentos/${id}/estadisticas`,
    ASIGNAR_JEFE: (id, idJefe) => `departamentos/${id}/jefe/${idJefe}`,
    RESTAURAR: (id) => `departamentos/${id}/restaurar`,
    REGENERAR_OLLAMA: (id) => `departamentos/${id}/ollama/regenerar`,
    CONSULTAR_OLLAMA: 'departamentos/ollama/consultar',
  },

  // Categorías
  CATEGORIAS: {
    BASE: 'categorias/',  // ✅ SIN barra inicial
    BY_ID: (id) => `categorias/${id}`,
    BY_AGENTE: (id) => `categorias/agente/${id}`,
  },

  // Departamento-Agente
  DEPARTAMENTO_AGENTE: {
    BASE: 'departamento-agente/',  // ✅ SIN barra inicial
    BY_ID: (id) => `departamento-agente/${id}`,
    BY_DEPARTAMENTO: (id) => `departamento-agente/departamento/${id}`,
    BY_AGENTE: (id) => `departamento-agente/agente/${id}`,
  },

  // Métricas Contenidos
  METRICAS_CONTENIDOS: {
    BASE: 'metricas/contenidos/',  // ✅ SIN barra inicial
    BY_ID: (id) => `metricas/contenidos/${id}`,
    TOP_MAS_USADOS: 'metricas/contenidos/top/mas-usados',
  },

  // Métricas Agentes
  METRICAS_AGENTES: {
    BASE: 'metricas/agentes/',  // ✅ SIN barra inicial
    BY_ID: (id) => `metricas/agentes/${id}`,
    RESUMEN: (id) => `metricas/agentes/${id}/resumen`,
  },

  // Roles
  ROLES: {
    BASE: 'roles/',  // ✅ SIN barra inicial
    BY_ID: (id) => `/roles/${id}`,
    ESTADISTICAS: '/roles/estadisticas',
  },

  // Contenidos
  CONTENIDOS: {
    BASE: 'contenidos/',  // ✅ SIN barra inicial
    BY_ID: (id) => `contenidos/${id}/`,
    BY_AGENTE: (id) => `contenidos/agente/${id}/`,
    PUBLICAR: (id) => `contenidos/${id}/publicar/`,
  },

  // Usuarios
  USUARIOS: {
    BASE: 'usuarios/',  // ✅ SIN barra inicial
    BY_ID: (id) => `usuarios/${id}`,
    ESTADISTICAS: 'usuarios/estadisticas',
    LOGIN: 'usuarios/login',
    CAMBIAR_PASSWORD: (id) => `usuarios/${id}/cambiar-password`,
    DESBLOQUEAR: (id) => `usuarios/${id}/desbloquear`,
  },

  // Visitantes Anónimos
  VISITANTES: {
    BASE: 'visitantes/',  // ✅ SIN barra inicial
    BY_ID: (id) => `visitantes/${id}`,
    ESTADISTICAS: 'visitantes/estadisticas',
    ACTIVOS: 'visitantes/activos',
    BY_SESION: (identificadorSesion) => `visitantes/sesion/${identificadorSesion}`,
    ESTADISTICAS_BY_ID: (id) => `visitantes/${id}/estadisticas`,
    ACTIVIDAD: (id) => `visitantes/${id}/actividad`,
    NUEVA_CONVERSACION: (id) => `visitantes/${id}/nueva-conversacion`,
    MENSAJES: (id) => `visitantes/${id}/mensajes`,
  },

  CEDULAS: {
    BASE: 'cedulas/',  // ✅ SIN barra inicial
    BY_CEDULA: (cedula) => `cedulas/${cedula}`,
  },

  // Usuario-Agente
  USUARIO_AGENTE: {
    BASE: 'usuario-agente/',  // ✅ CON barra final (para consistencia con otros endpoints)
    BY_ID: (id) => `usuario-agente/${id}`,
    BY_USUARIO: (idUsuario) => `usuario-agente/usuario/${idUsuario}`,
    BY_AGENTE: (idAgente) => `usuario-agente/agente/${idAgente}`,
    OBTENER_POR_USUARIO_Y_AGENTE: (idUsuario, idAgente) => `usuario-agente/usuario/${idUsuario}/agente/${idAgente}`,
  },

  // Escalamiento a Humanos
  ESCALAMIENTO: {
    BASE: 'escalamiento/',  // ✅ SIN barra inicial

    // Conversaciones
    CONVERSACIONES_ESCALADAS: 'escalamiento/conversaciones-escaladas',
    MIS_CONVERSACIONES: 'escalamiento/mis-conversaciones',
    CONVERSACION_DETALLE: (sessionId) => `escalamiento/conversacion/${encodeURIComponent(sessionId)}`,

    // Acciones
    TOMAR_CONVERSACION: (sessionId) => `escalamiento/conversacion/${encodeURIComponent(sessionId)}/tomar`,
    RESPONDER: (sessionId) => `escalamiento/conversacion/${encodeURIComponent(sessionId)}/responder`,
    TRANSFERIR_CONVERSACION: (sessionId) => `escalamiento/conversacion/${encodeURIComponent(sessionId)}/transferir`,
    RESOLVER: (sessionId) => `escalamiento/conversacion/${encodeURIComponent(sessionId)}/resolver`,

    // Estadísticas
    ESTADISTICAS: 'escalamiento/estadisticas',
    MIS_ESTADISTICAS: 'escalamiento/mis-estadisticas',

    // Notificaciones
    MIS_NOTIFICACIONES: 'escalamiento/mis-notificaciones',
    MARCAR_LEIDA: (idNotificacion) => `escalamiento/notificacion/${idNotificacion}/marcar-leida`,
    MARCAR_TODAS_LEIDAS: 'escalamiento/notificaciones/marcar-todas-leidas',

    // Utilidades
    FUNCIONARIOS_DISPONIBLES: 'escalamiento/funcionarios-disponibles',
    
    // Disponibilidad de Funcionarios
    CAMBIAR_DISPONIBILIDAD: (idUsuario) => `escalamiento/funcionario/${idUsuario}/cambiar-disponibilidad`,
    ESTADO_DISPONIBILIDAD: (idUsuario) => `escalamiento/funcionario/${idUsuario}/estado-disponibilidad`,
    FUNCIONARIOS_DISPONIBLES_AHORA: 'escalamiento/funcionarios/disponibles-ahora',
  },

  // Usuario-Roles
  USUARIO_ROLES: {
    BASE: 'usuario-roles/',  // ✅ SIN barra inicial
    BY_ID: (id) => `usuario-roles/${id}`,
    ESTADISTICAS: 'usuario-roles/estadisticas',

    // Endpoints de usuario
    ROLES_USUARIO: (id_usuario) => `usuario-roles/usuario/${id_usuario}/roles`,
    ESTADISTICAS_USUARIO: (id_usuario) => `usuario-roles/usuario/${id_usuario}/estadisticas`,
    ASIGNAR_ROL_USUARIO: (id_usuario) => `usuario-roles/usuario/${id_usuario}/asignar-rol`,
    ASIGNAR_MULTIPLES_ROLES: (id_usuario) => `usuario-roles/usuario/${id_usuario}/asignar-multiples-roles`,
    REVOCAR_ROL: (id_usuario, id_rol) => `usuario-roles/usuario/${id_usuario}/revocar-rol/${id_rol}`,
    REVOCAR_TODOS_ROLES: (id_usuario) => `usuario-roles/usuario/${id_usuario}/revocar-todos-roles`,

    // Endpoints de rol
    USUARIOS_CON_ROL: (id_rol) => `usuario-roles/rol/${id_rol}/usuarios`,
    ESTADISTICAS_ROL: (id_rol) => `usuario-roles/rol/${id_rol}/estadisticas`,

    // Verificación y mantenimiento
    VERIFICAR_ROL: (id_usuario, id_rol) => `usuario-roles/verificar/usuario/${id_usuario}/tiene-rol/${id_rol}`,
    PROCESAR_EXPIRACIONES: 'usuario-roles/procesar-expiraciones',
  },
};

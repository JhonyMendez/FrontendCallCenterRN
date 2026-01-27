// src/utils/dateFilterUtils.js

/**
 * Obtener rango de fechas según el filtro activo
 * @param {string} filtro - 'hoy', 'semana', 'mes', 'año'
 * @returns {Object} { fecha_inicio: string (ISO), fecha_fin: string (ISO) }
 */
export const obtenerRangoFechas = (filtro) => {
  const ahora = new Date();
  const fechaFin = ahora.toISOString();
  let fechaInicio;

  switch (filtro) {
    case 'hoy':
      // Desde las 00:00:00 de hoy
      const hoy = new Date(ahora);
      hoy.setHours(0, 0, 0, 0);
      fechaInicio = hoy.toISOString();
      break;

    case 'semana':
      // Últimos 7 días
      const semanaAtras = new Date(ahora);
      semanaAtras.setDate(ahora.getDate() - 7);
      fechaInicio = semanaAtras.toISOString();
      break;

    case 'mes':
      // Último mes (30 días)
      const mesAtras = new Date(ahora);
      mesAtras.setDate(ahora.getDate() - 30);
      fechaInicio = mesAtras.toISOString();
      break;

    case 'año':
      // Último año (365 días)
      const añoAtras = new Date(ahora);
      añoAtras.setFullYear(ahora.getFullYear() - 1);
      fechaInicio = añoAtras.toISOString();
      break;

    default:
      // Por defecto: últimos 7 días
      const defaultAtras = new Date(ahora);
      defaultAtras.setDate(ahora.getDate() - 7);
      fechaInicio = defaultAtras.toISOString();
  }

  return {
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin
  };
};

/**
 * Formatear fecha para mostrar en UI
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatearFechaUI = (isoDate) => {
  if (!isoDate) return '';
  
  const fecha = new Date(isoDate);
  const opciones = { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return fecha.toLocaleDateString('es-ES', opciones);
};

/**
 * Obtener descripción del filtro activo
 * @param {string} filtro - 'hoy', 'semana', 'mes', 'año'
 * @returns {string} Descripción legible
 */
export const obtenerDescripcionFiltro = (filtro) => {
  const descripciones = {
    hoy: 'Hoy',
    semana: 'Últimos 7 días',
    mes: 'Últimos 30 días',
    año: 'Último año'
  };
  
  return descripciones[filtro] || 'Período personalizado';
};

/**
 * Calcular días transcurridos entre dos fechas
 * @param {string} fechaInicio - Fecha inicio ISO
 * @param {string} fechaFin - Fecha fin ISO
 * @returns {number} Número de días
 */
export const calcularDiasTranscurridos = (fechaInicio, fechaFin) => {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diffTime = Math.abs(fin - inicio);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Obtener array de fechas para gráficos según el filtro
 * @param {string} filtro - 'hoy', 'semana', 'mes', 'año'
 * @returns {Array} Array de fechas para el eje X
 */
export const generarEjeXFechas = (filtro) => {
  const ahora = new Date();
  const fechas = [];

  switch (filtro) {
    case 'hoy':
      // Últimas 24 horas (cada 2 horas)
      for (let i = 24; i >= 0; i -= 2) {
        const hora = new Date(ahora);
        hora.setHours(ahora.getHours() - i);
        fechas.push({
          fecha: hora.toISOString(),
          label: `${hora.getHours()}:00`
        });
      }
      break;

    case 'semana':
      // Últimos 7 días
      for (let i = 6; i >= 0; i--) {
        const dia = new Date(ahora);
        dia.setDate(ahora.getDate() - i);
        fechas.push({
          fecha: dia.toISOString(),
          label: dia.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })
        });
      }
      break;

    case 'mes':
      // Últimas 4 semanas
      for (let i = 4; i >= 0; i--) {
        const semana = new Date(ahora);
        semana.setDate(ahora.getDate() - (i * 7));
        fechas.push({
          fecha: semana.toISOString(),
          label: `Sem ${5 - i}`
        });
      }
      break;

    case 'año':
      // Últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const mes = new Date(ahora);
        mes.setMonth(ahora.getMonth() - i);
        fechas.push({
          fecha: mes.toISOString(),
          label: mes.toLocaleDateString('es-ES', { month: 'short' })
        });
      }
      break;

    default:
      // Por defecto: últimos 7 días
      for (let i = 6; i >= 0; i--) {
        const dia = new Date(ahora);
        dia.setDate(ahora.getDate() - i);
        fechas.push({
          fecha: dia.toISOString(),
          label: dia.toLocaleDateString('es-ES', { weekday: 'short' })
        });
      }
  }

  return fechas;
};

/**
 * Agrupar datos por período según el filtro
 * @param {Array} datos - Array de datos con timestamp
 * @param {string} filtro - 'hoy', 'semana', 'mes', 'año'
 * @returns {Object} Datos agrupados
 */
export const agruparDatosPorPeriodo = (datos, filtro) => {
  if (!datos || datos.length === 0) return {};

  const agrupado = {};

  datos.forEach(item => {
    const fecha = new Date(item.created_at || item.timestamp || item.fecha);
    let clave;

    switch (filtro) {
      case 'hoy':
        // Agrupar por hora
        clave = `${fecha.getHours()}:00`;
        break;

      case 'semana':
        // Agrupar por día
        clave = fecha.toLocaleDateString('es-ES', { 
          weekday: 'short', 
          day: 'numeric' 
        });
        break;

      case 'mes':
        // Agrupar por semana
        const semana = Math.floor(fecha.getDate() / 7) + 1;
        clave = `Semana ${semana}`;
        break;

      case 'año':
        // Agrupar por mes
        clave = fecha.toLocaleDateString('es-ES', { month: 'short' });
        break;

      default:
        clave = fecha.toLocaleDateString('es-ES');
    }

    if (!agrupado[clave]) {
      agrupado[clave] = [];
    }
    agrupado[clave].push(item);
  });

  return agrupado;
};

/**
 * Validar si una fecha está dentro del rango del filtro
 * @param {string} fecha - Fecha a validar (ISO)
 * @param {string} filtro - 'hoy', 'semana', 'mes', 'año'
 * @returns {boolean} True si está en el rango
 */
export const estaEnRangoFiltro = (fecha, filtro) => {
  const rango = obtenerRangoFechas(filtro);
  const fechaValidar = new Date(fecha);
  const fechaInicio = new Date(rango.fecha_inicio);
  const fechaFin = new Date(rango.fecha_fin);

  return fechaValidar >= fechaInicio && fechaValidar <= fechaFin;
};

export default {
  obtenerRangoFechas,
  formatearFechaUI,
  obtenerDescripcionFiltro,
  calcularDiasTranscurridos,
  generarEjeXFechas,
  agruparDatosPorPeriodo,
  estaEnRangoFiltro
};
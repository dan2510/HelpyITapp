export interface EtiquetaDetalle {
  id: number;
  nombre: string;
  descripcion: string;
}

// Modelo para especialidad en el detalle (REQUERIMIENTO: Lista de especialidades)
export interface EspecialidadDetalle {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

// Modelo para SLA completo (REQUERIMIENTO ESPECÍFICO: SLA tiempo máximo respuesta y resolución)
export interface SlaDetalle {
  id: number;
  nombre: string;
  descripcion: string;
  maxminutosrespuesta: number;      // REQUERIMIENTO: tiempo máximo de respuesta
  maxminutosresolucion: number;     // REQUERIMIENTO: tiempo máximo de resolución
  tiempoRespuestaHoras: number;     // Calculado para mostrar en horas
  tiempoResolucionHoras: number;    // Calculado para mostrar en horas
  activo: boolean;
  vigentedesde: Date;
  vigentehasta: Date;
}

// Modelo para estadísticas de la categoría
export interface EstadisticasCategoria {
  ticketsTotal: number;
  ticketsAbiertos: number;
  ticketsResueltos: number;
  ticketsCriticos: number;
  porcentajeResolucion: number;
}

// Modelo COMPLETO del detalle de la categoría
export interface CategoriaDetalle {
  // Información básica de la categoría
  id: number;
  nombre: string;                    // REQUERIMIENTO: Nombre de la categoría
  descripcion: string;
  idsla: number;
  activo: boolean;
  
  // REQUERIMIENTO ESPECÍFICO: SLA con tiempo máximo de respuesta y resolución
  sla: SlaDetalle;
  
  // REQUERIMIENTO ESPECÍFICO: Lista de etiquetas
  etiquetas: EtiquetaDetalle[];
  
  // REQUERIMIENTO ESPECÍFICO: Lista de especialidades  
  especialidades: EspecialidadDetalle[];
  
  // Estadísticas adicionales (valor agregado)
  estadisticas: EstadisticasCategoria;
}

// Modelo para la respuesta del backend del detalle
export interface CategoriaDetailResponse {
  success: boolean;
  data: {
    categoria: CategoriaDetalle;
  };
}
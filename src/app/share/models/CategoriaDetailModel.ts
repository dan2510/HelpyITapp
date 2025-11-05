export interface EtiquetaDetalle {
  id: number;
  nombre: string;
  descripcion: string;
}

// Modelo para especialidad en el detalle
export interface EspecialidadDetalle {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

// Modelo para SLA 
export interface SlaDetalle {
  id: number;
  nombre: string;
  descripcion: string;
  maxminutosrespuesta: number;      
  maxminutosresolucion: number;    
  tiempoRespuestaHoras: number;     
  tiempoResolucionHoras: number;    
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
  nombre: string;                    
  descripcion: string;
  idsla: number;
  activo: boolean;
  
  //SLA con tiempo máximo de respuesta y resolución
  sla: SlaDetalle;
  
  //  Lista de etiquetas
  etiquetas: EtiquetaDetalle[];
  
  //  Lista de especialidades  
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
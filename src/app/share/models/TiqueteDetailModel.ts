import { Prioridad, EstadoTiquete } from './EnumsModel';

// Modelo para categoría en el detalle
export interface CategoriaDetalleTiquete {
  id: number;
  nombre: string;
  descripcion: string;
}

// Modelo para usuario en el detalle
export interface UsuarioDetalleTiquete {
  id: number;
  nombrecompleto: string;
  correo: string;
  telefono?: string;
}

// Modelo para SLA del tiquete
export interface SlaDetalleTiquete {
  nombre: string;
  descripcion: string;
  maxminutosrespuesta: number;
  maxminutosresolucion: number;
  tiempoRespuestaHoras: number;
  tiempoResolucionHoras: number;
}

// Modelo para imagen en el historial
export interface ImagenHistorial {
  id: number;
  rutaarchivo: string;
  subidoen: Date;
  subidopor: UsuarioDetalleTiquete;
}

// Modelo para historial de estados
export interface HistorialEstado {
  id: number;
  estadoanterior: EstadoTiquete;
  estadonuevo: EstadoTiquete;
  observacion?: string;
  cambiadoen: Date;
  cambiadopor: UsuarioDetalleTiquete;
  imagenes: ImagenHistorial[];
}

// Modelo para valoración
export interface ValoracionTiquete {
  id: number;
  calificacion: number;
  comentario?: string;
  creadaen: Date;
  cliente: UsuarioDetalleTiquete;
}

// Modelo para información de cumplimiento SLA
export interface CumplimientoSLA {
  cumplioslarespuesta: boolean | null;
  cumplioslaresolucion: boolean | null;
  diasResolucion?: number;
  horasRespuesta?: number;
  horasResolucion?: number;
}

// Modelo COMPLETO del detalle del tiquete
export interface TiqueteDetalle {
  // Información básica del tiquete
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  estado: EstadoTiquete;
  
  // Fechas
  creadoen: Date;
  primerarespuestaen?: Date;
  resueltoen?: Date;
  cerradoen?: Date;
  vencerespuesta: Date;
  venceresolucion: Date;
  
  // Relaciones
  categoria: CategoriaDetalleTiquete;
  cliente: UsuarioDetalleTiquete;
  tecnicoActual?: UsuarioDetalleTiquete;
  
  // SLA y cumplimiento
  sla: SlaDetalleTiquete;
  cumplimiento: CumplimientoSLA;
  
  // Historial y valoraciones
  historiales: HistorialEstado[];
  valoraciones: ValoracionTiquete[];
}

// Modelo para la respuesta del backend del detalle
export interface TiqueteDetailResponse {
  success: boolean;
  data: {
    tiquete: TiqueteDetalle;
  };
}
import { Prioridad, EstadoTiquete } from './EnumsModel';

// Modelo para categoría en asignación
export interface CategoriaAsignacion {
  id: number;
  nombre: string;
  politicaSla: {
    nombre: string;
    maxminutosrespuesta: number;
    maxminutosresolucion: number;
  };
}

// Modelo para cliente en asignación
export interface ClienteAsignacion {
  id: number;
  nombrecompleto: string;
  correo: string;
}

// Modelo para SLA de la asignación
export interface SLAAsignacion {
  nombre: string;
  venceresolucion: Date;
  horasRestantes: number;
  porcentajeUrgencia: number;
  estadoSLA: 'OK' | 'ADVERTENCIA' | 'CRITICO';
}

// Modelo para una asignación individual
export interface AsignacionItem {
  id: number;
  titulo: string;
  descripcion: string;
  estado: EstadoTiquete;
  prioridad: Prioridad;
  creadoen: Date;
  categoria: CategoriaAsignacion;
  cliente: ClienteAsignacion;
  sla: SLAAsignacion;
}

// Modelo para técnico
export interface TecnicoAsignacion {
  id: number;
  nombrecompleto: string;
}

// Modelo para rango de semana
export interface SemanaRango {
  inicio: Date;
  fin: Date;
}

// Modelo para la respuesta del backend
export interface AsignacionesResponse {
  success: boolean;
  data: {
    tecnico: TecnicoAsignacion;
    semana: SemanaRango;
    asignaciones: AsignacionItem[];
    total: number;
  };
}
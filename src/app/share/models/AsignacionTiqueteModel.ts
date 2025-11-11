// src/app/share/models/AsignacionTiqueteModel.ts
import { Prioridad, EstadoTiquete, MetodoAsignacion } from './EnumsModel';

export interface AsignacionTiquete {
  idasignacion: number;
  idtiquete: number;
  idtecnico: number;
  idregla?: number;
  metodo: MetodoAsignacion;
  justificacion?: string;
  puntajeasignacion?: number;
  asignadopor: number;
  asignadoen: Date;
  
  // Relaciones sin tipado estricto
  tiquete?: any;
  tecnico?: any;
  regla?: any;
}

// Respuesta del endpoint de asignaciones
export interface AsignacionesResponse {
  success: boolean;
  data: {
    tecnico: any;
    semana: any;
    asignaciones: any[];
    total: number;
  };
}
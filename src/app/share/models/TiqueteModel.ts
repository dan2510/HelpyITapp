// src/app/share/models/TiqueteModel.ts
import { Prioridad, EstadoTiquete } from './EnumsModel';

export interface TiqueteModel {
  // Campos básicos
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  estado: EstadoTiquete;
  idcategoria: number;
  idcliente: number;
  idtecnicoactual?: number;
  
  // Fechas
  creadoen: Date;
  primerarespuestaen?: Date;
  resueltoen?: Date;
  cerradoen?: Date;
  vencerespuesta: Date;
  venceresolucion: Date;
  cumplioslarespuesta?: boolean;
  cumplioslaresolucion?: boolean;
  
  // Relaciones sin tipado estricto 
  cliente?: any;
  tecnicoActual?: any;
  asignaciones?: any[];
  historiales?: any[];
  notificaciones?: any[];
  valoraciones?: any[];
  sla?: any;
  cumplimiento?: any;
}
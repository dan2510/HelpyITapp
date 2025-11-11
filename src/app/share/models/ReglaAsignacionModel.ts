import { AsignacionTiquete } from './AsignacionTiqueteModel';

export interface ReglaAsignacion {
  id: number;
  nombre: string;
  descripcion: string;
  activa: boolean;
  pesoprioridad: number;
  pesoslarestante: number;
  pesocargaactual: number;
  pesoexperiencia: number;
  prioridadejecucion: number;
  creadoen: Date;
  actualizadoen: Date;
  eliminadoen?: Date;
  
  // Relaciones opcionales
  asignaciones?: AsignacionTiquete[];
}
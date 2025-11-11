import { Prioridad, EstadoTiquete } from './EnumsModel';
import { CategoriaModel } from './CategoriaModel';
import { UsuarioModel } from './UsuarioModel';
import { AsignacionTiquete } from './AsignacionTiqueteModel';
import { HistorialTiquete } from './HistorialTiqueteModel';
import { Notificacion } from './NotificacionModel';
import { ValoracionServicio } from './ValoracionServicioModel';
import { PoliticaSlaModel } from './PoliticaSlaModel';

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
  
  // Relaciones opcionales (según lo que el backend incluya)
  categoria?: CategoriaModel;
  cliente?: UsuarioModel;
  tecnicoActual?: UsuarioModel;
  asignaciones?: AsignacionTiquete[];
  historiales?: HistorialTiquete[];
  notificaciones?: Notificacion[];
  valoraciones?: ValoracionServicio[];
  
  // Campos calculados (opcionales, solo en detalle)
  sla?: SlaInfo;
  cumplimiento?: CumplimientoSLA;
}

// Interfaces auxiliares para campos calculados
export interface SlaInfo {
  nombre: string;
  descripcion: string;
  maxminutosrespuesta: number;
  maxminutosresolucion: number;
  tiempoRespuestaHoras: number;
  tiempoResolucionHoras: number;
}

export interface CumplimientoSLA {
  cumplioslarespuesta: boolean | null;
  cumplioslaresolucion: boolean | null;
  diasResolucion?: number;
  horasRespuesta?: number;
  horasResolucion?: number;
}
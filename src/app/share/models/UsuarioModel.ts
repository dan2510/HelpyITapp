import { Disponibilidad } from './EnumsModel';
import { RolModel } from './RolModel';
import { UsuarioEspecialidad } from './UsuarioEspecialidad';
import { TiqueteModel } from './TiqueteModel';
import { AsignacionTiquete } from './AsignacionTiqueteModel';
import { HistorialTiquete } from './HistorialTiqueteModel';
import { ImagenTiquete } from './ImagenTiqueteModel';
import { Notificacion } from './NotificacionModel';
import { ValoracionServicio } from './ValoracionServicioModel';

export interface UsuarioModel {
  // Campos básicos
  id: number;
  correo: string;
  contrasenahash?: string;
  nombrecompleto: string;
  telefono?: string;
  idrol: number;
  activo: boolean;
  ultimoiniciosesion?: Date;
  creadoen: Date;
  actualizadoen: Date;
  eliminadoen?: Date;
  
  // Campos de disponibilidad (para técnicos)
  disponibilidad: Disponibilidad;
  cargaactual: number;
  maxticketsimultaneos: number;
  
  // Relaciones opcionales
  rol?: RolModel;
  especialidades?: UsuarioEspecialidad[];
  tiquetesComoCliente?: TiqueteModel[];
  tiquetesComoTecnico?: TiqueteModel[];
  asignaciones?: AsignacionTiquete[];
  historialesCreados?: HistorialTiquete[];
  imagenesSubidas?: ImagenTiquete[];
  notificacionesDestino?: Notificacion[];
  notificacionesOrigen?: Notificacion[];
  valoracionesCliente?: ValoracionServicio[];
  
  // Campos calculados (opcionales, solo en detalle)
  ticketsActivos?: TicketActivo[];
  estadisticas?: EstadisticasUsuario;
}

// Interfaces auxiliares para campos calculados (solo estas son permitidas)
export interface TicketActivo {
  id: number;
  titulo: string;
  estado: string;
  prioridad: string;
}

export interface EstadisticasUsuario {
  ticketsTotal: number;
  ticketsResueltos: number;
  ticketsEnProgreso: number;
  porcentajeEfectividad: number;
}
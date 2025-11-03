import { Disponibilidad, NivelExperiencia } from './EnumsModel';
import { Rol } from './RolModel';

// Modelo para especialidad en el detalle
export interface EspecialidadDetalle {
  id: number;
  nombre: string;
  descripcion: string;
  nivelexperiencia: NivelExperiencia;
  asignadoen: Date;
}

// Modelo para ticket activo
export interface TicketActivo {
  id: number;
  titulo: string;
  estado: string;
  prioridad: string;
}

// Modelo para estadísticas del técnico
export interface EstadisticasTecnico {
  ticketsTotal: number;
  ticketsResueltos: number;
  ticketsEnProgreso: number;
  porcentajeEfectividad: number;
}

// Modelo completo del detalle del técnico
export interface TecnicoDetalle {
  // Información personal del técnico
  id: number;
  correo: string;
  nombrecompleto: string;
  telefono?: string;
  idrol: number;
  activo: boolean;
  ultimoiniciosesion?: Date;
  creadoen: Date;
  actualizadoen: Date;
  
  // Carga de trabajo y disponibilidad
  disponibilidad: Disponibilidad;
  cargaactual: number;
  maxticketsimultaneos: number;
  
  // Información del rol
  rol: Rol;
  
  // Lista de especialidades
  especialidades: EspecialidadDetalle[];
  
  // Tickets activos asignados
  ticketsActivos: TicketActivo[];
  
  // Estadísticas del técnico
  estadisticas: EstadisticasTecnico;
}

// Modelo para respuesta del detalle
export interface TecnicoDetailResponse {
  success: boolean;
  data: {
    tecnico: TecnicoDetalle;
  };
}
import { RoleNombre, Disponibilidad } from './EnumsModel';
import { Rol } from './RolModel';

export interface Usuario {
  id: number;
  correo: string;
  nombrecompleto: string;
  telefono: string | null;
  idrol: number;
  activo: boolean;
  ultimoiniciosesion: Date | null;
  creadoen: Date;
  disponibilidad: Disponibilidad;
  cargaactual: number;
  maxticketsimultaneos: number;
  
  // Relación con rol
  rol?: Rol;
  }
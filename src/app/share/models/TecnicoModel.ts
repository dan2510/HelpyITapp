
import { Disponibilidad } from './EnumsModel';
import { Rol } from './RolModel';
import { UsuarioEspecialidad } from './UsuarioEspecialidad';

export interface TecnicoModel {
  id: number;
  correo: string;
  nombrecompleto: string;
  telefono?: string;
  idrol: number;
  activo: boolean;
  ultimoiniciosesion?: Date;
  creadoen: Date;
  actualizadoen: Date;
  disponibilidad: Disponibilidad;
  cargaactual: number;
  maxticketsimultaneos: number;
  
  // Relaciones
  rol: Rol;
  especialidades: UsuarioEspecialidad[];
}
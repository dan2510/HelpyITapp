import { NivelExperiencia } from './EnumsModel';
import { UsuarioModel } from './UsuarioModel';
import { EspecialidadModel } from './EspecialidadModel';

export interface UsuarioEspecialidad {
  idusuario: number;
  idespecialidad: number;
  nivelexperiencia: NivelExperiencia;
  asignadoen: Date;
  
  // Relaciones opcionales
  usuario?: UsuarioModel;
  especialidad?: EspecialidadModel;
}
import { NivelExperiencia } from "./EnumsModel";
import { Especialidad } from "./EspecialidadModel";

export interface UsuarioEspecialidad {
  idespecialidad: number;
  nivelexperiencia: NivelExperiencia;
  asignadoen: Date;
  especialidad: Especialidad;
}
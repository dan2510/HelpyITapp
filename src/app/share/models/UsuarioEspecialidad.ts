import { NivelExperiencia } from "./EnumsModel";
import { EspecialidadModel } from "./EspecialidadModel";

export interface UsuarioEspecialidad {
  idespecialidad: number;
  nivelexperiencia: NivelExperiencia;
  asignadoen: Date;
  especialidad: EspecialidadModel;
}
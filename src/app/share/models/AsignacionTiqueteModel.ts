import { MetodoAsignacion } from './EnumsModel';
import { TiqueteModel } from './TiqueteModel';
import { UsuarioModel } from './UsuarioModel';
import { ReglaAsignacion } from './ReglaAsignacionModel';

export interface AsignacionTiquete {
  idasignacion: number;
  idtiquete: number;
  idtecnico: number;
  idregla?: number;
  metodo: MetodoAsignacion;
  justificacion?: string;
  puntajeasignacion?: number;
  asignadopor: number;
  asignadoen: Date;
  
  // Relaciones opcionales
  tiquete?: TiqueteModel;
  tecnico?: UsuarioModel;
  regla?: ReglaAsignacion;
}
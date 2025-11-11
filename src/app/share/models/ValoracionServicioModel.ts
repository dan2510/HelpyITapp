import { TiqueteModel } from './TiqueteModel';
import { UsuarioModel } from './UsuarioModel';

export interface ValoracionServicio {
  id: number;
  idtiquete: number;
  idcliente: number;
  calificacion: number;
  comentario?: string;
  creadaen: Date;
  
  // Relaciones opcionales
  tiquete?: TiqueteModel;
  cliente?: UsuarioModel;
}
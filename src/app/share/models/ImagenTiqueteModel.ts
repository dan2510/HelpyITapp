import { HistorialTiquete } from './HistorialTiqueteModel';
import { UsuarioModel } from './UsuarioModel';

export interface ImagenTiquete {
  id: number;
  idhistorial: number;
  rutaarchivo: string;
  subidopor: number;
  subidoen: Date;
  
  // Relaciones opcionales
  historial?: HistorialTiquete;
  usuario?: UsuarioModel;
}
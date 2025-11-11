import { EstadoTiquete } from './EnumsModel';
import { TiqueteModel } from './TiqueteModel';
import { UsuarioModel } from './UsuarioModel';
import { ImagenTiquete } from './ImagenTiqueteModel';

export interface HistorialTiquete {
  id: number;
  idtiquete: number;
  estadoanterior: EstadoTiquete;
  estadonuevo: EstadoTiquete;
  observacion?: string;
  cambiadopor: number;
  cambiadoen: Date;
  
  // Relaciones opcionales
  tiquete?: TiqueteModel;
  usuarioCambio?: UsuarioModel;
  imagenes?: ImagenTiquete[];
}
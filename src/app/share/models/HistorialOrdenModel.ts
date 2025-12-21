import { EstadoOrden } from './EnumsModel';
import { OrdenModel } from './OrdenModel';
import { UsuarioModel } from './UsuarioModel';
import { ImagenOrden } from './ImagenOrdenModel';

export interface HistorialOrden {
  id: number;
  idorden: number;
  estadoanterior?: EstadoOrden;
  estadonuevo?: EstadoOrden;
  observacion?: string;
  tipo: string;
  cambiadopor: number;
  cambiadoen: Date;
  
  // Relaciones opcionales
  orden?: OrdenModel;
  usuarioCambio?: UsuarioModel;
  imagenes?: ImagenOrden[];
}


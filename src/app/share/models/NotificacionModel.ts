import { TipoNotificacion, EstadoNotificacion } from './EnumsModel';
import { UsuarioModel } from './UsuarioModel';
import { TiqueteModel } from './TiqueteModel';

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  idusuariodestino: number;
  idusuarioorigen?: number;
  idtiquete?: number;
  titulo: string;
  contenido: string;
  estado: EstadoNotificacion;
  creadaen: Date;
  leidaen?: Date;
  
  // Relaciones opcionales
  usuarioDestino?: UsuarioModel;
  usuarioOrigen?: UsuarioModel;
  tiquete?: TiqueteModel;
}
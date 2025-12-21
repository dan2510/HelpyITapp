import { TipoNotificacion, EstadoNotificacion } from './EnumsModel';

export interface NotificacionModel {
  id: number;
  tipo: TipoNotificacion;
  idusuariodestino: number;
  idusuarioorigen?: number | null;
  idorden?: number | null;
  titulo: string;
  contenido: string;
  estado: EstadoNotificacion;
  creadaen: Date | string;
  leidaen?: Date | string | null;
  usuarioDestino?: {
    id: number;
    nombrecompleto: string;
    correo: string;
  };
  usuarioOrigen?: {
    id: number;
    nombrecompleto: string;
    correo: string;
  } | null;
  orden?: {
    id: number;
    numeropedido: string;
    estado: string;
  } | null;
}

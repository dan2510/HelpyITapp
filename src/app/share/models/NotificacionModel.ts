export interface NotificacionModel {
  id: number;
  tipo: TipoNotificacion;
  idusuariodestino: number;
  idusuarioorigen?: number | null;
  idtiquete?: number | null;
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
  tiquete?: {
    id: number;
    titulo: string;
    estado: string;
  } | null;
}

export enum TipoNotificacion {
  ASIGNACION = 'ASIGNACION',
  CAMBIO_ESTADO = 'CAMBIO_ESTADO',
  MENSAJE = 'MENSAJE',
  RECORDATORIO = 'RECORDATORIO',
  INICIO_SESION = 'INICIO_SESION'
}

export enum EstadoNotificacion {
  NO_LEIDA = 'NO_LEIDA',
  LEIDA = 'LEIDA'
}

export enum RoleNombre {
  ADMIN = 'ADMIN',
  TECNICO = 'TECNICO',
  CLIENTE = 'CLIENTE'
}

export enum Disponibilidad {
  DISPONIBLE = 'DISPONIBLE',
  OCUPADO = 'OCUPADO',
  AUSENTE = 'AUSENTE',
  INACTIVO = 'INACTIVO'
}

export enum NivelExperiencia {
  JUNIOR = 'JUNIOR',
  INTERMEDIO = 'INTERMEDIO',
  SENIOR = 'SENIOR',
  EXPERTO = 'EXPERTO'
}

export enum Prioridad {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA'
}

export enum EstadoTiquete {
  PENDIENTE = 'PENDIENTE',
  EN_PROGRESO = 'EN_PROGRESO',
  RESUELTO = 'RESUELTO',
  CERRADO = 'CERRADO',
  CANCELADO = 'CANCELADO',
  ASIGNADO = 'ASIGNADO'
}

export enum MetodoAsignacion {
  MANUAL = 'MANUAL',
  AUTOMATICO = 'AUTOMATICO',
  REGLA = 'REGLA'
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
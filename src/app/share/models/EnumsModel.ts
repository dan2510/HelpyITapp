export enum RoleNombre {
  ADMIN = 'ADMIN',
  TECNICO = 'TECNICO',
  CLIENTE = 'CLIENTE'
}

export enum Disponibilidad {
  DISPONIBLE = 'DISPONIBLE',
  OCUPADO = 'OCUPADO',
  AUSENTE = 'AUSENTE'
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
  ABIERTO = 'ABIERTO',
  EN_PROGRESO = 'EN_PROGRESO',
  PENDIENTE = 'PENDIENTE',
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
  RECORDATORIO = 'RECORDATORIO'
}

export enum EstadoNotificacion {
  NO_LEIDA = 'NO_LEIDA',
  LEIDA = 'LEIDA'
}
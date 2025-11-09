import { Prioridad, EstadoTiquete } from './EnumsModel';

// Modelo básico para tiquete
export interface TiqueteModel {
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  estado: EstadoTiquete;
  idcategoria: number;
  idcliente: number;
  idtecnicoactual?: number;
  creadoen: Date;
  primerarespuestaen?: Date;
  resueltoen?: Date;
  cerradoen?: Date;
  vencerespuesta: Date;
  venceresolucion: Date;
  cumplioslarespuesta?: boolean;
  cumplioslaresolucion?: boolean;
}
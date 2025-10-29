import { RoleNombre } from './EnumsModel';

export interface Rol {
  id: number;
  nombre: RoleNombre;
  descripcion: string;
}
import { RoleNombre } from './EnumsModel';
import { UsuarioModel } from './UsuarioModel';

export interface RolModel {
  id: number;
  nombre: RoleNombre;
  descripcion: string;
  
  // Relaciones opcionales
  usuarios?: UsuarioModel[];
}







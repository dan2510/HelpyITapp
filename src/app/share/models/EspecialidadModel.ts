import { UsuarioEspecialidad } from './UsuarioEspecialidad';
import { CategoriaEspecialidad } from './CategoriaEspecialidadModel';

export interface EspecialidadModel {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  
  // Relaciones opcionales (tablas intermedias many-to-many)
  usuarios?: UsuarioEspecialidad[];
  categorias?: CategoriaEspecialidad[];
}







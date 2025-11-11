import { CategoriaModel } from './CategoriaModel';
import { EspecialidadModel } from './EspecialidadModel';

export interface CategoriaEspecialidad {
  idcategoria: number;
  idespecialidad: number;
  
  // Relaciones opcionales
  categoria?: CategoriaModel;
  especialidad?: EspecialidadModel;
}
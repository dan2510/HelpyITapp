import { CategoriaEtiqueta } from './CategoriaEtiquetaModel';
import { CategoriaModel } from './CategoriaModel';

export interface EtiquetaModel {
  id: number;
  nombre: string;
  descripcion: string;
  
  // Relación directa a categoría (para formulario de tickets)
  categoria?: CategoriaModel;
  
  // Relaciones opcionales (tabla intermedia many-to-many)
  categorias?: CategoriaEtiqueta[];
}
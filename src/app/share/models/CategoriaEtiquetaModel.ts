import { CategoriaModel } from './CategoriaModel';
import { EtiquetaModel } from './EtiquetaModel';

export interface CategoriaEtiqueta {
  idcategoria: number;
  idetiqueta: number;
  
  // Relaciones opcionales
  categoria?: CategoriaModel;
  etiqueta?: EtiquetaModel;
}
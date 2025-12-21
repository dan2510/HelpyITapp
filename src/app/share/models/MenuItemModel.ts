import { CategoriaMenuModel } from './CategoriaMenuModel';
import { GrupoVarianteModel } from './GrupoVarianteModel';

export interface MenuItemModel {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  idcategoria: number;
  activo: boolean;
  disponible: boolean;
  imagen?: string;
  tiempoPreparacion?: number; // Tiempo estimado en minutos
  tieneVariantes: boolean;
  precioVariable: boolean;
  creadoen: Date;
  actualizadoen: Date;
  
  // Relaciones opcionales
  categoria?: CategoriaMenuModel;
  gruposVariantes?: GrupoVarianteModel[];
}


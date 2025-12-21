export interface CategoriaMenuModel {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  orden: number; // Para ordenar las categorías en el menú
  creadoen: Date;
  actualizadoen: Date;
  
  // Relaciones opcionales
  itemsMenu?: any[];
}


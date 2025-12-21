// src/app/share/models/CategoriaModel.ts

export interface CategoriaModel {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  orden: number;
  creadoen?: Date;
  actualizadoen?: Date;
  
  // Relaciones sin tipado estricto 
  itemsMenu?: any[];
}
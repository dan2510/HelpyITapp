import { CategoriaModel } from './CategoriaModel';

export interface PoliticaSlaModel {
  id: number;
  nombre: string;
  descripcion: string;
  maxminutosrespuesta: number;
  maxminutosresolucion: number;
  activo: boolean;
  vigentedesde: Date;
  vigentehasta: Date;
  creadoen: Date;
  actualizadoen: Date;
  
  // Relaciones opcionales
  categorias?: CategoriaModel[];
}
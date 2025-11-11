// src/app/share/models/CategoriaModel.ts
//import { PoliticaSlaModel } from './PoliticaSlaModel';

export interface CategoriaModel {
  id: number;
  nombre: string;
  descripcion: string;
  idsla: number;
  activo: boolean;
  
  // Relaciones sin tipado estricto 
  politicaSla?: any;
  sla?: any;
  etiquetas?: any[];
  especialidades?: any[];
  estadisticas?: any;
  tiquetes?: any[];
}
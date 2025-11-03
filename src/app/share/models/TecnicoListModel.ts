import { Disponibilidad } from './EnumsModel';

// Modelo para elementos del listado (máximo 3 campos según Avance 3)
export interface TecnicoListItem {
  id: number;
  nombrecompleto: string;
  disponibilidad: Disponibilidad;
  cargaactual: number;
}

// Modelo para respuesta del listado
export interface TecnicoListResponse {
  success: boolean;
  data: {
    tecnicos: TecnicoListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
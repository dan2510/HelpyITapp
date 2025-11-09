import { Prioridad, EstadoTiquete } from './EnumsModel';

// Modelo para categoría básica en el listado
export interface CategoriaBasica {
  nombre: string;
  descripcion: string;
}

// Modelo para cliente básico en el listado
export interface ClienteBasico {
  nombrecompleto: string;
  correo: string;
}

// Modelo para técnico básico en el listado
export interface TecnicoBasico {
  nombrecompleto: string;
  correo: string;
}

// Modelo para elementos del listado (máximo 4 campos según requerimiento)
export interface TiqueteListItem {
  id: number;
  titulo: string;
  estado: EstadoTiquete;
  prioridad: Prioridad;
  creadoen: Date;
  categoria: CategoriaBasica;
  cliente?: ClienteBasico;  // Solo visible para admin
  tecnicoActual?: TecnicoBasico; // Solo visible para admin y cliente
}

// Modelo para respuesta del listado
export interface TiqueteListResponse {
  success: boolean;
  data: {
    tiquetes: TiqueteListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
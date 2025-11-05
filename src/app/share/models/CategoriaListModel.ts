// Modelo para SLA básico en el listado
export interface SlaBasico {
  nombre: string;
  maxminutosrespuesta: number; // Para mostrar tiempo de respuesta
}

// Modelo para elementos del listado 
export interface CategoriaListItem {
  id: number;        
  nombre: string;         
  activo: boolean;             
  politicaSla: SlaBasico;     
}

// Modelo para la respuesta del backend del listado
export interface CategoriaListResponse {
  success: boolean;
  data: {
    categorias: CategoriaListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
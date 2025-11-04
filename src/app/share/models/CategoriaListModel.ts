// Modelo para SLA básico en el listado
export interface SlaBasico {
  nombre: string;
  maxminutosrespuesta: number; // Para mostrar tiempo de respuesta
}

// Modelo para elementos del listado 
export interface CategoriaListItem {
  id: number;                    // Campo 1: ID para navegación
  nombre: string;               // Campo 2: Nombre de la categoría
  activo: boolean;             // Campo 3: Estado activo/inactivo
  politicaSla: SlaBasico;      // Información adicional del SLA (no cuenta como campo extra)
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
import { PoliticaSlaModel } from './PoliticaSlaModel';
import { EtiquetaModel } from './EtiquetaModel';
import { EspecialidadModel } from './EspecialidadModel';
import { TiqueteModel } from './TiqueteModel';
import { CategoriaEspecialidad } from './CategoriaEspecialidadModel';
import { CategoriaEtiqueta } from './CategoriaEtiquetaModel';

export interface CategoriaModel {
  id: number;
  nombre: string;
  descripcion: string;
  idsla: number;
  activo: boolean;
  
  // Relaciones directas opcionales
  politicaSla?: PoliticaSlaModel;
  tiquetes?: TiqueteModel[];
  
  // Relaciones many-to-many (tablas intermedias)
  etiquetas?: CategoriaEtiqueta[];
  especialidades?: CategoriaEspecialidad[];
  
  // Campos calculados (opcionales, solo en detalle)
  estadisticas?: EstadisticasCategoria;
}

// Interface auxiliar para estadísticas calculadas
export interface EstadisticasCategoria {
  ticketsTotal: number;
  ticketsAbiertos: number;
  ticketsResueltos: number;
  ticketsCriticos: number;
  porcentajeResolucion: number;
}
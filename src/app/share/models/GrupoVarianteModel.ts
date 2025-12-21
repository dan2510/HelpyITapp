import { OpcionVarianteModel } from './OpcionVarianteModel';

export interface GrupoVarianteModel {
  id?: number;
  idmenuitem?: number;
  grupo_id?: string; // ID único del grupo (del backend)
  nombre: string;
  descripcion?: string;
  obligatorio: boolean;
  tipoSeleccion?: string; // "unica" o "multiple"
  tipo_seleccion?: string; // Del backend (snake_case)
  orden: number;
  definePrecioBase?: boolean;
  visibleSi?: string; // JSON string con condiciones
  creadoen?: Date;
  actualizadoen?: Date;
  
  // Relaciones opcionales
  opciones?: OpcionVarianteModel[];
}


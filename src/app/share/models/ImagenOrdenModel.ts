export interface ImagenOrden {
  id: number;
  idhistorial: number;
  rutaarchivo: string;
  subidopor: number;
  subidoen: Date;
}

// Alias para compatibilidad
export type ImagenOrdenModel = ImagenOrden;


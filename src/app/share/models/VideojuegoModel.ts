import { GeneroModel } from "./GeneroModel";
import { OrdenVideojuegoModel } from "./OrdenVideojuegoModel";
import { PlataformaVideojuegoModel } from "./PlataformaVideojuegoModel";


export interface VideojuegoModel {
    id: number;
    nombre: string;
    descripcion: string;
    publicar: boolean;
    precio: number; // Puede usarse number en lugar de Decimal
    imagen: string;
    createdAt: Date;
    updatedAt: Date;
    generos: GeneroModel[];
    ordenes: OrdenVideojuegoModel[];
    plataformas: PlataformaVideojuegoModel[];
  }
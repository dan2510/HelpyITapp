import { PlataformaVideojuegoModel } from "./PlataformaVideojuegoModel";


export interface PlataformaModel {
    id: number;
    nombre: string;
    updatedAt: Date;
    videojuegos: PlataformaVideojuegoModel[];
  }
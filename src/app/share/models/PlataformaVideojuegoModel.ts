import { PlataformaModel } from "./PlataformaModel";
import { VideojuegoModel } from "./VideojuegoModel";


export interface PlataformaVideojuegoModel {
    plataformaId: number;
    plataforma: PlataformaModel;
    videojuegoId: number;
    videojuego: VideojuegoModel;
    anno_lanzamiento: number;
    updatedAt: Date;
  }
import { OrdenModel } from "./OrdenModel";
import { VideojuegoModel } from "./VideojuegoModel";




export interface OrdenVideojuegoModel {
  ordenId: number;
  orden: OrdenModel;
  videojuegoId: number;
  videojuego: VideojuegoModel;
  cantidad: number;
  updatedAt: Date;
}
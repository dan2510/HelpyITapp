import { VideojuegoModel } from "./VideojuegoModel";



export interface GeneroModel {
  id: number;
  nombre: string;
  updatedAt: Date;
  videojuegos: VideojuegoModel[];
}
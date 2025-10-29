import { VideojuegoModel } from "./VideojuegoModel";


export interface ItemCartModel {

    producto: VideojuegoModel;
    cantidad: number;
    subtotal: number;
  }
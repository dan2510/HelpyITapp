import { OrdenVideojuegoModel } from "./OrdenVideojuegoModel";
import { UsuarioModel } from "./UsuarioModel";


export interface OrdenModel {
    id: number;
    fechaOrden: Date;
    usuarioId: number;
    usuario: UsuarioModel;
    videojuegos: OrdenVideojuegoModel[];
  }
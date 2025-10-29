import { OrdenModel } from "./OrdenModel";
import { RoleModel } from "./RoleModel";



export interface UsuarioModel {
    id: number;
    email: string;
    nombre?: string;
    role: RoleModel;
    password: string;
    ordenes: OrdenModel[];
  }
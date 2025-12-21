// src/app/share/models/OrdenModel.ts
import { EstadoOrden, TipoPedido, MetodoPago } from './EnumsModel';

export interface OrdenModel {
  // Campos básicos
  id: number;
  numeropedido: string;
  idcliente: number;
  estado: EstadoOrden;
  tipopedido: TipoPedido;
  total: number;
  subtotal?: number;
  servicioexpress?: number;
  metodopago?: MetodoPago;
  montopagado?: number;
  cambio?: number;
  numeroautorizacion?: string;
  ultimos4digitos?: string;
  tiempoestimado?: number;
  notas?: string;
  
  // Fechas
  creadoen: Date;
  actualizadoen: Date;
  preparadoen?: Date;
  entregadoen?: Date;
  
  // Relaciones sin tipado estricto 
  cliente?: any;
  items?: any[];
  historiales?: any[];
  notificaciones?: any[];
  valoraciones?: any[];
}


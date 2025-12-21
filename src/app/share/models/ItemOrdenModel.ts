import { MenuItemModel } from './MenuItemModel';

export interface ItemOrden {
  id: number;
  idorden: number;
  idmenuitem: number;
  cantidad: number;
  precio: number;
  subtotal: number;
  notas?: string;
  creadoen: Date;
  
  // Relaciones opcionales
  orden?: any;
  menuItem?: MenuItemModel;
}


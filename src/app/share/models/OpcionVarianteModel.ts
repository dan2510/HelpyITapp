export interface OpcionVarianteModel {
  id?: number;
  idgrupo?: number;
  idgrupovariante?: number;
  opcion_id?: string; // ID único de la opción (del backend)
  nombre: string;
  descripcion?: string;
  precioBase?: number;
  precio_base?: number; // Del backend (snake_case)
  incrementoPrecio?: number;
  incremento_precio?: number; // Del backend (snake_case)
  requiereSubSeleccion?: boolean;
  requiere_sub_seleccion?: boolean; // Del backend (snake_case)
  subOpciones?: string; // JSON string con las sub-opciones
  sub_opciones_json?: string; // Del backend (snake_case)
  orden: number;
  activo?: boolean;
  creadoen?: Date;
  actualizadoen?: Date;
}


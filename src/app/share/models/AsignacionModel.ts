import { Prioridad, EstadoTiquete } from './EnumsModel';
import { CategoriaModel } from './CategoriaModel';
import { UsuarioModel } from './UsuarioModel';


// Modelo para la vista de asignaciones semanales
export interface AsignacionModel {
  id: number;
  titulo: string;
  descripcion: string;
  estado: EstadoTiquete;
  prioridad: Prioridad;
  creadoen: Date;
  
  // Relaciones simplificadas para la vista
  categoria?: CategoriaModel;
  cliente?: UsuarioModel;
  sla?: SLAInfo;
}

// Información del SLA para la vista (calculada en backend)
export interface SLAInfo {
  nombre: string;
  venceresolucion: Date;
  horasRestantes: number;
  porcentajeUrgencia: number;
  estadoSLA: 'OK' | 'ADVERTENCIA' | 'CRITICO';
}

// Para la respuesta del endpoint de asignaciones
export interface AsignacionesResponse {
  success: boolean;
  data: {
    tecnico: UsuarioModel;
    semana: {
      inicio: Date;
      fin: Date;
    };
    asignaciones: AsignacionModel[];
    total: number;
  };
}
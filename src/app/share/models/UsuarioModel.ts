// src/app/share/models/UsuarioModel.ts
import { Disponibilidad } from './EnumsModel';
import { RolModel } from './RolModel';

export interface UsuarioModel {
  // Campos básicos
  id: number;
  correo: string;
  contrasenahash?: string;
  nombrecompleto: string;
  telefono?: string;
  idrol: number;
  activo: boolean;
  ultimoiniciosesion?: Date;
  creadoen: Date;
  actualizadoen: Date;
  eliminadoen?: Date;
  
  // Campos de técnico
  disponibilidad: Disponibilidad;
  cargaactual: number;
  maxticketsimultaneos: number;
  
  // Relaciones sin tipado
  rol?: RolModel;
  especialidades?: any[];
  ticketsActivos?: any[];
  estadisticas?: any;
}
import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EstadoTiquete, Prioridad, RoleNombre, Disponibilidad, NivelExperiencia } from '../../models/EnumsModel';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translateService = inject(TranslateService);

  /**
   * Traduce el estado de un ticket
   */
  translateTicketState(state: EstadoTiquete | string): string {
    const key = `TICKET_STATES.${state}`;
    const translation = this.translateService.instant(key);
    // Si no hay traducción, devolver el estado original
    return translation !== key ? translation : state;
  }

  /**
   * Traduce la prioridad de un ticket
   */
  translatePriority(priority: Prioridad | string): string {
    const key = `PRIORITIES.${priority}`;
    const translation = this.translateService.instant(key);
    return translation !== key ? translation : priority;
  }

  /**
   * Traduce el rol de un usuario
   */
  translateRole(role: RoleNombre | string): string {
    const key = `ROLES.${role}`;
    const translation = this.translateService.instant(key);
    return translation !== key ? translation : role;
  }

  /**
   * Traduce la disponibilidad de un técnico
   */
  translateAvailability(availability: Disponibilidad | string): string {
    const key = `AVAILABILITY.${availability}`;
    const translation = this.translateService.instant(key);
    return translation !== key ? translation : availability;
  }

  /**
   * Traduce el nivel de experiencia
   */
  translateExperienceLevel(level: NivelExperiencia | string): string {
    const key = `EXPERIENCE_LEVEL.${level}`;
    const translation = this.translateService.instant(key);
    return translation !== key ? translation : level;
  }

  /**
   * Traduce cualquier texto usando una clave
   */
  translate(key: string, params?: any): string {
    return this.translateService.instant(key, params);
  }
}


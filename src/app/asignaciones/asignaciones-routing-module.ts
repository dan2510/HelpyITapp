import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AsignacionSemana } from './asignacion-semana/asignacion-semana';
import { AsignacionAutomatica } from './asignacion-automatica/asignacion-automatica';
import { AsignacionManual } from './asignacion-manual/asignacion-manual';
import { authGuard } from '../share/guards/auth.guard';

const routes: Routes = [
  // Ruta vacía para mostrar la vista semanal en /asignaciones
  { path: '', component: AsignacionSemana },
  // Asignación automática - Solo ADMIN
  { path: 'automatica', component: AsignacionAutomatica, canActivate: [authGuard], data: { roles: ['ADMIN'] } },
  // Asignación manual - Solo ADMIN
  { path: 'manual', component: AsignacionManual, canActivate: [authGuard], data: { roles: ['ADMIN'] } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AsignacionesRoutingModule { } 
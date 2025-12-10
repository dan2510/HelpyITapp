import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AsignacionSemana } from './asignacion-semana/asignacion-semana';
import { AsignacionAutomatica } from './asignacion-automatica/asignacion-automatica';
import { AsignacionManual } from './asignacion-manual/asignacion-manual';

const routes: Routes = [
  // Ruta vacía para mostrar la vista semanal en /asignaciones
  { path: '', component: AsignacionSemana },
  // Asignación automática
  { path: 'automatica', component: AsignacionAutomatica },
  // Asignación manual
  { path: 'manual', component: AsignacionManual },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AsignacionesRoutingModule { } 
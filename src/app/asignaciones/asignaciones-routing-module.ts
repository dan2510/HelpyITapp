import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AsignacionSemana } from './asignacion-semana/asignacion-semana';

const routes: Routes = [
  // Ruta vacía para mostrar la vista semanal en /asignaciones
  { path: '', component: AsignacionSemana },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AsignacionesRoutingModule { }
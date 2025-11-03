import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TecnicoIndex } from './tecnico-index/tecnico-index';
import { TecnicoDetail } from './tecnico-detail/tecnico-detail';

const routes: Routes = [
  // Ruta vacía para mostrar el listado en /tecnicos
  { path: '', component: TecnicoIndex },
  
  // Ruta para el detalle en /tecnicos/:id  
  { path: ':id', component: TecnicoDetail },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TecnicosRoutingModule { }
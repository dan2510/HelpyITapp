import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TiqueteIndex } from './tiquete-index/tiquete-index';
import { TiqueteDetail } from './tiquete-detail/tiquete-detail';

const routes: Routes = [
  // Ruta vacía para mostrar el listado en /tiquetes
  { path: '', component: TiqueteIndex },
  
  // Ruta para el detalle en /tiquetes/:id  
  { path: ':id', component: TiqueteDetail },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TiqueteRoutingModule { }
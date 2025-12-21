import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrdenIndex } from './orden-index/orden-index';
import { OrdenDetail } from './orden-detail/orden-detail';
import { OrdenForm } from './orden-form/orden-form';

const routes: Routes = [
  // Ruta vacía para mostrar el listado en /ordenes
  { path: '', component: OrdenIndex },
  
  // Ruta para crear nueva orden
  { path: 'nuevo', component: OrdenForm },
  
  // Ruta para el detalle en /ordenes/:id  
  { path: ':id', component: OrdenDetail },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdenRoutingModule { }


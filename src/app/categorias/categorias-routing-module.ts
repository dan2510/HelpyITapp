import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriaIndex } from './categoria-index/categoria-index';
import { CategoriaDetail } from './categoria-detail/categoria-detail';

const routes: Routes = [
  // Ruta vacía para mostrar el listado en /categorias
  { path: '', component: CategoriaIndex },
  
  // Ruta para el detalle en /categorias/:id  
  { path: ':id', component: CategoriaDetail },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoriasRoutingModule { }    
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductoIndex } from './producto-index/producto-index';
import { ProductoForm } from './producto-form/producto-form';

const routes: Routes = [
  // Ruta vacía para mostrar el listado en /productos
  { path: '', component: ProductoIndex },
  
  // Ruta para crear nuevo producto
  { path: 'nuevo', component: ProductoForm },
  
  // Ruta para editar producto
  { path: 'editar/:id', component: ProductoForm },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductosRoutingModule { }


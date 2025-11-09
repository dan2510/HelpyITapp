import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Inicio } from './home/inicio/inicio';
import { PageNotFound } from './share/page-not-found/page-not-found';

import { TecnicosModule } from './tecnicos/tecnicos-module';
import { CategoriasModule } from './categorias/categorias-module';
import { TiqueteModule } from './tiquetes/tiquete-module';
const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: 'inicio', component: Inicio },
  
  // Sin lazy loading:
  { path: 'tecnicos', loadChildren: () => TecnicosModule },
  { path: 'categorias', loadChildren: () => CategoriasModule },
  { path: 'tiquetes', loadChildren: () => TiqueteModule },
  
  { path: '**', component: PageNotFound }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
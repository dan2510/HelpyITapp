import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Inicio } from './home/inicio/inicio';
import { PageNotFound } from './share/page-not-found/page-not-found';

const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: 'inicio', component: Inicio },
  
  { 
    path: 'tecnicos', 
    loadChildren: () => import('./tecnicos/tecnicos-module').then(m => m.TecnicosModule) 
  },
  { 
    path: 'categorias', 
    loadChildren: () => import('./categorias/categorias-module').then(m => m.CategoriasModule) 
  },
  { 
    path: 'tiquetes', 
    loadChildren: () => import('./tiquetes/tiquete-module').then(m => m.TiqueteModule) 
  },

  { 
    path: 'asignaciones', 
    loadChildren: () => import('./asignaciones/asignaciones-module').then(m => m.AsignacionesModule) 
  },
  
  { path: '**', component: PageNotFound }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
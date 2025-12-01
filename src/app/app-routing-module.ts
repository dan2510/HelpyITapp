import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Inicio } from './home/inicio/inicio';
import { PageNotFound } from './share/page-not-found/page-not-found';
import { authGuard } from './share/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: 'inicio', component: Inicio },
  
  { 
    path: 'usuario', 
    loadChildren: () => import('./usuarios/usuarios-module').then(m => m.UsuariosModule) 
  },
  
  { 
    path: 'tecnicos', 
    loadChildren: () => import('./tecnicos/tecnicos-module').then(m => m.TecnicosModule),
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'categorias', 
    loadChildren: () => import('./categorias/categorias-module').then(m => m.CategoriasModule),
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'tiquetes', 
    loadChildren: () => import('./tiquetes/tiquete-module').then(m => m.TiqueteModule),
    canActivate: [authGuard]
  },

  { 
    path: 'asignaciones', 
    loadChildren: () => import('./asignaciones/asignaciones-module').then(m => m.AsignacionesModule),
    canActivate: [authGuard],
    data: { roles: ['TECNICO', 'ADMIN'] }
  },
  
  { path: '**', component: PageNotFound }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
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
    path: 'categorias-menu', 
    loadChildren: () => import('./categorias/categorias-module').then(m => m.CategoriasModule),
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'ordenes', 
    loadChildren: () => import('./ordenes/orden-module').then(m => m.OrdenModule),
    canActivate: [authGuard]
  },
  { 
    path: 'menu', 
    loadChildren: () => import('./categorias/categorias-module').then(m => m.CategoriasModule),
    canActivate: [authGuard]
  },
  { 
    path: 'productos', 
    loadChildren: () => import('./productos/productos-module').then(m => m.ProductosModule),
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'configuracion', 
    loadChildren: () => import('./configuracion/configuracion-module').then(m => m.ConfiguracionModule),
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'pedidos', 
    loadChildren: () => import('./pedidos/pedidos-module').then(m => m.PedidosModule)
  },
  
  { path: '**', component: PageNotFound }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

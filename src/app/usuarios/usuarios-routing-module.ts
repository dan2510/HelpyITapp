import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserLogin } from './user-login/user-login';
import { UserCreate } from './user-create/user-create';

const routes: Routes = [
  {
    path: 'usuario',
    children: [
      { path: 'registrar', component: UserCreate },
      { path: 'login', component: UserLogin },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuariosRoutingModule { }

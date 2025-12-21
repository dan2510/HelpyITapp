import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserLogin } from './user-login/user-login';
// import { UserCreate } from './user-create/user-create'; // Eliminado - registro ahora es a través del flujo de pedidos
import { ForgotPassword } from './forgot-password/forgot-password';
import { ResetPassword } from './reset-password/reset-password';

const routes: Routes = [
  {
    path: 'usuario',
    children: [
      // Ruta de registro público eliminada - el registro ahora se hace a través del flujo de pedidos
      { path: 'login', component: UserLogin },
      { path: 'forgot-password', component: ForgotPassword },
      { path: 'reset-password', component: ResetPassword },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuariosRoutingModule { }

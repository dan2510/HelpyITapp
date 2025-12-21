import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PhoneInputComponent } from './phone-input/phone-input';
import { ClienteRegistroComponent } from './cliente-registro/cliente-registro';
import { MenuCarritoComponent } from './menu-carrito/menu-carrito';
import { PagoComponent } from './pago/pago';
import { ConfirmacionPedidoComponent } from './confirmacion-pedido/confirmacion-pedido';
import { SeguimientoPedidoComponent } from './seguimiento-pedido/seguimiento-pedido';

const routes: Routes = [
  { path: '', redirectTo: 'telefono', pathMatch: 'full' },
  { path: 'telefono', component: PhoneInputComponent },
  { path: 'registro', component: ClienteRegistroComponent },
  { path: 'menu', component: MenuCarritoComponent },
  { path: 'pago', component: PagoComponent },
  { path: 'confirmacion', component: ConfirmacionPedidoComponent },
  { path: 'seguimiento/:numeroPedido', component: SeguimientoPedidoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PedidosRoutingModule { }


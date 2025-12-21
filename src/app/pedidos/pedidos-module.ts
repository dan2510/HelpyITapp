import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';

import { PedidosRoutingModule } from './pedidos-routing-module';
import { PhoneInputComponent } from './phone-input/phone-input';
import { ClienteRegistroComponent } from './cliente-registro/cliente-registro';
import { MenuCarritoComponent } from './menu-carrito/menu-carrito';
import { PagoComponent } from './pago/pago';
import { ConfirmacionPedidoComponent } from './confirmacion-pedido/confirmacion-pedido';
import { SeguimientoPedidoComponent } from './seguimiento-pedido/seguimiento-pedido';
import { ProductoDialogComponent } from './producto-dialog/producto-dialog';

@NgModule({
  declarations: [
    PhoneInputComponent,
    ClienteRegistroComponent,
    MenuCarritoComponent,
    PagoComponent,
    ConfirmacionPedidoComponent,
    SeguimientoPedidoComponent,
    ProductoDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatStepperModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatTooltipModule,
    MatRippleModule,
    PedidosRoutingModule
  ]
})
export class PedidosModule { }


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AsignacionesRoutingModule } from './asignaciones-routing-module';
import { AsignacionSemana } from './asignacion-semana/asignacion-semana';

@NgModule({
  declarations: [
    AsignacionSemana
  ],
  imports: [
    CommonModule,
    RouterModule,
    AsignacionesRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule
  ]
})
export class AsignacionesModule { }
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { AsignacionesRoutingModule } from './asignaciones-routing-module';
import { AsignacionSemana } from './asignacion-semana/asignacion-semana';
import { AsignacionAutomatica } from './asignacion-automatica/asignacion-automatica';
import { AsignacionManual } from './asignacion-manual/asignacion-manual';

@NgModule({
  declarations: [
    AsignacionSemana,
    AsignacionAutomatica,
    AsignacionManual
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AsignacionesRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslateModule
  ]
})
export class AsignacionesModule { }
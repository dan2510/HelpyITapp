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
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TecnicosRoutingModule } from './tecnicos-routing-module';
import { TecnicoIndex } from './tecnico-index/tecnico-index';
import { TecnicoDetail } from './tecnico-detail/tecnico-detail';
import { TecnicoForm } from './tecnico-form/tecnico-form';

@NgModule({
  declarations: [
    TecnicoIndex,
    TecnicoDetail,
    TecnicoForm
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TecnicosRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatSlideToggleModule
  ]
})
export class TecnicosModule { }
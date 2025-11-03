import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { TecnicosRoutingModule } from './tecnicos-routing-module';
import { TecnicoIndex } from './tecnico-index/tecnico-index';
import { TecnicoDetail } from './tecnico-detail/tecnico-detail';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  declarations: [
    TecnicoIndex,
    TecnicoDetail
  ],
  imports: [
    CommonModule,
    RouterModule, 
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
  ]
})
export class TecnicosModule { }
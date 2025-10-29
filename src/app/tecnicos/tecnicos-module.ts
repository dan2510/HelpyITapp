import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TecnicosRoutingModule } from './tecnicos-routing-module';
import { TecnicoIndex } from './tecnico-index/tecnico-index';
import { TecnicoDetail } from './tecnico-detail/tecnico-detail';


@NgModule({
  declarations: [
    TecnicoIndex,
    TecnicoDetail
  ],
  imports: [
    CommonModule,
    TecnicosRoutingModule
  ]
})
export class TecnicosModule { }

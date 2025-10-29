import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing-module';
import { Inicio } from './inicio/inicio';
import { AcercaDe } from './acerca-de/acerca-de';
import {MatCardModule} from '@angular/material/card';


@NgModule({
  declarations: [
    Inicio,
    AcercaDe
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    MatCardModule
  ]
})
export class HomeModule { }

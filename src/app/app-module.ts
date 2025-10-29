import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { CoreModule } from './core/core-module';
import { ShareModule } from './share/share-module';
import { HomeModule } from './home/home-module';
import { UsuariosModule } from './usuarios/usuarios-module';
import { TiqueteModule } from './tiquete/tiquete-module';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgxSonnerToaster } from 'ngx-sonner'
import { HttpErrorInterceptorService } from './share/interceptor/http-error-interceptor.service';
import { TecnicoModule } from './tecnico/tecnico-module';
import { TecnicosModule } from './tecnicos/tecnicos-module';


@NgModule({
  declarations: [
    App
  ],
  imports: [
    BrowserModule,
    CoreModule,
    ShareModule,
    HomeModule,
    UsuariosModule,
    TiqueteModule,
    NgxSonnerToaster,
     AppRoutingModule,
     TecnicoModule,
     TecnicosModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
      provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS, 
      useClass: HttpErrorInterceptorService, 
      multi:true
    }
  ],
  bootstrap: [App]
})
export class AppModule { }

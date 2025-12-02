import { Component, signal, OnInit, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('app');
  private translate = inject(TranslateService);

  ngOnInit(): void {
    // Obtener idioma guardado en localStorage o usar español por defecto
    const savedLanguage = localStorage.getItem('language') || 'es';
    this.translate.setDefaultLang(savedLanguage);
    this.translate.use(savedLanguage);
  }
}

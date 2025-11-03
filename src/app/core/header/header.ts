import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  // Contador de notificaciones para el badge
  notificationCount = 3; // Puedes conectar esto con un servicio real

}
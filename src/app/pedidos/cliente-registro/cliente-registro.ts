import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { NotificationService } from '../../share/services/app/notification.service';

@Component({
  selector: 'app-cliente-registro',
  standalone: false,
  templateUrl: './cliente-registro.html',
  styleUrl: './cliente-registro.css'
})
export class ClienteRegistroComponent implements OnInit {
  registroForm!: FormGroup;
  loading = signal<boolean>(false);
  error = signal<string>('');
  gpsLoading = signal<boolean>(false);
  gpsObtenido = signal<boolean>(false);
  telefonoTemporal: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    // Obtener teléfono de sessionStorage
    this.telefonoTemporal = sessionStorage.getItem('telefonoTemporal') || '';

    this.registroForm = this.fb.group({
      telefono: [this.telefonoTemporal, [Validators.required, Validators.pattern(/^[0-9]{8,10}$/)]],
      nombrecompleto: ['', [Validators.required, Validators.minLength(3)]],
      direccion: ['', [Validators.required, Validators.minLength(10)]],
      latitud: [null],
      longitud: [null]
    });
  }

  obtenerUbicacionGPS(): void {
    this.gpsLoading.set(true);
    this.error.set('');

    if (!navigator.geolocation) {
      this.error.set('Tu navegador no soporta geolocalización');
      this.gpsLoading.set(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        this.registroForm.patchValue({
          latitud: lat,
          longitud: lng
        });
        
        this.gpsObtenido.set(true);
        this.gpsLoading.set(false);
        this.notification.success('Ubicación obtenida', 'Tu ubicación ha sido guardada');
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        this.error.set('No se pudo obtener tu ubicación. Puedes continuar sin GPS.');
        this.gpsLoading.set(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.error.set('Por favor complete todos los campos requeridos');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const datosCliente = this.registroForm.value;

    this.usuarioService.crearClienteTemporal(datosCliente).subscribe({
      next: (response: any) => {
        this.loading.set(false);
        
        if (response.success && response.data?.usuario) {
          const usuario = response.data.usuario;
          sessionStorage.setItem('clienteTemporal', JSON.stringify(usuario));
          sessionStorage.removeItem('telefonoTemporal');
          
          this.notification.success(
            '¡Registro exitoso!',
            `Bienvenido ${usuario.nombrecompleto}, continuemos con tu pedido`
          );
          
          this.router.navigate(['/pedidos/menu']);
        } else {
          this.error.set('Error al registrar. Por favor intente nuevamente.');
        }
      },
      error: (error: any) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al registrar el cliente';
        this.error.set(errorMessage);
        this.notification.error('Error', errorMessage);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/pedidos/telefono']);
  }
}


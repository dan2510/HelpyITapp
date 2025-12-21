import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { NotificationService } from '../../share/services/app/notification.service';

@Component({
  selector: 'app-phone-input',
  standalone: false,
  templateUrl: './phone-input.html',
  styleUrl: './phone-input.css'
})
export class PhoneInputComponent implements OnInit {
  phoneForm!: FormGroup;
  loading = signal<boolean>(false);
  error = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.phoneForm = this.fb.group({
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{8,10}$/)]],
      noSoyRobot: [false, [Validators.requiredTrue]]
    });
  }

  onSubmit(): void {
    if (this.phoneForm.invalid) {
      if (!this.phoneForm.get('telefono')?.valid) {
        this.error.set('Por favor ingrese un número de teléfono válido');
      } else if (!this.phoneForm.get('noSoyRobot')?.value) {
        this.error.set('Por favor confirme que no es un robot');
      } else {
        this.error.set('Por favor complete todos los campos requeridos');
      }
      this.phoneForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const telefono = this.phoneForm.value.telefono;

    // Buscar cliente por teléfono
    this.usuarioService.buscarPorTelefono(telefono).subscribe({
      next: (response: any) => {
        this.loading.set(false);
        console.log('✅ [PHONE-INPUT] Respuesta del servidor:', response);
        
        if (response.success && response.data?.usuario) {
          // Cliente existe - guardar en sessionStorage y redirigir al menú
          const usuario = response.data.usuario;
          sessionStorage.setItem('clienteTemporal', JSON.stringify(usuario));
          this.notification.success(
            '¡Bienvenido de vuelta!',
            `Hola ${usuario.nombrecompleto}, continuemos con tu pedido`
          );
          console.log('✅ [PHONE-INPUT] Cliente encontrado, redirigiendo al menú');
          this.router.navigate(['/pedidos/menu']);
        } else {
          // Cliente no encontrado - redirigir al registro
          console.log('⚠️ [PHONE-INPUT] Cliente no encontrado en respuesta, redirigiendo al registro');
          sessionStorage.setItem('telefonoTemporal', telefono);
          this.notification.info(
            'Cliente nuevo',
            'No encontramos tu número. Te registraremos ahora.'
          );
          this.router.navigate(['/pedidos/registro']);
        }
      },
      error: (error: any) => {
        this.loading.set(false);
        console.log('❌ [PHONE-INPUT] Error recibido:', error);
        console.log('❌ [PHONE-INPUT] Status:', error.status);
        console.log('❌ [PHONE-INPUT] Error.error:', error.error);
        
        // Si el backend devuelve 404 o success: false con mensaje de "no encontrado", es un cliente nuevo
        if (error.status === 404 || 
            (error.error && error.error.success === false && 
             (error.error.message?.toLowerCase().includes('no encontrado') || 
              error.error.message?.toLowerCase().includes('cliente no encontrado')))) {
          // Cliente no existe en la base de datos - redirigir al registro
          console.log('✅ [PHONE-INPUT] Cliente no encontrado (404), redirigiendo al registro');
          sessionStorage.setItem('telefonoTemporal', telefono);
          this.notification.info(
            'Cliente nuevo',
            'No encontramos tu número. Te registraremos ahora.'
          );
          this.router.navigate(['/pedidos/registro']).then(
            (navigated) => {
              console.log('✅ [PHONE-INPUT] Navegación al registro:', navigated ? 'exitosa' : 'fallida');
            }
          );
        } else {
          // Otro tipo de error (servidor, conexión, etc.)
          const errorMessage = error.error?.message || 'Error al verificar el teléfono. Por favor intente nuevamente.';
          console.log('❌ [PHONE-INPUT] Error diferente, mostrando mensaje:', errorMessage);
          this.error.set(errorMessage);
          this.notification.error('Error', errorMessage);
        }
      }
    });
  }
}


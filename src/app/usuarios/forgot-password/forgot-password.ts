// src/app/usuarios/forgot-password/forgot-password.ts
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { Router } from '@angular/router';
import { passwordsMatchValidator } from '../../share/validators/password-match-validator';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  forgotPasswordForm!: FormGroup;
  loading = signal<boolean>(false);
  submitted = signal<boolean>(false);
  hidePassword = true;
  hideConfirmPassword = true;
  
  // Estados del flujo
  step = signal<'email' | 'token' | 'password'>('email');
  correoValidado = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private notification: NotificationService,
    private router: Router
  ) {
    this.initForm();
  }

  initForm(): void {
    this.forgotPasswordForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      token: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordsMatchValidator });
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Paso 1: Validar correo
  validateEmail(): void {
    this.submitted.set(true);

    if (this.forgotPasswordForm.get('correo')?.invalid) {
      this.notification.warning('Validación', 'Por favor ingrese un correo válido');
      return;
    }

    this.loading.set(true);
    const correo = this.forgotPasswordForm.get('correo')?.value;

    this.usuarioService.forgotPassword(correo).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          // Si el correo existe, avanzar al siguiente paso
          this.correoValidado.set(correo);
          this.step.set('token');
          this.submitted.set(false);
        }
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error al validar correo:', error);
        // Si hay error, asumimos que el correo no existe
        this.notification.error('Error', 'El correo no existe en nuestro sistema');
      }
    });
  }

  // Paso 2: Validar token
  validateToken(): void {
    this.submitted.set(true);

    if (this.forgotPasswordForm.get('token')?.invalid) {
      this.notification.warning('Validación', 'Por favor ingrese el token');
      return;
    }

    const token = this.forgotPasswordForm.get('token')?.value;
    
    // Validar token fijo
    if (token === '12345') {
      this.step.set('password');
      this.submitted.set(false);
    } else {
      this.notification.error('Error', 'Token inválido. Contacta al administrador para obtener el token correcto');
    }
  }

  // Paso 3: Cambiar contraseña
  resetPassword(): void {
    this.submitted.set(true);

    // Marcar campos de contraseña como touched para mostrar errores
    const passwordControl = this.forgotPasswordForm.get('password');
    const confirmPasswordControl = this.forgotPasswordForm.get('confirmPassword');
    
    passwordControl?.markAsTouched();
    confirmPasswordControl?.markAsTouched();
    passwordControl?.updateValueAndValidity();
    confirmPasswordControl?.updateValueAndValidity();

    // Obtener valores
    const password = passwordControl?.value || '';
    const confirmPassword = confirmPasswordControl?.value || '';

    // Validar que la contraseña no esté vacía
    if (!password || password.trim() === '') {
      this.notification.warning('Validación', 'La contraseña es obligatoria');
      return;
    }

    // Validar longitud mínima
    if (password.length < 6) {
      this.notification.warning('Validación', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validar que la confirmación no esté vacía
    if (!confirmPassword || confirmPassword.trim() === '') {
      this.notification.warning('Validación', 'Por favor confirme su contraseña');
      return;
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      this.notification.warning('Validación', 'Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    const correo = this.correoValidado();
    const token = this.forgotPasswordForm.get('token')?.value;

    this.usuarioService.resetPassword(token, correo, password).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Contraseña Restablecida',
            text: 'Su contraseña ha sido restablecida exitosamente. Por favor, inicie sesión con su nueva contraseña.',
            showConfirmButton: true,
            confirmButtonText: 'Aceptar'
          }).then(() => {
            this.router.navigate(['/usuario/login']);
          });
        }
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error al restablecer contraseña:', error);
        const errorMessage = error.error?.message || 'Error al restablecer la contraseña. Verifica que el token y el correo sean correctos.';
        this.notification.error('Error', errorMessage);
      }
    });
  }

  goBack(): void {
    if (this.step() === 'token') {
      this.step.set('email');
      this.submitted.set(false);
    } else if (this.step() === 'password') {
      this.step.set('token');
      this.submitted.set(false);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/usuario/login']);
  }
}


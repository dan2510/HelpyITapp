// src/app/usuarios/reset-password/reset-password.ts
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { passwordsMatchValidator } from '../../share/validators/password-match-validator';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  resetPasswordForm!: FormGroup;
  loading = signal<boolean>(false);
  submitted = signal<boolean>(false);
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private notification: NotificationService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Ya no necesitamos obtener token de la URL
  }

  initForm(): void {
    this.resetPasswordForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      token: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordsMatchValidator });
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.resetPasswordForm.invalid) {
      this.notification.warning('Validación', 'Por favor complete todos los campos correctamente');
      return;
    }

    this.loading.set(true);
    const correo = this.resetPasswordForm.get('correo')?.value;
    const token = this.resetPasswordForm.get('token')?.value;
    const password = this.resetPasswordForm.get('password')?.value;

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

  goToLogin(): void {
    this.router.navigate(['/usuario/login']);
  }
}


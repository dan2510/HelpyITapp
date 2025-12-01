import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { passwordsMatchValidator } from '../../share/validators/password-match-validator';
import { NotificationService } from '../../share/services/app/notification.service';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-create',
  standalone: false,
  templateUrl: './user-create.html',
  styleUrl: './user-create.css',
})
export class UserCreate {
  hide = true;
  formCreate!: FormGroup;
  destroy$: Subject<boolean> = new Subject<boolean>();
  
  constructor(
    public fb: FormBuilder,
    private router: Router,
    private notificacion: NotificationService,
    private http: HttpClient
  ) {
    this.reactiveForm();
  }

  reactiveForm() {
    this.formCreate = this.fb.group(
      {
        nombrecompleto: ['', [Validators.required, Validators.minLength(3)]],
        correo: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmpassword: ['', [Validators.required]],
        telefono: [''],
      },
      { validators: passwordsMatchValidator }
    );
  }
  
  ngOnInit(): void {}
  
  submitForm() {
    this.formCreate.markAllAsTouched();
    //Validación
    if (this.formCreate.invalid) {
      this.notificacion.warning('Formulario incompleto', 'Por favor, complete todos los campos requeridos.');
      return;
    }

    // Crear usuario (solo clientes)
    const usuarioData = {
      nombrecompleto: this.formCreate.value.nombrecompleto,
      correo: this.formCreate.value.correo,
      password: this.formCreate.value.password,
      telefono: this.formCreate.value.telefono || null
    };

    this.http.post(`${environment.apiURL}/usuario/register`, usuarioData).subscribe({
      next: (response: any) => {
        this.notificacion.success('Usuario creado', 'Su cuenta ha sido creada exitosamente.', 3000, '/usuario/login');
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        let errorMessage = 'Error al crear usuario. Por favor, intente de nuevo.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        this.notificacion.error('Error', errorMessage);
      }
    });
  }
  
  onReset() {
    this.formCreate.reset();
  }
}


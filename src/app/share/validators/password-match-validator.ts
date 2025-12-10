import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  // Intentar ambos nombres de campo (confirmpassword y confirmPassword)
  const confirmPassword = group.get('confirmPassword')?.value || group.get('confirmpassword')?.value;

  if (!password || !confirmPassword) {
    return null; // No validar si alguno está vacío (ya hay validación required)
  }

  if (password !== confirmPassword) {
    return { passwordsMismatch: true };
  }

  return null;
}


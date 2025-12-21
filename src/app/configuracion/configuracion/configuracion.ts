import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfiguracionService } from '../../share/services/api/configuracion.service';
import { NotificationService } from '../../share/services/app/notification.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-configuracion',
  standalone: false,
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css'
})
export class ConfiguracionComponent implements OnInit {
  configForm!: FormGroup;
  loading = signal<boolean>(false);
  loadingData = signal<boolean>(true);
  precioPorKm = signal<number>(800);

  constructor(
    private fb: FormBuilder,
    private configuracionService: ConfiguracionService,
    private notification: NotificationService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadConfiguracion();
  }

  restauranteLatitud = signal<number>(9.9281);
  restauranteLongitud = signal<number>(-84.0907);

  private initForm(): void {
    this.configForm = this.fb.group({
      precioPorKilometro: [800, [Validators.required, Validators.min(0), Validators.max(10000)]],
      restauranteLatitud: [9.9281, [Validators.required, Validators.min(-90), Validators.max(90)]],
      restauranteLongitud: [-84.0907, [Validators.required, Validators.min(-180), Validators.max(180)]]
    });
  }

  loadConfiguracion(): void {
    this.loadingData.set(true);
    
    // Cargar precio por kilómetro
    this.configuracionService.getByClave('servicio_express_precio_km').subscribe({
      next: (response: any) => {
        console.log('📥 [CONFIG] Respuesta al cargar precio por km:', response);
        if (response.success && response.data?.valorParsed !== undefined) {
          const precio = Number(response.data.valorParsed);
          console.log('📥 [CONFIG] Precio cargado:', precio);
          this.precioPorKm.set(precio);
          this.configForm.patchValue({ precioPorKilometro: precio });
        } else if (response.success && response.data?.valor !== undefined) {
          // Si no hay valorParsed, intentar parsear el valor directamente
          const precio = Number(response.data.valor);
          console.log('📥 [CONFIG] Precio cargado (sin parsear):', precio);
          this.precioPorKm.set(precio);
          this.configForm.patchValue({ precioPorKilometro: precio });
        } else {
          console.log('📥 [CONFIG] No se encontró configuración, usando valor por defecto');
          this.configForm.patchValue({ precioPorKilometro: 800 });
        }
        this.loadCoordenadasRestaurante();
      },
      error: (err) => {
        console.error('❌ [CONFIG] Error al cargar precio por kilómetro:', err);
        this.configForm.patchValue({ precioPorKilometro: 800 });
        this.loadCoordenadasRestaurante();
      }
    });
  }

  loadCoordenadasRestaurante(): void {
    // Cargar latitud
    this.configuracionService.getByClave('restaurante_latitud').subscribe({
      next: (response: any) => {
        if (response.success && response.data?.valorParsed !== undefined) {
          const lat = Number(response.data.valorParsed);
          this.restauranteLatitud.set(lat);
          this.configForm.patchValue({ restauranteLatitud: lat });
        }
        
        // Cargar longitud
        this.configuracionService.getByClave('restaurante_longitud').subscribe({
          next: (responseLng: any) => {
            this.loadingData.set(false);
            if (responseLng.success && responseLng.data?.valorParsed !== undefined) {
              const lng = Number(responseLng.data.valorParsed);
              this.restauranteLongitud.set(lng);
              this.configForm.patchValue({ restauranteLongitud: lng });
            }
          },
          error: () => {
            this.loadingData.set(false);
          }
        });
      },
      error: () => {
        // Cargar longitud aunque falle la latitud
        this.configuracionService.getByClave('restaurante_longitud').subscribe({
          next: (responseLng: any) => {
            this.loadingData.set(false);
            if (responseLng.success && responseLng.data?.valorParsed !== undefined) {
              const lng = Number(responseLng.data.valorParsed);
              this.restauranteLongitud.set(lng);
              this.configForm.patchValue({ restauranteLongitud: lng });
            }
          },
          error: () => {
            this.loadingData.set(false);
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.configForm.invalid) {
      this.configForm.markAllAsTouched();
      this.notification.warning('Formulario inválido', 'Por favor complete todos los campos requeridos');
      return;
    }

    this.loading.set(true);

    const precioPorKm = this.configForm.get('precioPorKilometro')?.value;
    const latitud = this.configForm.get('restauranteLatitud')?.value;
    const longitud = this.configForm.get('restauranteLongitud')?.value;

    // Guardar precio por kilómetro
    console.log('💾 [CONFIG] Guardando precio por kilómetro:', precioPorKm);
    this.configuracionService.upsert({
      clave: 'servicio_express_precio_km',
      valor: precioPorKm,
      descripcion: 'Precio por kilómetro del servicio express de entrega. Se utiliza para calcular el costo de envío basado en la distancia entre el restaurante y la dirección del cliente.',
      tipo: 'number'
    }).subscribe({
      next: (response: any) => {
        console.log('✅ [CONFIG] Precio por kilómetro guardado:', response);
        // Guardar coordenadas del restaurante
        this.configuracionService.upsert({
          clave: 'restaurante_latitud',
          valor: latitud,
          descripcion: 'Latitud GPS del restaurante. Se utiliza para calcular la distancia hasta la dirección del cliente.',
          tipo: 'number'
        }).subscribe({
          next: () => {
            this.configuracionService.upsert({
              clave: 'restaurante_longitud',
              valor: longitud,
              descripcion: 'Longitud GPS del restaurante. Se utiliza para calcular la distancia hasta la dirección del cliente.',
              tipo: 'number'
            }).subscribe({
              next: () => {
                this.loading.set(false);
                this.precioPorKm.set(precioPorKm);
                this.restauranteLatitud.set(latitud);
                this.restauranteLongitud.set(longitud);
                Swal.fire({
                  icon: 'success',
                  title: 'Configuración guardada',
                  text: 'La configuración del servicio express se ha actualizado exitosamente',
                  timer: 2000,
                  showConfirmButton: false
                });
              },
              error: (err) => {
                this.loading.set(false);
                const errorMessage = err.error?.message || 'Error al guardar la longitud del restaurante';
                this.notification.error('Error', errorMessage);
              }
            });
          },
          error: (err) => {
            this.loading.set(false);
            const errorMessage = err.error?.message || 'Error al guardar la latitud del restaurante';
            this.notification.error('Error', errorMessage);
          }
        });
      },
      error: (err) => {
        console.error('❌ [CONFIG] Error al guardar precio por kilómetro:', err);
        this.loading.set(false);
        const errorMessage = err.error?.message || 'Error al guardar el precio por kilómetro';
        this.notification.error('Error', errorMessage);
      }
    });
  }

  formatearPrecio(precio: number): string {
    return `₡${precio.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  Number = Number;
}


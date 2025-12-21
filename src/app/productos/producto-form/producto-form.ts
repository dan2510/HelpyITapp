import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../share/services/api/producto.service';
import { CategoriaService } from '../../share/services/api/categoria.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { MenuItemModel } from '../../share/models/MenuItemModel';
import { CategoriaModel } from '../../share/models/CategoriaModel';
import { GrupoVarianteModel } from '../../share/models/GrupoVarianteModel';
import { OpcionVarianteModel } from '../../share/models/OpcionVarianteModel';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-producto-form',
  standalone: false,
  templateUrl: './producto-form.html',
  styleUrl: './producto-form.css',
})
export class ProductoForm implements OnInit {
  productoForm!: FormGroup;
  productoId: number | null = null;
  isEditMode = false;
  
  loading = signal<boolean>(false);
  loadingData = signal<boolean>(false);
  error = signal<string>('');
  
  categorias = signal<CategoriaModel[]>([]);
  producto = signal<MenuItemModel | null>(null);
  imagenPreview = signal<string | null>(null);
  imagenFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private notification: NotificationService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.checkEditMode();
    this.loadCategorias();
  }

  private checkEditMode(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.productoId = parseInt(id);
        this.isEditMode = true;
        this.loadProducto();
      }
    });
  }

  private initForm(): void {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
      descripcion: ['', [Validators.maxLength(500)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      idcategoria: [null, [Validators.required]],
      disponible: [true],
      activo: [true],
      tiempoPreparacion: [null],
      imagen: [null],
      tieneVariantes: [false],
      precioVariable: [false],
      gruposVariantes: this.fb.array([])
    });
  }

  get gruposVariantesFormArray(): FormArray {
    return this.productoForm.get('gruposVariantes') as FormArray;
  }

  loadCategorias(): void {
    this.categoriaService.get().subscribe({
      next: (response: any) => {
        if (response.success && response.data?.categorias) {
          this.categorias.set(response.data.categorias);
        }
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
      }
    });
  }

  loadProducto(): void {
    if (!this.productoId) return;

    this.loadingData.set(true);
    this.productoService.getById(this.productoId).subscribe({
      next: (response: any) => {
        this.loadingData.set(false);
        if (response.success && response.data?.item) {
          const item = response.data.item;
          this.producto.set(item);
          this.populateForm(item);
        } else if (response.data) {
          // Si la respuesta es directa
          this.producto.set(response.data);
          this.populateForm(response.data);
        }
      },
      error: (err) => {
        this.loadingData.set(false);
        this.error.set(err.error?.message || 'Error al cargar el producto');
        this.notification.error('Error', 'No se pudo cargar el producto');
      }
    });
  }

  private populateForm(producto: MenuItemModel): void {
    this.productoForm.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      idcategoria: producto.idcategoria,
      disponible: producto.disponible,
      activo: producto.activo,
      tiempoPreparacion: producto.tiempoPreparacion || null,
      imagen: producto.imagen || null,
      tieneVariantes: producto.tieneVariantes,
      precioVariable: producto.precioVariable
    });

    // Cargar preview de imagen si existe
    if (producto.imagen) {
      this.imagenPreview.set(producto.imagen);
    }

    // Cargar variantes si existen
    if (producto.gruposVariantes && producto.gruposVariantes.length > 0) {
      this.loadVariantes(producto.gruposVariantes);
    }
  }

  private loadVariantes(grupos: GrupoVarianteModel[]): void {
    const gruposArray = this.gruposVariantesFormArray;
    gruposArray.clear();

    grupos.forEach(grupo => {
      const grupoForm = this.fb.group({
        nombreGrupo: [grupo.nombre, Validators.required],
        descripcionGrupo: [grupo.descripcion || ''],
        obligatorio: [grupo.obligatorio],
        tipoSeleccion: [grupo.tipoSeleccion],
        orden: [grupo.orden],
        definePrecioBase: [grupo.definePrecioBase],
        opciones: this.fb.array([])
      });

      const opcionesArray = grupoForm.get('opciones') as FormArray;
      if (grupo.opciones) {
        grupo.opciones.forEach(opcion => {
          opcionesArray.push(this.createOpcionFormGroup(opcion));
        });
      }

      gruposArray.push(grupoForm);
    });
  }

  private createOpcionFormGroup(opcion?: OpcionVarianteModel): FormGroup {
    return this.fb.group({
      nombre: [opcion?.nombre || '', Validators.required],
      descripcion: [opcion?.descripcion || ''],
      precioBase: [opcion?.precioBase || null],
      incrementoPrecio: [opcion?.incrementoPrecio || 0],
      requiereSubSeleccion: [opcion?.requiereSubSeleccion || false],
      subOpciones: [opcion?.subOpciones || null],
      orden: [opcion?.orden || 0]
    });
  }

  agregarGrupoVariante(): void {
    const gruposArray = this.gruposVariantesFormArray;
    const nuevoGrupo = this.fb.group({
      nombreGrupo: ['', Validators.required],
      descripcionGrupo: [''],
      obligatorio: [true],
      tipoSeleccion: ['unica'],
      orden: [gruposArray.length],
      definePrecioBase: [false],
      opciones: this.fb.array([])
    });
    gruposArray.push(nuevoGrupo);
  }

  eliminarGrupoVariante(index: number): void {
    this.gruposVariantesFormArray.removeAt(index);
  }

  agregarOpcionVariante(grupoIndex: number): void {
    const grupo = this.gruposVariantesFormArray.at(grupoIndex);
    const opcionesArray = grupo.get('opciones') as FormArray;
    opcionesArray.push(this.createOpcionFormGroup());
  }

  eliminarOpcionVariante(grupoIndex: number, opcionIndex: number): void {
    const grupo = this.gruposVariantesFormArray.at(grupoIndex);
    const opcionesArray = grupo.get('opciones') as FormArray;
    opcionesArray.removeAt(opcionIndex);
  }

  getOpcionesFormArray(grupoIndex: number): FormArray {
    const grupo = this.gruposVariantesFormArray.at(grupoIndex);
    return grupo.get('opciones') as FormArray;
  }

  onSubmit(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      this.notification.warning('Formulario inválido', 'Por favor complete todos los campos requeridos');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const formValue = this.productoForm.value;
    
    // Preparar datos para enviar
    const productoData: any = {
      nombre: formValue.nombre,
      descripcion: formValue.descripcion || null,
      precio: formValue.precio,
      idcategoria: formValue.idcategoria,
      disponible: formValue.disponible,
      activo: formValue.activo,
      tiempoPreparacion: formValue.tiempoPreparacion || null,
      imagen: formValue.imagen || null,
      tieneVariantes: formValue.tieneVariantes,
      precioVariable: formValue.precioVariable
    };

    // Agregar variantes si tiene
    if (formValue.tieneVariantes && formValue.gruposVariantes.length > 0) {
      productoData.gruposVariantes = formValue.gruposVariantes.map((grupo: any) => ({
        nombreGrupo: grupo.nombreGrupo,
        descripcionGrupo: grupo.descripcionGrupo,
        obligatorio: grupo.obligatorio,
        tipoSeleccion: grupo.tipoSeleccion,
        orden: grupo.orden,
        definePrecioBase: grupo.definePrecioBase,
        opciones: grupo.opciones.map((opcion: any) => ({
          nombre: opcion.nombre,
          descripcion: opcion.descripcion,
          precioBase: opcion.precioBase || null,
          incrementoPrecio: opcion.incrementoPrecio || 0,
          requiereSubSeleccion: opcion.requiereSubSeleccion || false,
          subOpciones: opcion.subOpciones || null,
          orden: opcion.orden || 0
        }))
      }));
    }

    if (this.isEditMode && this.productoId) {
      // Actualizar
      this.productoService.update({ id: this.productoId, ...productoData }).subscribe({
        next: (response: any) => {
          this.loading.set(false);
          Swal.fire({
            icon: 'success',
            title: 'Producto actualizado',
            text: 'El producto se ha actualizado exitosamente',
            timer: 2000,
            showConfirmButton: false
          });
          this.router.navigate(['/productos']);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Error al actualizar el producto');
          this.notification.error('Error', 'No se pudo actualizar el producto');
        }
      });
    } else {
      // Crear
      this.productoService.create(productoData).subscribe({
        next: (response: any) => {
          this.loading.set(false);
          Swal.fire({
            icon: 'success',
            title: 'Producto creado',
            text: 'El producto se ha creado exitosamente',
            timer: 2000,
            showConfirmButton: false
          });
          this.router.navigate(['/productos']);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Error al crear el producto');
          this.notification.error('Error', 'No se pudo crear el producto');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/productos']);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
        this.notification.warning('Formato inválido', 'Por favor seleccione una imagen válida (JPG, PNG, GIF o WEBP)');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.notification.warning('Archivo muy grande', 'La imagen no debe superar los 5MB');
        return;
      }

      this.imagenFile = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreview.set(e.target.result);
        // Guardar como base64 en el formulario
        this.productoForm.patchValue({ imagen: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  eliminarImagen(): void {
    this.imagenFile = null;
    this.imagenPreview.set(null);
    this.productoForm.patchValue({ imagen: null });
  }
}


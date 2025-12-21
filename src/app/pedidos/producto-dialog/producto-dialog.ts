import { Component, Inject, OnInit, signal, computed } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { MenuItemModel } from '../../share/models/MenuItemModel';
import { GrupoVarianteModel } from '../../share/models/GrupoVarianteModel';
import { OpcionVarianteModel } from '../../share/models/OpcionVarianteModel';

export interface ProductoDialogData {
  producto: MenuItemModel;
}

export interface ProductoSeleccionado {
  producto: MenuItemModel;
  cantidad: number;
  variantesSeleccionadas: VarianteSeleccionada[];
  precioFinal: number;
  notas?: string;
}

export interface VarianteSeleccionada {
  grupoId: string;
  grupoNombre: string;
  opcionesSeleccionadas: OpcionSeleccionada[];
}

export interface OpcionSeleccionada {
  opcionId: string;
  nombre: string;
  incrementoPrecio: number;
  precioBase?: number;
  subOpcion?: string;
}

@Component({
  selector: 'app-producto-dialog',
  standalone: false,
  templateUrl: './producto-dialog.html',
  styleUrl: './producto-dialog.css'
})
export class ProductoDialogComponent implements OnInit {
  productoForm!: FormGroup;
  producto: MenuItemModel;
  precioBase = signal<number>(0);
  precioFinal = computed(() => {
    let total = this.precioBase();
    
    // Si el producto tiene precio variable, usar el precio base de la opción seleccionada
    if (this.producto.precioVariable) {
      const gruposArray = this.productoForm.get('gruposVariantes') as FormArray;
      gruposArray.controls.forEach((grupoControl, grupoIndex) => {
        const grupo = this.producto.gruposVariantes?.[grupoIndex];
        if (grupo?.definePrecioBase) {
          const opcionSeleccionada = grupoControl.get('opcionSeleccionada')?.value;
          if (opcionSeleccionada) {
            const opcion = grupo.opciones?.find(o => (o.id?.toString()) === opcionSeleccionada);
            if (opcion?.precioBase) {
              total = Number(opcion.precioBase);
            }
          }
        }
      });
    }
    
    // Sumar incrementos de precio de todas las opciones seleccionadas
    const gruposArray = this.productoForm.get('gruposVariantes') as FormArray;
    gruposArray.controls.forEach((grupoControl) => {
      const opcionSeleccionada = grupoControl.get('opcionSeleccionada')?.value;
      const opcionesMultiples = grupoControl.get('opcionesMultiples')?.value || [];
      
      if (opcionSeleccionada) {
        const grupoIndex = gruposArray.controls.indexOf(grupoControl);
        const grupo = this.producto.gruposVariantes?.[grupoIndex];
        const opcion = grupo?.opciones?.find(o => o.id?.toString() === opcionSeleccionada);
        if (opcion) {
          total += Number(opcion.incrementoPrecio || 0);
        }
      }
      
      opcionesMultiples.forEach((opcionId: string) => {
        const grupoIndex = gruposArray.controls.indexOf(grupoControl);
        const grupo = this.producto.gruposVariantes?.[grupoIndex];
        const opcion = grupo?.opciones?.find(o => o.id?.toString() === opcionId);
        if (opcion) {
          total += Number(opcion.incrementoPrecio || 0);
        }
      });
    });
    
    // Multiplicar por la cantidad
    const cantidad = this.productoForm.get('cantidad')?.value || 1;
    return total * cantidad;
  });

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductoDialogData
  ) {
    this.producto = data.producto;
    this.precioBase.set(Number(this.producto.precio));
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    const gruposArray = this.fb.array<FormGroup>([]);
    
    // Crear form controls para cada grupo de variantes
    if (this.producto.gruposVariantes && this.producto.gruposVariantes.length > 0) {
      this.producto.gruposVariantes.forEach((grupo, index) => {
        const grupoForm = this.fb.group({
          grupoId: [grupo.id?.toString() || ''],
          opcionSeleccionada: [grupo.obligatorio ? null : '', grupo.obligatorio ? Validators.required : null],
          opcionesMultiples: [grupo.tipoSeleccion === 'multiple' ? [] : null],
          subOpcionSeleccionada: [null]
        });
        
        gruposArray.push(grupoForm);
      });
    }

    this.productoForm = this.fb.group({
      cantidad: [1, [Validators.required, Validators.min(1)]],
      gruposVariantes: gruposArray,
      notas: ['']
    });
  }

  get gruposVariantesFormArray(): FormArray {
    return this.productoForm.get('gruposVariantes') as FormArray;
  }

  getGrupoForm(index: number): FormGroup {
    return this.gruposVariantesFormArray.at(index) as FormGroup;
  }

  onOpcionUnicaChange(grupoIndex: number, opcionId: string): void {
    const grupoForm = this.getGrupoForm(grupoIndex);
    grupoForm.patchValue({ opcionSeleccionada: opcionId });
    
    // Si la opción requiere sub-selección, resetear la sub-opción
    const grupo = this.producto.gruposVariantes?.[grupoIndex];
    const opcion = grupo?.opciones?.find(o => o.id?.toString() === opcionId);
    if (opcion?.requiereSubSeleccion) {
      grupoForm.patchValue({ subOpcionSeleccionada: null });
    }
  }

  onOpcionMultipleChange(grupoIndex: number, opcionId: string, checked: boolean): void {
    const grupoForm = this.getGrupoForm(grupoIndex);
    const opcionesMultiples = grupoForm.get('opcionesMultiples')?.value || [];
    
    if (checked) {
      opcionesMultiples.push(opcionId);
    } else {
      const index = opcionesMultiples.indexOf(opcionId);
      if (index > -1) {
        opcionesMultiples.splice(index, 1);
      }
    }
    
    grupoForm.patchValue({ opcionesMultiples: [...opcionesMultiples] });
  }

  isOpcionSeleccionada(grupoIndex: number, opcionId: string): boolean {
    const grupoForm = this.getGrupoForm(grupoIndex);
    const grupo = this.producto.gruposVariantes?.[grupoIndex];
    
    if (grupo?.tipoSeleccion === 'unica') {
      return grupoForm.get('opcionSeleccionada')?.value === opcionId;
    } else {
      const opcionesMultiples = grupoForm.get('opcionesMultiples')?.value || [];
      return opcionesMultiples.includes(opcionId);
    }
  }

  requiereSubSeleccion(grupoIndex: number, opcionId: string): boolean {
    const grupo = this.producto.gruposVariantes?.[grupoIndex];
    const opcion = grupo?.opciones?.find(o => o.id?.toString() === opcionId);
    return opcion?.requiereSubSeleccion || false;
  }

  getSubOpciones(grupoIndex: number, opcionId: string): string[] {
    const grupo = this.producto.gruposVariantes?.[grupoIndex];
    const opcion = grupo?.opciones?.find(o => o.id?.toString() === opcionId);
    
    if (opcion?.subOpciones) {
      try {
        if (typeof opcion.subOpciones === 'string') {
          return JSON.parse(opcion.subOpciones);
        }
        return opcion.subOpciones || [];
      } catch {
        return [];
      }
    }
    return [];
  }

  aumentarCantidad(): void {
    const cantidad = this.productoForm.get('cantidad')?.value || 1;
    this.productoForm.patchValue({ cantidad: cantidad + 1 });
  }

  disminuirCantidad(): void {
    const cantidad = this.productoForm.get('cantidad')?.value || 1;
    if (cantidad > 1) {
      this.productoForm.patchValue({ cantidad: cantidad - 1 });
    }
  }

  agregarAlCarrito(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }

    const formValue = this.productoForm.value;
    const variantesSeleccionadas: VarianteSeleccionada[] = [];

    // Procesar variantes seleccionadas
    formValue.gruposVariantes.forEach((grupoForm: any, index: number) => {
      const grupo = this.producto.gruposVariantes?.[index];
      if (!grupo) return;

      const opcionesSeleccionadas: OpcionSeleccionada[] = [];

      // Opción única
      if (grupoForm.opcionSeleccionada) {
          const opcion = grupo.opciones?.find(o => o.id?.toString() === grupoForm.opcionSeleccionada);
          if (opcion) {
            opcionesSeleccionadas.push({
              opcionId: opcion.id?.toString() || '',
              nombre: opcion.nombre,
              incrementoPrecio: Number(opcion.incrementoPrecio || 0),
              precioBase: opcion.precioBase ? Number(opcion.precioBase) : undefined,
              subOpcion: grupoForm.subOpcionSeleccionada || undefined
            });
          }
      }

      // Opciones múltiples
      if (grupoForm.opcionesMultiples && grupoForm.opcionesMultiples.length > 0) {
        grupoForm.opcionesMultiples.forEach((opcionId: string) => {
          const opcion = grupo.opciones?.find(o => o.id?.toString() === opcionId);
          if (opcion) {
            opcionesSeleccionadas.push({
              opcionId: opcion.id?.toString() || '',
              nombre: opcion.nombre,
              incrementoPrecio: Number(opcion.incrementoPrecio || 0)
            });
          }
        });
      }

      if (opcionesSeleccionadas.length > 0) {
        variantesSeleccionadas.push({
          grupoId: grupo.id?.toString() || '',
          grupoNombre: grupo.nombre,
          opcionesSeleccionadas
        });
      }
    });

    const productoSeleccionado: ProductoSeleccionado = {
      producto: this.producto,
      cantidad: formValue.cantidad,
      variantesSeleccionadas,
      precioFinal: this.precioFinal(),
      notas: formValue.notas || undefined
    };

    this.dialogRef.close(productoSeleccionado);
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  formatearPrecio(precio: number): string {
    return `₡${precio.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  Number = Number;
}


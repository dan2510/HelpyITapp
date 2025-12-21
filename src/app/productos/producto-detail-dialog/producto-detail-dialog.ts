import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MenuItemModel } from '../../share/models/MenuItemModel';
import { Router } from '@angular/router';

export interface ProductoDetailData {
  producto: MenuItemModel;
}

@Component({
  selector: 'app-producto-detail-dialog',
  standalone: false,
  templateUrl: './producto-detail-dialog.html',
  styleUrl: './producto-detail-dialog.css'
})
export class ProductoDetailDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ProductoDetailDialogComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: ProductoDetailData
  ) {
    // Debug: verificar datos recibidos
    console.log('Datos recibidos en detalle:', this.data);
    console.log('Producto:', this.data.producto);
    console.log('Grupos de variantes:', this.data.producto?.gruposVariantes);
  }

  get producto(): MenuItemModel {
    return this.data.producto;
  }

  get tieneVariantesConfiguradas(): boolean {
    return !!(this.producto.gruposVariantes && this.producto.gruposVariantes.length > 0);
  }

  formatearPrecio(precio: number): string {
    return `₡${precio.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatearFecha(fecha: Date | string): string {
    if (!fecha) return 'N/A';
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  editarProducto(): void {
    this.dialogRef.close();
    this.router.navigate(['/productos/editar', this.producto.id]);
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  getSubOpcionesList(opcion: any): string[] {
    const subOpcionesStr = opcion.subOpciones || opcion.sub_opciones_json;
    if (!subOpcionesStr) return [];
    
    try {
      if (typeof subOpcionesStr === 'string') {
        return JSON.parse(subOpcionesStr);
      }
      return Array.isArray(subOpcionesStr) ? subOpcionesStr : [];
    } catch {
      return [];
    }
  }

  Number = Number;
}


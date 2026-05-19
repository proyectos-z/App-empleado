import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Empleado } from '../models/empleado';
import { EmpleadoService } from '../services/empleado.service';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleados.html',
  styleUrl: './empleados.scss',
})
export class Empleados implements OnInit {

  empleados: Empleado[] = [];
  textoBusqueda: string = '';
  filtroGenero: string = '';
  filtroEstadoCivil: string = '';
  mensaje: string = '';
  tipoMensaje: 'exito' | 'error' | '' = '';
  idAEliminar: number | null = null;
  errores: { [key: string]: string } = {};

  empleado: Empleado = {
    nombre: '',
    apellido: '',
    dni: '',
    genero: '',
    estadoCivil: ''
  };

  constructor(private empleadoService: EmpleadoService) {}

  ngOnInit(): void {
    this.listar();
  }

  get empleadosFiltrados(): Empleado[] {
    const texto = this.textoBusqueda.toLowerCase().trim();
    return this.empleados.filter(emp => {
      const coincideTexto = !texto ||
        emp.nombre.toLowerCase().includes(texto) ||
        emp.apellido.toLowerCase().includes(texto) ||
        emp.dni.includes(texto);
      const coincideGenero = !this.filtroGenero || emp.genero === this.filtroGenero;
      const coincideEstado = !this.filtroEstadoCivil || emp.estadoCivil === this.filtroEstadoCivil;
      return coincideTexto && coincideGenero && coincideEstado;
    });
  }

  listar(): void {
    this.empleadoService.listar().subscribe({
      next: data => { this.empleados = data; },
      error: () => this.mostrarMensaje('Error al cargar empleados', 'error')
    });
  }

  guardar(): void {
    if (!this.validarFormulario()) return;

    if (this.empleado.id) {
      this.actualizar();
    } else {
      this.empleadoService.guardar(this.empleado).subscribe({
        next: () => {
          this.mostrarMensaje('Empleado registrado correctamente', 'exito');
          this.listar();
          this.limpiarFormulario();
        },
        error: () => this.mostrarMensaje('No se pudo registrar el empleado', 'error')
      });
    }
  }

  editar(emp: Empleado): void {
    this.empleado = { ...emp };
    this.errores = {};
    this.mensaje = '';
    this.idAEliminar = null;
  }

  actualizar(): void {
    if (!this.empleado.id) return;

    this.empleadoService.actualizar(this.empleado.id, this.empleado).subscribe({
      next: () => {
        this.mostrarMensaje('Empleado actualizado correctamente', 'exito');
        this.listar();
        this.limpiarFormulario();
      },
      error: () => this.mostrarMensaje('No se pudo actualizar el empleado', 'error')
    });
  }

  confirmarEliminar(id?: number): void {
    if (!id) return;
    this.idAEliminar = id;
  }

  cancelarEliminar(): void {
    this.idAEliminar = null;
  }

  eliminar(): void {
    if (!this.idAEliminar) return;

    this.empleadoService.eliminar(this.idAEliminar).subscribe({
      next: () => {
        this.mostrarMensaje('Empleado eliminado correctamente', 'exito');
        this.listar();
        this.idAEliminar = null;
      },
      error: () => {
        this.mostrarMensaje('No se pudo eliminar el empleado', 'error');
        this.idAEliminar = null;
      }
    });
  }

  limpiarFormulario(): void {
    this.empleado = { nombre: '', apellido: '', dni: '', genero: '', estadoCivil: '' };
    this.errores = {};
  }

  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.filtroGenero = '';
    this.filtroEstadoCivil = '';
  }

  validarFormulario(): boolean {
    this.errores = {};
    let valido = true;

    if (!this.empleado.nombre.trim()) {
      this.errores['nombre'] = 'Nombre es obligatorio';
      valido = false;
    }
    if (!this.empleado.apellido.trim()) {
      this.errores['apellido'] = 'Apellido es obligatorio';
      valido = false;
    }
    if (!this.empleado.dni.trim()) {
      this.errores['dni'] = 'DNI es obligatorio';
      valido = false;
    } else if (!/^\d{8}$/.test(this.empleado.dni)) {
      this.errores['dni'] = 'DNI debe tener exactamente 8 dígitos numéricos';
      valido = false;
    }
    if (!this.empleado.genero) {
      this.errores['genero'] = 'Seleccione un género';
      valido = false;
    }
    if (!this.empleado.estadoCivil) {
      this.errores['estadoCivil'] = 'Seleccione estado civil';
      valido = false;
    }

    return valido;
  }

  private mostrarMensaje(texto: string, tipo: 'exito' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => { this.mensaje = ''; this.tipoMensaje = ''; }, 3500);
  }
}

import { Routes } from '@angular/router';
import { Empleados } from './empleados/empleados';

export const routes: Routes = [
  { path: '', redirectTo: 'empleados', pathMatch: 'full' },
  { path: 'empleados', component: Empleados }
];

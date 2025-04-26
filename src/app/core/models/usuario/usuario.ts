import { Provincia } from './provincia';
import { Rol } from './rol';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  rol: Rol;
  provincia: Provincia;
}

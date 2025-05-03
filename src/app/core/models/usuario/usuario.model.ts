import { Provincia } from './provincia.model';
import { Rol } from './rol.model';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  rol: Rol;
  provincia: Provincia;
}

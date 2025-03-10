import {Role} from './role';

export interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  role: Role;
}

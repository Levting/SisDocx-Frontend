// Interfaz para manejar los errores de la API
export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
  status: number;
}

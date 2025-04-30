export interface ElementoTabla {
  columnas: { [key: string]: any }; // Mapa de valores de las columnas
  seleccionado?: boolean; // Indica si la fila está seleccionada
}

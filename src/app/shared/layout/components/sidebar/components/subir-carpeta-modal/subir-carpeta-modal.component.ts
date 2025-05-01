import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-subir-carpeta-modal',
  standalone: true,
  imports: [],
  templateUrl: './subir-carpeta-modal.component.html',
})
export class SubirCarpetaModalComponent {
  @Input() isOpen: boolean = false;
  @Input() carpetaPadreId: number = 0;

}

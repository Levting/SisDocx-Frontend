import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { NgIf } from '@angular/common';
import { DocumentosAdminComponent } from "./documentos-admin/documentos-admin.component";
import { DocumentosPersonalComponent } from "./documentos-personal/documentos-personal.component";

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [NgIf, DocumentosAdminComponent, DocumentosPersonalComponent],
  templateUrl: './documentos.component.html',
})
export class DocumentosComponent implements OnInit {
  private authService: AuthService = inject(AuthService);
  public isAdmin = false;

  ngOnInit(): void {
    this.authService.userRole$.subscribe((role) => {
      this.isAdmin = role === 'Administrador';
    });
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { SvgIconComponent } from 'angular-svg-icon';
import {
  DashboardService,
  GraficoItemDTO,
} from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule, SvgIconComponent],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService: DashboardService = inject(DashboardService);

  // Documentos Chart
  public documentosChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B'],
      },
    ],
  };
  public documentosChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
  };
  public documentosChartType = 'pie' as const;

  // Usuarios Chart
  public usuariosChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Activos', 'Inactivos'],
    datasets: [
      {
        data: [],
        backgroundColor: ['#4F46E5', '#7C3AED'],
      },
    ],
  };
  public usuariosChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
  };
  public usuariosChartType = 'doughnut' as const;

  // Actividad Chart
  public actividadChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Actividad',
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
      },
    ],
  };
  public actividadChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  public actividadChartType = 'line' as const;

  public totalCarpetas = 0;
  public totalArchivos = 0;
  public totalUsuarios = 0;

  public isLoading: boolean = true;
  public error: string | null = null;

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  private cargarDatosDashboard(): void {
    this.dashboardService.obtenerDatosDocumentos().subscribe({
      next: (data: GraficoItemDTO[]) => {
        // Actualizar datos de documentos
        this.documentosChartData.labels = data.map((item) => item.nombre);
        this.documentosChartData.datasets[0].data = data.map(
          (item) => item.valor
        );

        // Actualizar datos de usuarios
        this.usuariosChartData.datasets[0].data = [
          data.filter((item) => item.nombre === 'Activos').length,
          data.filter((item) => item.nombre === 'Inactivos').length,
        ];

        // Actualizar datos de actividad
        this.actividadChartData.labels = data.map((item) => item.nombre);
        this.actividadChartData.datasets[0].data = data.map(
          (item) => item.valor
        );

        // KPIs usando nombre
        this.totalCarpetas = data
          .filter((item) => item.nombre.toLowerCase().includes('carpeta'))
          .reduce((acc, item) => acc + item.valor, 0);
        this.totalArchivos = data
          .filter((item) => item.nombre.toLowerCase().includes('archivo'))
          .reduce((acc, item) => acc + item.valor, 0);
        this.totalUsuarios = data
          .filter((item) => item.nombre.toLowerCase().includes('usuario'))
          .reduce((acc, item) => acc + item.valor, 0);

        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los datos del dashboard';
        this.isLoading = false;
        console.error('Error:', error);
      },
    });
  }
}

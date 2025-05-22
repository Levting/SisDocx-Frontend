import { MenuItem } from '../../shared/models/menu/menu.model';

export class Menu {
  public static pages: MenuItem[] = [
    {
      group: 'Inicio',
      separator: false,
      items: [
        {
          icon: 'assets/icons/home.svg',
          label: 'Inicio',
          route: '/',
        },
        {
          icon: 'assets/icons/document.svg',
          label: 'Mis Archivos',
          route: '/documentos',
        },
        {
          icon: 'assets/icons/document.svg',
          label: 'Mis Archivos',
          route: '/documentos-personal',
        },
        {
          icon: 'assets/icons/object.svg',
          label: 'Por Aprobar',
          route: '/documentos-por-aprobar',
        },
        {
          icon: 'assets/icons/object.svg',
          label: 'Papelera',
          route: '/papelera',
        },

        {
          icon: 'assets/icons/settings.svg',
          label: 'Ajustes',
          route: '/ajustes',
        },
      ],
    },
    {
      group: 'Automatizaciones',
      separator: false,
      items: [
        {
          icon: 'assets/icons/object.svg',
          label: 'Fusión de Documentos',
          route: '/automatizaciones/fusion-documentos',
        },
      ],
    },
  ];
}

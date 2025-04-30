import { MenuItem } from '../models/menu/menu';

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
          icon: 'assets/icons/trash.svg',
          label: 'Papelera',
          route: '/papelera',
        },
        {
          icon: 'assets/icons/star.svg',
          label: 'Favoritos',
          route: '/favoritos',
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
          icon: 'assets/icons/settings.svg',
          label: 'Fusión de Documentos',
          route: '/automatizaciones/fusion-documentos',
        },
      ],
    },
  ];
}

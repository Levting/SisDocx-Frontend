import {MenuItem} from '../../models/menu/menu';

export class Menu {
  public static pages: MenuItem[] = [
    {
      group: 'Inicio',
      separator: false,
      items: [
        {
          icon: '',
          label: 'Inicio',
          route: '/home'
        },
        {
          icon: '',
          label: 'Documentos',
          route: '/documents',
          children: [
            {label: 'Current Files', route: '/folders/current-files'},
            {label: 'Downloads', route: '/folders/download'},
            {label: 'Trash', route: '/folders/trash'},
          ],
        },
      ],
    },
    {
      group: 'Ajustes',
      separator: false,
      items: [
        {
          icon: '',
          label: 'Ajustes',
          route: '/settings',
        },
        {
          icon: '',
          label: 'Perfiles',
          route: '/profiles',
        }
      ],
    },
  ];
}

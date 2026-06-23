import { NavLink } from 'react-router-dom';

const menuItems = [
  {
    to: '/admin/categorias',
    label: 'Categorías',
  },
  {
    to: '/admin/subcategorias',
    label: 'Subcategorías',
  },
  {
    to: '/admin/tipos-documento',
    label: 'Tipos de documento',
  },
  {
    to: '/admin/documentos',
    label: 'Documentos',
  },
  {
    to: '/admin/archivos',
    label: 'Archivos',
  },
  {
    to: '/admin/administrar-documentos',
    label: 'Administrar documentos',
  },
  {
    to: '/documentos',
    label: 'Vista usuario',
  },
];

export default function Sidebar() {
  return (
    <aside className="gd-sidebar">
      <div className="gd-sidebar__brand">
        <span className="gd-sidebar__logo">GD</span>

        <div>
          <strong>Gestión Documental</strong>
          <small>Panel administrativo</small>
        </div>
      </div>

      <nav className="gd-sidebar__nav" aria-label="Navegación administrativa">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive
                ? 'gd-sidebar__item gd-sidebar__item--active'
                : 'gd-sidebar__item'
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
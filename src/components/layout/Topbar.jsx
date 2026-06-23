import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/admin/categorias': 'Categorías',
  '/admin/subcategorias': 'Subcategorías',
  '/admin/tipos-documento': 'Tipos de documento',
  '/admin/documentos': 'Documentos',
  '/admin/archivos': 'Archivos',
  '/admin/administrar-documentos': 'Administrar documentos',
  '/documentos': 'Vista usuario',
};

export default function Topbar() {
  const location = useLocation();

  return (
    <header className="gd-topbar">
      <div>
        <p className="gd-topbar__eyebrow">Panel administrativo</p>
        <h1>{pageTitles[location.pathname] || 'Gestión Documental'}</h1>
      </div>

      <div className="gd-topbar__status">
        <span className="gd-topbar__dot" />
        API conectada
      </div>
    </header>
  );
}
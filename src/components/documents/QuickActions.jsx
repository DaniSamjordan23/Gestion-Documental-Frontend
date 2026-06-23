export default function QuickActions({ onGoTo }) {
  return (
    <div className="gd-quick-actions">
      <button
        className="gd-quick-action"
        type="button"
        onClick={() => onGoTo('/admin/categorias')}
      >
        <span>Categorías</span>
        <strong>Crear o editar categorías</strong>
      </button>

      <button
        className="gd-quick-action"
        type="button"
        onClick={() => onGoTo('/admin/subcategorias')}
      >
        <span>Subcategorías</span>
        <strong>Crear o editar subcategorías</strong>
      </button>

      <button
        className="gd-quick-action"
        type="button"
        onClick={() => onGoTo('/admin/tipos-documento')}
      >
        <span>Tipos</span>
        <strong>Administrar tipos de documento</strong>
      </button>

      <button
        className="gd-quick-action"
        type="button"
        onClick={() => onGoTo('/admin/documentos')}
      >
        <span>Documentos</span>
        <strong>Crear o editar documentos</strong>
      </button>

      <button
        className="gd-quick-action"
        type="button"
        onClick={() => onGoTo('/admin/archivos')}
      >
        <span>Archivos</span>
        <strong>Subir o administrar archivos</strong>
      </button>
    </div>
  );
}
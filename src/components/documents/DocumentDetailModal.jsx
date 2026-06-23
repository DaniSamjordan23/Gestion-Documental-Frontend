import { getFileDownloadUrl } from '../../services/files.service';

export default function DocumentDetailModal({
  documentItem,
  onClose,
  onGoToDocuments,
  onGoToFiles,
}) {
  if (!documentItem) {
    return null;
  }

  return (
    <div className="gd-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="gd-document-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="gd-document-modal__header">
          <div>
            <p>Detalle de documento</p>
            <h2 id="document-detail-title">
              {documentItem.codigo} - {documentItem.nombre}
            </h2>
          </div>

          <button
            className="gd-document-modal__close"
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </header>

        <div className="gd-document-modal__body">
          <div className="gd-document-modal__grid">
            <article className="gd-document-modal__info">
              <span>Código</span>
              <strong>{documentItem.codigo || 'No definido'}</strong>
            </article>

            <article className="gd-document-modal__info">
              <span>Nombre</span>
              <strong>{documentItem.nombre || 'No definido'}</strong>
            </article>

            <article className="gd-document-modal__info">
              <span>Versión</span>
              <strong>{documentItem.version || '1'}</strong>
            </article>

            <article className="gd-document-modal__info">
              <span>Estado</span>
              <strong>{documentItem.estado ? 'Activo' : 'Inactivo'}</strong>
            </article>
          </div>

          <article className="gd-document-modal__section">
            <h3>Descripción</h3>
            <p>{documentItem.descripcion || 'Sin descripción registrada.'}</p>
          </article>

          <article className="gd-document-modal__section">
            <h3>Archivos asociados</h3>

            {!documentItem.files || documentItem.files.length === 0 ? (
              <p className="gd-empty">Este documento no tiene archivos.</p>
            ) : (
              <ul className="gd-document-modal__files">
                {documentItem.files.map((file) => (
                  <li key={file.id}>
                    <div>
                      <strong>{file.nombre_original}</strong>
                      <span>
                        {file.extension || 'archivo'} ·{' '}
                        {file.tipo_archivo || 'tipo no definido'}
                      </span>
                    </div>

                    <a
                      className="gd-link-button"
                      href={getFileDownloadUrl(file.id)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Descargar
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>

        <footer className="gd-document-modal__footer">
          <button className="gd-button" type="button" onClick={onClose}>
            Cerrar
          </button>

          <button
            className="gd-button"
            type="button"
            onClick={onGoToDocuments}
          >
            Administrar documentos
          </button>

          <button
            className="gd-button gd-button--primary"
            type="button"
            onClick={onGoToFiles}
          >
            Subir archivo
          </button>
        </footer>
      </section>
    </div>
  );
}
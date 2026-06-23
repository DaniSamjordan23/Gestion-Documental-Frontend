import { useEffect, useMemo, useState } from 'react';

import { getDocuments } from '../services/documents.service';
import {
  deleteFile,
  getFileDownloadUrl,
  getFiles,
  uploadFile,
} from '../services/files.service';

const initialFormState = {
  documento_id: '',
  archivo: null,
};

function normalizeText(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function formatFileSize(size) {
  const numericSize = Number(size || 0);

  if (numericSize < 1024) {
    return `${numericSize} B`;
  }

  if (numericSize < 1024 * 1024) {
    return `${(numericSize / 1024).toFixed(2)} KB`;
  }

  return `${(numericSize / (1024 * 1024)).toFixed(2)} MB`;
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}

export default function FilesPage() {
  const [documents, setDocuments] = useState([]);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [search, setSearch] = useState('');
  const [documentFilter, setDocumentFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [documentsResponse, filesResponse] = await Promise.all([
        getDocuments(),
        getFiles(),
      ]);

      setDocuments(documentsResponse.data || []);
      setFiles(filesResponse.data || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredFiles = useMemo(() => {
    const normalizedSearch = normalizeText(search.trim());

    return files.filter((file) => {
      const matchesSearch = normalizedSearch
        ? normalizeText(
            `${file.nombre_original || ''} ${file.extension || ''}`
          ).includes(normalizedSearch)
        : true;

      const matchesDocument = documentFilter
        ? Number(file.documento_id) === Number(documentFilter)
        : true;

      return matchesSearch && matchesDocument;
    });
  }, [search, documentFilter, files]);

  function handleDocumentChange(event) {
    setFormData((currentData) => ({
      ...currentData,
      documento_id: event.target.value,
    }));
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] || null;

    setFormData((currentData) => ({
      ...currentData,
      archivo: selectedFile,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setMessage('');
    setError('');

    try {
      if (!formData.documento_id) {
        throw new Error('Debe seleccionar un documento.');
      }

      if (!formData.archivo) {
        throw new Error('Debe seleccionar un archivo.');
      }

      await uploadFile(formData.documento_id, formData.archivo);

      setMessage('Archivo subido correctamente.');
      setFormData(initialFormState);

      event.target.reset();

      await loadData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(file) {
    const confirmDelete = window.confirm(
      `¿Seguro que deseas eliminar el archivo "${file.nombre_original}"?`
    );

    if (!confirmDelete) {
      return;
    }

    setMessage('');
    setError('');

    try {
      await deleteFile(file.id);
      setMessage('Archivo eliminado correctamente.');
      await loadData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return (
    <section className="gd-page">
      <header className="gd-page__header">
        <div>
          <p className="gd-page__eyebrow">Administración</p>
          <h1>Archivos</h1>
          <p>
            Sube, consulta, descarga y administra archivos asociados a los
            documentos.
          </p>
        </div>
      </header>

      <div className="gd-grid">
        <form className="gd-card gd-form" onSubmit={handleSubmit}>
          <div className="gd-card__header">
            <div>
              <h2>Subir archivo</h2>
              <p>
                Selecciona un documento y adjunta el archivo correspondiente.
              </p>
            </div>
          </div>

          <label>
            Documento
            <select
              name="documento_id"
              value={formData.documento_id}
              onChange={handleDocumentChange}
              required
            >
              <option value="">Seleccione un documento</option>

              {documents.map((documentItem) => (
                <option key={documentItem.id} value={documentItem.id}>
                  {documentItem.codigo
                    ? `${documentItem.codigo} - ${documentItem.nombre}`
                    : documentItem.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Archivo
            <input
              name="archivo"
              type="file"
              onChange={handleFileChange}
              required
            />
          </label>

          {formData.archivo && (
            <p className="gd-file-preview">
              Archivo seleccionado:{' '}
              <strong>{formData.archivo.name}</strong>
            </p>
          )}

          <div className="gd-actions">
            <button
              className="gd-button gd-button--primary"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Subiendo...' : 'Subir archivo'}
            </button>
          </div>

          {message && <p className="gd-alert gd-alert--success">{message}</p>}
          {error && <p className="gd-alert gd-alert--error">{error}</p>}
        </form>

        <div className="gd-card">
          <div className="gd-card__header gd-card__header--split">
            <div>
              <h2>Archivos registrados</h2>
              <p>{files.length} archivo(s) disponibles.</p>
            </div>

            <div className="gd-filters">
              <input
                className="gd-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar archivo..."
              />

              <select
                className="gd-search"
                value={documentFilter}
                onChange={(event) => setDocumentFilter(event.target.value)}
              >
                <option value="">Todos los documentos</option>

                {documents.map((documentItem) => (
                  <option key={documentItem.id} value={documentItem.id}>
                    {documentItem.codigo
                      ? `${documentItem.codigo} - ${documentItem.nombre}`
                      : documentItem.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="gd-empty">Cargando archivos...</p>
          ) : filteredFiles.length === 0 ? (
            <p className="gd-empty">No se encontraron archivos.</p>
          ) : (
            <div className="gd-table-wrap">
              <table className="gd-table">
                <thead>
                  <tr>
                    <th>Archivo</th>
                    <th>Documento</th>
                    <th>Tipo</th>
                    <th>Extensión</th>
                    <th>Tamaño</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredFiles.map((file) => (
                    <tr key={file.id}>
                      <td>{file.nombre_original}</td>
                      <td>
                        {file.documento_codigo
                          ? `${file.documento_codigo} - ${file.documento_nombre}`
                          : file.documento_nombre || 'Sin documento'}
                      </td>
                      <td>{file.tipo_archivo || 'No definido'}</td>
                      <td>{file.extension || 'N/A'}</td>
                      <td>{formatFileSize(file.tamano_archivo)}</td>
                      <td>
                        <span className="gd-status">
                          {file.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="gd-table-actions">
                          <a
                            className="gd-link-button"
                            href={getFileDownloadUrl(file.id)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Descargar
                          </a>

                          <button
                            className="gd-link-button gd-link-button--danger"
                            type="button"
                            onClick={() => handleDelete(file)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
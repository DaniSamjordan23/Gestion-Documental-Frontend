import { useEffect, useMemo, useState } from 'react';

import { getDocumentTypes } from '../services/documentTypes.service';
import {
  createDocument,
  deleteDocument,
  getDocuments,
  updateDocument,
} from '../services/documents.service';

const initialFormState = {
  tipo_documento_id: '',
  codigo: '',
  nombre: '',
  version: '1',
  descripcion: '',
};

function normalizeText(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}

export default function DocumentsPage() {
  const [documentTypes, setDocumentTypes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingDocument, setEditingDocument] = useState(null);
  const [search, setSearch] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [documentTypesResponse, documentsResponse] = await Promise.all([
        getDocumentTypes(),
        getDocuments(),
      ]);

      setDocumentTypes(documentTypesResponse.data || []);
      setDocuments(documentsResponse.data || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = normalizeText(search.trim());

    return documents.filter((documentItem) => {
      const matchesSearch = normalizedSearch
        ? normalizeText(
            `${documentItem.codigo || ''} ${documentItem.nombre || ''}`
          ).includes(normalizedSearch)
        : true;

      const matchesDocumentType = documentTypeFilter
        ? Number(documentItem.tipo_documento_id) === Number(documentTypeFilter)
        : true;

      return matchesSearch && matchesDocumentType;
    });
  }, [search, documentTypeFilter, documents]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleEdit(documentItem) {
    setEditingDocument(documentItem);

    setFormData({
      tipo_documento_id: String(documentItem.tipo_documento_id || ''),
      codigo: documentItem.codigo || '',
      nombre: documentItem.nombre || '',
      version: documentItem.version || '1',
      descripcion: documentItem.descripcion || '',
    });

    setMessage('');
    setError('');
  }

  function handleCancelEdit() {
    setEditingDocument(null);
    setFormData(initialFormState);
    setMessage('');
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        tipo_documento_id: Number(formData.tipo_documento_id),
        codigo: formData.codigo.trim(),
        nombre: formData.nombre.trim(),
        version: formData.version.trim() || '1',
        descripcion: formData.descripcion.trim(),
      };

      if (editingDocument) {
        await updateDocument(editingDocument.id, payload);
        setMessage('Documento actualizado correctamente.');
      } else {
        await createDocument(payload);
        setMessage('Documento creado correctamente.');
      }

      setFormData(initialFormState);
      setEditingDocument(null);
      await loadData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(documentItem) {
    const confirmDelete = window.confirm(
      `¿Seguro que deseas eliminar el documento "${documentItem.nombre}"?`
    );

    if (!confirmDelete) {
      return;
    }

    setMessage('');
    setError('');

    try {
      await deleteDocument(documentItem.id);
      setMessage('Documento eliminado correctamente.');
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
          <h1>Documentos</h1>
          <p>
            Gestiona los documentos y relaciónalos con un tipo de documento.
          </p>
        </div>
      </header>

      <div className="gd-grid">
        <form className="gd-card gd-form" onSubmit={handleSubmit}>
          <div className="gd-card__header">
            <div>
              <h2>
                {editingDocument ? 'Editar documento' : 'Registrar documento'}
              </h2>
              <p>
                Selecciona un tipo de documento y registra la información
                documental.
              </p>
            </div>

            {editingDocument && (
              <span className="gd-badge">ID {editingDocument.id}</span>
            )}
          </div>

          <label>
            Tipo de documento
            <select
              name="tipo_documento_id"
              value={formData.tipo_documento_id}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un tipo</option>

              {documentTypes.map((documentType) => (
                <option key={documentType.id} value={documentType.id}>
                  {documentType.categoria_nombre &&
                  documentType.subcategoria_nombre
                    ? `${documentType.categoria_nombre} / ${documentType.subcategoria_nombre} / ${documentType.nombre}`
                    : documentType.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Código
            <input
              name="codigo"
              type="text"
              value={formData.codigo}
              onChange={handleChange}
              placeholder="Ej. DOC-001"
              required
            />
          </label>

          <label>
            Nombre
            <input
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. Manual de calidad"
              required
            />
          </label>

          <label>
            Versión
            <input
              name="version"
              type="text"
              value={formData.version}
              onChange={handleChange}
              placeholder="Ej. 1"
            />
          </label>

          <label>
            Descripción
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción opcional"
              rows="4"
            />
          </label>

          <div className="gd-actions">
            <button
              className="gd-button gd-button--primary"
              type="submit"
              disabled={saving}
            >
              {saving
                ? 'Guardando...'
                : editingDocument
                  ? 'Actualizar documento'
                  : 'Crear documento'}
            </button>

            {editingDocument && (
              <button
                className="gd-button"
                type="button"
                onClick={handleCancelEdit}
              >
                Cancelar
              </button>
            )}
          </div>

          {message && <p className="gd-alert gd-alert--success">{message}</p>}
          {error && <p className="gd-alert gd-alert--error">{error}</p>}
        </form>

        <div className="gd-card">
          <div className="gd-card__header gd-card__header--split">
            <div>
              <h2>Documentos registrados</h2>
              <p>{documents.length} documento(s) disponibles.</p>
            </div>

            <div className="gd-filters">
              <input
                className="gd-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar documento..."
              />

              <select
                className="gd-search"
                value={documentTypeFilter}
                onChange={(event) => setDocumentTypeFilter(event.target.value)}
              >
                <option value="">Todos los tipos</option>

                {documentTypes.map((documentType) => (
                  <option key={documentType.id} value={documentType.id}>
                    {documentType.categoria_nombre &&
                    documentType.subcategoria_nombre
                      ? `${documentType.categoria_nombre} / ${documentType.subcategoria_nombre} / ${documentType.nombre}`
                      : documentType.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="gd-empty">Cargando documentos...</p>
          ) : filteredDocuments.length === 0 ? (
            <p className="gd-empty">No se encontraron documentos.</p>
          ) : (
            <div className="gd-table-wrap">
              <table className="gd-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Documento</th>
                    <th>Versión</th>
                    <th>Tipo</th>
                    <th>Subcategoría</th>
                    <th>Categoría</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDocuments.map((documentItem) => (
                    <tr key={documentItem.id}>
                      <td>{documentItem.codigo}</td>
                      <td>{documentItem.nombre}</td>
                      <td>{documentItem.version || '1'}</td>
                      <td>
                        {documentItem.tipo_documento_nombre || 'Sin tipo'}
                      </td>
                      <td>
                        {documentItem.subcategoria_nombre ||
                          'Sin subcategoría'}
                      </td>
                      <td>
                        {documentItem.categoria_nombre || 'Sin categoría'}
                      </td>
                      <td>
                        <span className="gd-status">
                          {documentItem.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="gd-table-actions">
                          <button
                            className="gd-link-button"
                            type="button"
                            onClick={() => handleEdit(documentItem)}
                          >
                            Editar
                          </button>

                          <button
                            className="gd-link-button gd-link-button--danger"
                            type="button"
                            onClick={() => handleDelete(documentItem)}
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
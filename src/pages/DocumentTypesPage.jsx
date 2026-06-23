import { useEffect, useMemo, useState } from 'react';

import { getSubcategories } from '../services/subcategories.service';
import {
  createDocumentType,
  deleteDocumentType,
  getDocumentTypes,
  updateDocumentType,
} from '../services/documentTypes.service';

const initialFormState = {
  subcategoria_id: '',
  nombre: '',
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

export default function DocumentTypesPage() {
  const [subcategories, setSubcategories] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingDocumentType, setEditingDocumentType] = useState(null);
  const [search, setSearch] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [subcategoriesResponse, documentTypesResponse] = await Promise.all([
        getSubcategories(),
        getDocumentTypes(),
      ]);

      setSubcategories(subcategoriesResponse.data || []);
      setDocumentTypes(documentTypesResponse.data || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredDocumentTypes = useMemo(() => {
    const normalizedSearch = normalizeText(search.trim());

    return documentTypes.filter((documentType) => {
      const matchesSearch = normalizedSearch
        ? normalizeText(documentType.nombre).includes(normalizedSearch)
        : true;

      const matchesSubcategory = subcategoryFilter
        ? Number(documentType.subcategoria_id) === Number(subcategoryFilter)
        : true;

      return matchesSearch && matchesSubcategory;
    });
  }, [search, subcategoryFilter, documentTypes]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleEdit(documentType) {
    setEditingDocumentType(documentType);

    setFormData({
      subcategoria_id: String(documentType.subcategoria_id || ''),
      nombre: documentType.nombre || '',
      descripcion: documentType.descripcion || '',
    });

    setMessage('');
    setError('');
  }

  function handleCancelEdit() {
    setEditingDocumentType(null);
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
        subcategoria_id: Number(formData.subcategoria_id),
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
      };

      if (editingDocumentType) {
        await updateDocumentType(editingDocumentType.id, payload);
        setMessage('Tipo de documento actualizado correctamente.');
      } else {
        await createDocumentType(payload);
        setMessage('Tipo de documento creado correctamente.');
      }

      setFormData(initialFormState);
      setEditingDocumentType(null);
      await loadData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(documentType) {
    const confirmDelete = window.confirm(
      `¿Seguro que deseas eliminar el tipo de documento "${documentType.nombre}"?`
    );

    if (!confirmDelete) {
      return;
    }

    setMessage('');
    setError('');

    try {
      await deleteDocumentType(documentType.id);
      setMessage('Tipo de documento eliminado correctamente.');
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
          <h1>Tipos de documento</h1>
          <p>
            Gestiona los tipos de documento y relaciónalos con una subcategoría.
          </p>
        </div>
      </header>

      <div className="gd-grid">
        <form className="gd-card gd-form" onSubmit={handleSubmit}>
          <div className="gd-card__header">
            <div>
              <h2>
                {editingDocumentType
                  ? 'Editar tipo de documento'
                  : 'Registrar tipo de documento'}
              </h2>
              <p>
                Selecciona una subcategoría padre y registra el tipo de
                documento correspondiente.
              </p>
            </div>

            {editingDocumentType && (
              <span className="gd-badge">ID {editingDocumentType.id}</span>
            )}
          </div>

          <label>
            Subcategoría padre
            <select
              name="subcategoria_id"
              value={formData.subcategoria_id}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una subcategoría</option>

              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.categoria_nombre
                    ? `${subcategory.categoria_nombre} / ${subcategory.nombre}`
                    : subcategory.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Nombre
            <input
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. Manuales"
              required
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
                : editingDocumentType
                  ? 'Actualizar tipo'
                  : 'Crear tipo'}
            </button>

            {editingDocumentType && (
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
              <h2>Tipos registrados</h2>
              <p>{documentTypes.length} tipo(s) de documento disponibles.</p>
            </div>

            <div className="gd-filters">
              <input
                className="gd-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar tipo..."
              />

              <select
                className="gd-search"
                value={subcategoryFilter}
                onChange={(event) => setSubcategoryFilter(event.target.value)}
              >
                <option value="">Todas las subcategorías</option>

                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.categoria_nombre
                      ? `${subcategory.categoria_nombre} / ${subcategory.nombre}`
                      : subcategory.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="gd-empty">Cargando tipos de documento...</p>
          ) : filteredDocumentTypes.length === 0 ? (
            <p className="gd-empty">No se encontraron tipos de documento.</p>
          ) : (
            <div className="gd-table-wrap">
              <table className="gd-table">
                <thead>
                  <tr>
                    <th>Tipo de documento</th>
                    <th>Subcategoría</th>
                    <th>Categoría</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDocumentTypes.map((documentType) => (
                    <tr key={documentType.id}>
                      <td>{documentType.nombre}</td>
                      <td>
                        {documentType.subcategoria_nombre ||
                          'Sin subcategoría'}
                      </td>
                      <td>
                        {documentType.categoria_nombre || 'Sin categoría'}
                      </td>
                      <td>{documentType.descripcion || 'Sin descripción'}</td>
                      <td>
                        <span className="gd-status">
                          {documentType.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="gd-table-actions">
                          <button
                            className="gd-link-button"
                            type="button"
                            onClick={() => handleEdit(documentType)}
                          >
                            Editar
                          </button>

                          <button
                            className="gd-link-button gd-link-button--danger"
                            type="button"
                            onClick={() => handleDelete(documentType)}
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
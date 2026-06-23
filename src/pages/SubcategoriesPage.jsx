import { useEffect, useMemo, useState } from 'react';

import { getCategories } from '../services/categories.service';
import {
  createSubcategory,
  deleteSubcategory,
  getSubcategories,
  updateSubcategory,
} from '../services/subcategories.service';

const initialFormState = {
  categoria_id: '',
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

export default function SubcategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [categoriesResponse, subcategoriesResponse] = await Promise.all([
        getCategories(),
        getSubcategories(),
      ]);

      setCategories(categoriesResponse.data || []);
      setSubcategories(subcategoriesResponse.data || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredSubcategories = useMemo(() => {
    const normalizedSearch = normalizeText(search.trim());

    return subcategories.filter((subcategory) => {
      const matchesSearch = normalizedSearch
        ? normalizeText(subcategory.nombre).includes(normalizedSearch)
        : true;

      const matchesCategory = categoryFilter
        ? Number(subcategory.categoria_id) === Number(categoryFilter)
        : true;

      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter, subcategories]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleEdit(subcategory) {
    setEditingSubcategory(subcategory);

    setFormData({
      categoria_id: String(subcategory.categoria_id || ''),
      nombre: subcategory.nombre || '',
      descripcion: subcategory.descripcion || '',
    });

    setMessage('');
    setError('');
  }

  function handleCancelEdit() {
    setEditingSubcategory(null);
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
        categoria_id: Number(formData.categoria_id),
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
      };

      if (editingSubcategory) {
        await updateSubcategory(editingSubcategory.id, payload);
        setMessage('Subcategoría actualizada correctamente.');
      } else {
        await createSubcategory(payload);
        setMessage('Subcategoría creada correctamente.');
      }

      setFormData(initialFormState);
      setEditingSubcategory(null);
      await loadData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(subcategory) {
    const confirmDelete = window.confirm(
      `¿Seguro que deseas eliminar la subcategoría "${subcategory.nombre}"?`
    );

    if (!confirmDelete) {
      return;
    }

    setMessage('');
    setError('');

    try {
      await deleteSubcategory(subcategory.id);
      setMessage('Subcategoría eliminada correctamente.');
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
          <h1>Subcategorías</h1>
          <p>
            Gestiona las subcategorías y relaciónalas con una categoría
            principal.
          </p>
        </div>
      </header>

      <div className="gd-grid">
        <form className="gd-card gd-form" onSubmit={handleSubmit}>
          <div className="gd-card__header">
            <div>
              <h2>
                {editingSubcategory
                  ? 'Editar subcategoría'
                  : 'Registrar subcategoría'}
              </h2>
              <p>
                Selecciona una categoría padre y registra la subcategoría
                correspondiente.
              </p>
            </div>

            {editingSubcategory && (
              <span className="gd-badge">ID {editingSubcategory.id}</span>
            )}
          </div>

          <label>
            Categoría padre
            <select
              name="categoria_id"
              value={formData.categoria_id}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una categoría</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nombre}
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
              placeholder="Ej. Documentos internos"
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
                : editingSubcategory
                  ? 'Actualizar subcategoría'
                  : 'Crear subcategoría'}
            </button>

            {editingSubcategory && (
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
              <h2>Subcategorías registradas</h2>
              <p>{subcategories.length} subcategoría(s) disponibles.</p>
            </div>

            <div className="gd-filters">
              <input
                className="gd-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar subcategoría..."
              />

              <select
                className="gd-search"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="">Todas las categorías</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="gd-empty">Cargando subcategorías...</p>
          ) : filteredSubcategories.length === 0 ? (
            <p className="gd-empty">No se encontraron subcategorías.</p>
          ) : (
            <div className="gd-table-wrap">
              <table className="gd-table">
                <thead>
                  <tr>
                    <th>Subcategoría</th>
                    <th>Categoría padre</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSubcategories.map((subcategory) => (
                    <tr key={subcategory.id}>
                      <td>{subcategory.nombre}</td>
                      <td>{subcategory.categoria_nombre || 'Sin categoría'}</td>
                      <td>{subcategory.descripcion || 'Sin descripción'}</td>
                      <td>
                        <span className="gd-status">
                          {subcategory.estado ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td>
                        <div className="gd-table-actions">
                          <button
                            className="gd-link-button"
                            type="button"
                            onClick={() => handleEdit(subcategory)}
                          >
                            Editar
                          </button>

                          <button
                            className="gd-link-button gd-link-button--danger"
                            type="button"
                            onClick={() => handleDelete(subcategory)}
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
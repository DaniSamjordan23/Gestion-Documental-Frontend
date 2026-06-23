import { useEffect, useMemo, useState } from 'react';

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../services/categories.service';

const initialFormState = {
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingCategory, setEditingCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadCategories() {
    setLoading(true);
    setError('');

    try {
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = normalizeText(search.trim());

    if (!normalizedSearch) {
      return categories;
    }

    return categories.filter((category) =>
      normalizeText(category.nombre).includes(normalizedSearch)
    );
  }, [search, categories]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleEdit(category) {
    setEditingCategory(category);

    setFormData({
      nombre: category.nombre || '',
      descripcion: category.descripcion || '',
    });

    setMessage('');
    setError('');
  }

  function handleCancelEdit() {
    setEditingCategory(null);
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
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        setMessage('Categoría actualizada correctamente.');
      } else {
        await createCategory(payload);
        setMessage('Categoría creada correctamente.');
      }

      setFormData(initialFormState);
      setEditingCategory(null);
      await loadCategories();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category) {
    const confirmDelete = window.confirm(
      `¿Seguro que deseas eliminar la categoría "${category.nombre}"?`
    );

    if (!confirmDelete) {
      return;
    }

    setMessage('');
    setError('');

    try {
      await deleteCategory(category.id);
      setMessage('Categoría eliminada correctamente.');
      await loadCategories();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return (
    <section className="gd-page">
      <header className="gd-page__header">
        <div>
          <p className="gd-page__eyebrow">Administración</p>
          <h1>Categorías</h1>
          <p>Gestiona las categorías principales del sistema documental.</p>
        </div>
      </header>

      <div className="gd-grid">
        <form className="gd-card gd-form" onSubmit={handleSubmit}>
          <div className="gd-card__header">
            <div>
              <h2>
                {editingCategory ? 'Editar categoría' : 'Registrar categoría'}
              </h2>
              <p>
                Crea o actualiza las categorías principales que agruparán las
                subcategorías del sistema.
              </p>
            </div>

            {editingCategory && (
              <span className="gd-badge">ID {editingCategory.id}</span>
            )}
          </div>

          <label>
            Nombre
            <input
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. Calidad"
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
                : editingCategory
                  ? 'Actualizar categoría'
                  : 'Crear categoría'}
            </button>

            {editingCategory && (
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
              <h2>Categorías registradas</h2>
              <p>{categories.length} categoría(s) disponibles.</p>
            </div>

            <input
              className="gd-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar categoría..."
            />
          </div>

          {loading ? (
            <p className="gd-empty">Cargando categorías...</p>
          ) : filteredCategories.length === 0 ? (
            <p className="gd-empty">No se encontraron categorías.</p>
          ) : (
            <div className="gd-table-wrap">
              <table className="gd-table">
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.nombre}</td>
                      <td>{category.descripcion || 'Sin descripción'}</td>
                      <td>
                        <span className="gd-status">
                          {category.estado ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td>
                        <div className="gd-table-actions">
                          <button
                            className="gd-link-button"
                            type="button"
                            onClick={() => handleEdit(category)}
                          >
                            Editar
                          </button>

                          <button
                            className="gd-link-button gd-link-button--danger"
                            type="button"
                            onClick={() => handleDelete(category)}
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
import { useEffect, useMemo, useState } from 'react';

import { getCategories } from '../services/categories.service';
import { getSubcategories } from '../services/subcategories.service';
import { getDocumentTypes } from '../services/documentTypes.service';
import { getDocuments } from '../services/documents.service';
import { getFiles, getFileDownloadUrl } from '../services/files.service';
import { searchGlobal } from '../services/search.service';

function normalizeText(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}

function buildUserTree({
  categories,
  subcategories,
  documentTypes,
  documents,
  files,
}) {
  return categories.map((category) => {
    const categorySubcategories = subcategories
      .filter((subcategory) => Number(subcategory.categoria_id) === Number(category.id))
      .map((subcategory) => {
        const subcategoryDocumentTypes = documentTypes
          .filter(
            (documentType) =>
              Number(documentType.subcategoria_id) === Number(subcategory.id)
          )
          .map((documentType) => {
            const typeDocuments = documents
              .filter(
                (documentItem) =>
                  Number(documentItem.tipo_documento_id) === Number(documentType.id)
              )
              .map((documentItem) => {
                const documentFiles = files.filter(
                  (file) => Number(file.documento_id) === Number(documentItem.id)
                );

                return {
                  ...documentItem,
                  files: documentFiles,
                };
              });

            return {
              ...documentType,
              documents: typeDocuments,
            };
          });

        return {
          ...subcategory,
          documentTypes: subcategoryDocumentTypes,
        };
      });

    return {
      ...category,
      subcategories: categorySubcategories,
    };
  });
}

export default function UserDocumentsPage() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [files, setFiles] = useState([]);

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [openCategoryId, setOpenCategoryId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [
        categoriesResponse,
        subcategoriesResponse,
        documentTypesResponse,
        documentsResponse,
        filesResponse,
      ] = await Promise.all([
        getCategories(),
        getSubcategories(),
        getDocumentTypes(),
        getDocuments(),
        getFiles(),
      ]);

      const loadedCategories = categoriesResponse.data || [];

      setCategories(loadedCategories);
      setSubcategories(subcategoriesResponse.data || []);
      setDocumentTypes(documentTypesResponse.data || []);
      setDocuments(documentsResponse.data || []);
      setFiles(filesResponse.data || []);

      if (loadedCategories.length > 0) {
        setOpenCategoryId(loadedCategories[0].id);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const documentTree = useMemo(() => {
    return buildUserTree({
      categories,
      subcategories,
      documentTypes,
      documents,
      files,
    });
  }, [categories, subcategories, documentTypes, documents, files]);

  const filteredTree = useMemo(() => {
    const normalizedSearch = normalizeText(search.trim());

    if (!normalizedSearch) {
      return documentTree;
    }

    return documentTree
      .map((category) => {
        const categoryMatches = normalizeText(category.nombre).includes(
          normalizedSearch
        );

        const filteredSubcategories = category.subcategories
          .map((subcategory) => {
            const subcategoryMatches = normalizeText(subcategory.nombre).includes(
              normalizedSearch
            );

            const filteredDocumentTypes = subcategory.documentTypes
              .map((documentType) => {
                const documentTypeMatches = normalizeText(
                  documentType.nombre
                ).includes(normalizedSearch);

                const filteredDocuments = documentType.documents
                  .map((documentItem) => {
                    const documentMatches = normalizeText(
                      `${documentItem.codigo || ''} ${documentItem.nombre || ''}`
                    ).includes(normalizedSearch);

                    const filteredFiles = documentItem.files.filter((file) =>
                      normalizeText(file.nombre_original).includes(
                        normalizedSearch
                      )
                    );

                    if (documentMatches || filteredFiles.length > 0) {
                      return {
                        ...documentItem,
                        files:
                          filteredFiles.length > 0
                            ? filteredFiles
                            : documentItem.files,
                      };
                    }

                    return null;
                  })
                  .filter(Boolean);

                if (documentTypeMatches || filteredDocuments.length > 0) {
                  return {
                    ...documentType,
                    documents:
                      filteredDocuments.length > 0
                        ? filteredDocuments
                        : documentType.documents,
                  };
                }

                return null;
              })
              .filter(Boolean);

            if (subcategoryMatches || filteredDocumentTypes.length > 0) {
              return {
                ...subcategory,
                documentTypes:
                  filteredDocumentTypes.length > 0
                    ? filteredDocumentTypes
                    : subcategory.documentTypes,
              };
            }

            return null;
          })
          .filter(Boolean);

        if (categoryMatches || filteredSubcategories.length > 0) {
          return {
            ...category,
            subcategories:
              filteredSubcategories.length > 0
                ? filteredSubcategories
                : category.subcategories,
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [search, documentTree]);

  async function handleGlobalSearch(event) {
    event.preventDefault();

    const trimmedSearch = search.trim();

    if (!trimmedSearch) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setError('');

    try {
      const response = await searchGlobal(trimmedSearch);
      setSearchResults(response.data || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSearching(false);
    }
  }

  function handleClearSearch() {
    setSearch('');
    setSearchResults([]);
  }

  function toggleCategory(categoryId) {
    setOpenCategoryId((currentId) =>
      Number(currentId) === Number(categoryId) ? null : categoryId
    );
  }

  return (
    <section className="gd-user-page">
      <header className="gd-user-hero">
        <div>
          <p className="gd-user-hero__eyebrow">Gestión documental</p>
          <h1>Consulta de documentos</h1>
          <p>
            Explora categorías, subcategorías, documentos y archivos disponibles.
          </p>
        </div>
      </header>

      <form className="gd-user-search" onSubmit={handleGlobalSearch}>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar documento, código, archivo, categoría..."
        />

        <button className="gd-button gd-button--primary" type="submit">
          {searching ? 'Buscando...' : 'Buscar'}
        </button>

        {(search || searchResults.length > 0) && (
          <button className="gd-button" type="button" onClick={handleClearSearch}>
            Limpiar
          </button>
        )}
      </form>

      {error && <p className="gd-alert gd-alert--error">{error}</p>}

      {searchResults.length > 0 && (
        <div className="gd-user-results">
          <div className="gd-card__header">
            <div>
              <h2>Resultados de búsqueda</h2>
              <p>{searchResults.length} resultado(s) encontrados.</p>
            </div>
          </div>

          <div className="gd-search-results">
            {searchResults.map((result) => (
              <article
                className="gd-search-result"
                key={`${result.tipo}-${result.id}`}
              >
                <span className="gd-badge">{result.tipo}</span>
                <h3>{result.nombre}</h3>
                <p>{result.ruta}</p>
              </article>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <p className="gd-empty">Cargando documentos...</p>
      ) : filteredTree.length === 0 ? (
        <p className="gd-empty">No se encontraron documentos.</p>
      ) : (
        <div className="gd-user-tree">
          {filteredTree.map((category) => {
            const isOpen = Number(openCategoryId) === Number(category.id);

            return (
              <article className="gd-user-category" key={category.id}>
                <button
                  className={
                    isOpen
                      ? 'gd-user-category__button gd-user-category__button--open'
                      : 'gd-user-category__button'
                  }
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                >
                  <span>{category.nombre}</span>
                  <small>{category.subcategories.length} subcategoría(s)</small>
                </button>

                {isOpen && (
                  <div className="gd-user-category__content">
                    {category.subcategories.length === 0 ? (
                      <p className="gd-empty">
                        Esta categoría no tiene subcategorías.
                      </p>
                    ) : (
                      category.subcategories.map((subcategory) => (
                        <section className="gd-user-subcategory" key={subcategory.id}>
                          <h2>{subcategory.nombre}</h2>

                          {subcategory.documentTypes.length === 0 ? (
                            <p className="gd-empty">
                              No hay tipos de documento registrados.
                            </p>
                          ) : (
                            subcategory.documentTypes.map((documentType) => (
                              <details
                                className="gd-user-document-type"
                                key={documentType.id}
                              >
                                <summary>
                                  <span>{documentType.nombre}</span>
                                  <small>
                                    {documentType.documents.length} documento(s)
                                  </small>
                                </summary>

                                {documentType.documents.length === 0 ? (
                                  <p className="gd-empty">
                                    No hay documentos disponibles.
                                  </p>
                                ) : (
                                  <div className="gd-user-document-list">
                                    {documentType.documents.map((documentItem) => (
                                      <article
                                        className="gd-user-document"
                                        key={documentItem.id}
                                      >
                                        <div>
                                          <strong>
                                            {documentItem.codigo} -{' '}
                                            {documentItem.nombre}
                                          </strong>
                                          <p>
                                            Versión {documentItem.version || '1'}
                                          </p>
                                        </div>

                                        {documentItem.files.length === 0 ? (
                                          <p className="gd-empty">
                                            Sin archivos disponibles.
                                          </p>
                                        ) : (
                                          <ul className="gd-user-file-list">
                                            {documentItem.files.map((file) => (
                                              <li key={file.id}>
                                                <span>
                                                  {file.nombre_original}
                                                </span>

                                                <a
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
                                    ))}
                                  </div>
                                )}
                              </details>
                            ))
                          )}
                        </section>
                      ))
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
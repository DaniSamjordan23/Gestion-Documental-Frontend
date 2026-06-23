import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../services/categories.service';
import { getSubcategories } from '../services/subcategories.service';
import { getDocumentTypes } from '../services/documentTypes.service';
import { getDocuments } from '../services/documents.service';
import { getFiles, getFileDownloadUrl } from '../services/files.service';
import { searchGlobal } from '../services/search.service';
import CategoryExplorer from '../components/documents/CategoryExplorer';
import QuickActions from '../components/documents/QuickActions';
import DocumentDetailModal from '../components/documents/DocumentDetailModal';
function normalizeText(text) {
    return String(text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function getErrorMessage(error) {
    return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}

function buildDocumentTree({
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
            total_subcategorias: categorySubcategories.length,
        };
    });
}

export default function AdminDocumentsPage() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [documentTypes, setDocumentTypes] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [files, setFiles] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState(null);

    const [activeCategoryId, setActiveCategoryId] = useState(null);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);

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
                setActiveCategoryId(loadedCategories[0].id);
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
        return buildDocumentTree({
            categories,
            subcategories,
            documentTypes,
            documents,
            files,
        });
    }, [categories, subcategories, documentTypes, documents, files]);

    const activeCategory = useMemo(() => {
        return documentTree.find(
            (category) => Number(category.id) === Number(activeCategoryId)
        );
    }, [documentTree, activeCategoryId]);

    async function handleSearchSubmit(event) {
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

    return (
        <section className="gd-page">
            <header className="gd-page__header">
                <div>
                    <p className="gd-page__eyebrow">Administración</p>
                    <h1>Administrar documentos</h1>
                    <p>
                        Explora categorías, subcategorías, tipos de documento, documentos y
                        archivos.
                    </p>
                </div>
            </header>

            <div className="gd-admin-documents">
                <form className="gd-admin-documents__search" onSubmit={handleSearchSubmit}>
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar categoría, subcategoría, tipo, documento o archivo..."
                    />

                    <button className="gd-button gd-button--primary" type="submit">
                        {searching ? 'Buscando...' : 'Buscar'}
                    </button>

                    {searchResults.length > 0 && (
                        <button className="gd-button" type="button" onClick={handleClearSearch}>
                            Limpiar
                        </button>
                    )}
                </form>
            /* AQUÍ VA QUICKACTIONS */
                <div className="gd-admin-documents">
                    <form className="gd-admin-documents__search" onSubmit={handleSearchSubmit}>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar categoría, subcategoría, tipo, documento o archivo..."
                        />

                        <button className="gd-button gd-button--primary" type="submit">
                            {searching ? 'Buscando...' : 'Buscar'}
                        </button>

                        {searchResults.length > 0 && (
                            <button className="gd-button" type="button" onClick={handleClearSearch}>
                                Limpiar
                            </button>
                        )}
                    </form>

                    <QuickActions onGoTo={navigate} />

                    {error && <p className="gd-alert gd-alert--error">{error}</p>}

                    {/* Luego sigue el resto del contenido */}
                </div>

                {error && <p className="gd-alert gd-alert--error">{error}</p>}

                {loading ? (
                    <p className="gd-empty">Cargando estructura documental...</p>
                ) : searchResults.length > 0 ? (
                    <div className="gd-card">
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
                ) : (
                    <div className="gd-admin-documents__layout">
                        <CategoryExplorer
                            categories={documentTree}
                            activeCategoryId={activeCategoryId}
                            onSelectCategory={setActiveCategoryId}
                        />

                        <div className="gd-card gd-document-panel">
                            {!activeCategory ? (
                                <p className="gd-empty">Seleccione una categoría.</p>
                            ) : (
                                <>
                                    <div className="gd-card__header">
                                        <div>
                                            <h2>{activeCategory.nombre}</h2>
                                            <p>
                                                {activeCategory.subcategories.length} subcategoría(s)
                                                relacionadas.
                                            </p>
                                        </div>
                                    </div>

                                    {activeCategory.subcategories.length === 0 ? (
                                        <p className="gd-empty">
                                            Esta categoría no tiene subcategorías.
                                        </p>
                                    ) : (
                                        <div className="gd-subcategory-list">
                                            {activeCategory.subcategories.map((subcategory) => (
                                                <article className="gd-subcategory-card" key={subcategory.id}>
                                                    <h3>{subcategory.nombre}</h3>
                                                    <p>{subcategory.descripcion || 'Sin descripción'}</p>

                                                    <div className="gd-subcategory-card__meta">
                                                        {subcategory.documentTypes.length} tipo(s) de
                                                        documento
                                                    </div>

                                                    {subcategory.documentTypes.length > 0 && (
                                                        <div className="gd-document-type-list">
                                                            {subcategory.documentTypes.map((documentType) => (
                                                                <details
                                                                    className="gd-document-type"
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
                                                                            No hay documentos en este tipo.
                                                                        </p>
                                                                    ) : (
                                                                        <div className="gd-document-list">
                                                                            {documentType.documents.map((documentItem) => (
                                                                                <article className="gd-document-card" key={documentItem.id}>
                                                                                    <div className="gd-document-card__header">
                                                                                        <div>
                                                                                            <strong>
                                                                                                {documentItem.codigo} - {documentItem.nombre}
                                                                                            </strong>
                                                                                            <p>Versión {documentItem.version || '1'}</p>
                                                                                        </div>

                                                                                        <button
                                                                                            className="gd-link-button"
                                                                                            type="button"
                                                                                            onClick={() => setSelectedDocument(documentItem)}
                                                                                        >
                                                                                            Ver detalle
                                                                                        </button>
                                                                                    </div>

                                                                                    {documentItem.files.length === 0 ? (
                                                                                        <p className="gd-empty">Sin archivos.</p>
                                                                                    ) : (
                                                                                        <ul className="gd-file-list">
                                                                                            {documentItem.files.map((file) => (
                                                                                                <li key={file.id}>
                                                                                                    <span>{file.nombre_original}</span>

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
                                                            ))}
                                                        </div>
                                                    )}
                                                </article>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <DocumentDetailModal
  documentItem={selectedDocument}
  onClose={() => setSelectedDocument(null)}
  onGoToDocuments={() => {
    setSelectedDocument(null);
    navigate('/admin/documentos');
  }}
  onGoToFiles={() => {
    setSelectedDocument(null);
    navigate('/admin/archivos');
  }}
/>
        </section>
    );
}
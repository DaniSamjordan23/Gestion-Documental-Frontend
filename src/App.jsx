import { Navigate, Route, Routes } from 'react-router-dom';

import AdminLayout from './components/layout/AdminLayout';

import CategoriesPage from './pages/CategoriesPage';
import SubcategoriesPage from './pages/SubcategoriesPage';
import DocumentTypesPage from './pages/DocumentTypesPage';
import DocumentsPage from './pages/DocumentsPage';
import FilesPage from './pages/FilesPage';
import AdminDocumentsPage from './pages/AdminDocumentsPage';
import UserDocumentsPage from './pages/UserDocumentsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/categorias" replace />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/categorias" replace />} />
        <Route path="categorias" element={<CategoriesPage />} />
        <Route path="subcategorias" element={<SubcategoriesPage />} />
        <Route path="tipos-documento" element={<DocumentTypesPage />} />
        <Route path="documentos" element={<DocumentsPage />} />
        <Route path="archivos" element={<FilesPage />} />
        <Route path="administrar-documentos" element={<AdminDocumentsPage />} />
      </Route>

      <Route path="/documentos" element={<UserDocumentsPage />} />

      <Route path="*" element={<Navigate to="/admin/categorias" replace />} />
    </Routes>
  );
}

export default App;
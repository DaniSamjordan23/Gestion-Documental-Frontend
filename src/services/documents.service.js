import { apiRequest } from './apiClient';

export function getDocuments() {
  return apiRequest('/documents');
}

export function getDocumentById(id) {
  return apiRequest(`/documents/${id}`);
}

export function getDocumentsByDocumentType(documentTypeId) {
  return apiRequest(`/document-types/${documentTypeId}/documents`);
}

export function createDocument(data) {
  return apiRequest('/documents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateDocument(id, data) {
  return apiRequest(`/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteDocument(id) {
  return apiRequest(`/documents/${id}`, {
    method: 'DELETE',
  });
}
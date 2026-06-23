import { apiRequest } from './apiClient';

export function getDocumentTypes() {
  return apiRequest('/document-types');
}

export function getDocumentTypeById(id) {
  return apiRequest(`/document-types/${id}`);
}

export function getDocumentTypesBySubcategory(subcategoryId) {
  return apiRequest(`/subcategories/${subcategoryId}/document-types`);
}

export function createDocumentType(data) {
  return apiRequest('/document-types', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateDocumentType(id, data) {
  return apiRequest(`/document-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteDocumentType(id) {
  return apiRequest(`/document-types/${id}`, {
    method: 'DELETE',
  });
}
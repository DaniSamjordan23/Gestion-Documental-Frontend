import { apiRequest } from './apiClient';

export function getSubcategories() {
  return apiRequest('/subcategories');
}

export function getSubcategoryById(id) {
  return apiRequest(`/subcategories/${id}`);
}

export function getSubcategoriesByCategory(categoryId) {
  return apiRequest(`/categories/${categoryId}/subcategories`);
}

export function createSubcategory(data) {
  return apiRequest('/subcategories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateSubcategory(id, data) {
  return apiRequest(`/subcategories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteSubcategory(id) {
  return apiRequest(`/subcategories/${id}`, {
    method: 'DELETE',
  });
}
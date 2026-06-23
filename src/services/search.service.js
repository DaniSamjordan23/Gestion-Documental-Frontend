import { apiRequest } from './apiClient';

export function searchGlobal(query) {
  return apiRequest(`/search?query=${encodeURIComponent(query)}`);
}
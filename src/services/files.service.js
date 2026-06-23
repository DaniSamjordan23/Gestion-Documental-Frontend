import { API_BASE_URL, apiRequest } from './apiClient';

export function getFiles() {
  return apiRequest('/files');
}

export function getFileById(id) {
  return apiRequest(`/files/${id}`);
}

export function getFilesByDocument(documentId) {
  return apiRequest(`/documents/${documentId}/files`);
}

export async function uploadFile(documentId, file) {
  const formData = new FormData();

  formData.append('archivo', file);

  const response = await fetch(
    `${API_BASE_URL}/documents/${documentId}/files`,
    {
      method: 'POST',
      body: formData,
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Error subiendo archivo.');
  }

  return data;
}

export function deleteFile(id) {
  return apiRequest(`/files/${id}`, {
    method: 'DELETE',
  });
}

export function getFileDownloadUrl(id) {
  return `${API_BASE_URL}/files/${id}/download`;
}
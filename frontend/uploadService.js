const BASE_URL = 'http://localhost:5000';

export async function uploadFileToServer(file) {
  const formData = new FormData();

  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/api/get-analytics-data`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return response.json();
}

const SERVER_URL = 'http://localhost:8080/dashboard-generator-1.0-SNAPSHOT';
const WS_URL = 'ws://localhost:8080/dashboard-generator-1.0-SNAPSHOT';

export async function analyzeFile(file, key) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${SERVER_URL}/api/analyze?jobId=${key}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  console.log('Generated Data: ', data);

  return data;
}

export function connectToWS(loader, status, key) {
  const socket = new WebSocket(WS_URL + '/ws/progress/' + key);

  socket.onmessage = function (event) {
    const {progress, message} = JSON.parse(event.data);
    loader.style.width = `${progress}%`;
    status.innerText = message;
  };

  return socket;
}

export async function getEmbedUrls(key, jobId) {
  const response = await fetch(`${SERVER_URL}/api/get-embed-urls?key=${key}&jobId=${jobId}`);

  if (!response.ok) {
    console.error(response);
    throw new Error('Failed to fetch embed URLs');
  }

  const data = await response.json();
  console.log('Fetched Data: ', data);

  return data;
}

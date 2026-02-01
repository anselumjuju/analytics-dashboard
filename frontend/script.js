import {analyzeFile, connectToWS, getEmbedUrls} from './server.js';

const BASE_URL = 'http://localhost:5500/frontend/index.html';

const DOM = {
  fileUpload: {
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    fileDisplayName: document.getElementById('uploaded-file-name'),
    fileUploadError: document.getElementById('file-upload-error'),
    beforeUpload: document.getElementById('upload-empty'),
    afterUpload: document.getElementById('upload-filled'),
  },
  iframeContainer: document.getElementById('iframe-container'),
  views: {
    upload: document.getElementById('upload-view'),
    progress: document.getElementById('progress-view'),
    dashboard: document.getElementById('dashboard-view'),
    error: document.getElementById('error-view'),
  },
  progress: {
    bar: document.getElementById('progress-bar-fill'),
    status: document.getElementById('progress-status'),
  },
  buttons: {
    removeFile: document.getElementById('remove-file-btn'),
    browse: document.getElementById('browse-btn'),
    generate: document.getElementById('generate-btn'),
    regenerate: document.getElementById('regenerate-btn'),
    share: document.getElementById('share-btn'),
    retry: document.getElementById('retry-btn'),
  },
};

const state = {
  selectedFile: null,
  isProcessing: false,
  shareLink: null,
};

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateButtons();
  const key = getkey();
  if (key != null) fetchDashboard(key);
});

function setupEventListeners() {
  DOM.fileUpload.dropZone.addEventListener('click', () => DOM.fileUpload.fileInput.click());

  // Drag and Drop
  DOM.fileUpload.dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    DOM.fileUpload.dropZone.classList.add('drag-over');
  });
  DOM.fileUpload.dropZone.addEventListener('dragleave', () => {
    DOM.fileUpload.dropZone.classList.remove('drag-over');
  });
  DOM.fileUpload.dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    DOM.fileUpload.dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });

  DOM.fileUpload.fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleFile(e.target.files[0]);
  });

  DOM.buttons.retry.addEventListener('click', resetUI);
  DOM.buttons.regenerate.addEventListener('click', resetUI);

  DOM.buttons.removeFile.addEventListener('click', removeFile);

  DOM.buttons.generate.addEventListener('click', generateDashboard);
  DOM.buttons.share.addEventListener('click', shareDashboard);
}

function updateButtons() {
  DOM.buttons.generate.disabled = state.isProcessing || !state.selectedFile;
  DOM.buttons.regenerate.disabled = state.isProcessing;
  DOM.buttons.share.disabled = state.isProcessing || !state.shareLink;
}

function handleFile(file) {
  if (!validateFile(file)) return;
  state.selectedFile = file;
  DOM.fileUpload.fileDisplayName.innerText = file.name;
  DOM.fileUpload.beforeUpload.classList.add('hidden');
  DOM.fileUpload.afterUpload.classList.remove('hidden');
  DOM.buttons.removeFile.classList.remove('hidden');
  DOM.fileUpload.fileUploadError.innerText = '';
  updateButtons();
}

function validateFile(file) {
  if (!file) return false;
  if (!file.name.endsWith('.csv')) {
    DOM.fileUpload.fileUploadError.innerText = 'Only CSV files are allowed.';
    return false;
  }

  if (file.size > 20 * 1024 * 1024) {
    DOM.fileUpload.fileUploadError.innerText = 'File size exceeds the limit.';
    return false;
  }
  return true;
}

function removeFile() {
  state.selectedFile = null;
  DOM.fileUpload.fileDisplayName.innerText = '';
  DOM.fileUpload.fileUploadError.innerText = '';
  DOM.fileUpload.fileInput.value = '';
  DOM.buttons.removeFile.classList.add('hidden');
  DOM.fileUpload.beforeUpload.classList.remove('hidden');
  DOM.fileUpload.afterUpload.classList.add('hidden');
  updateButtons();
}

// --- Core Logic ---

function resetUI() {
  state.selectedFile = null;
  state.isProcessing = false;

  DOM.fileUpload.fileInput.value = '';
  DOM.fileUpload.fileDisplayName.innerText = '';
  DOM.fileUpload.fileUploadError.innerText = '';

  DOM.fileUpload.beforeUpload.classList.remove('hidden');
  DOM.fileUpload.afterUpload.classList.add('hidden');
  DOM.buttons.removeFile.classList.add('hidden');

  DOM.progress.bar.style.width = '0%';
  DOM.progress.status.innerText = 'Analyzing your Dashboard...';

  DOM.iframeContainer.innerHTML = '';

  state.shareLink = null;

  switchView('upload');
  updateButtons();
}

async function generateDashboard() {
  if (!validateFile(state.selectedFile)) return;
  const uniqueKey = generateUniqueKey();
  state.isProcessing = true;
  updateButtons();

  switchView('progress');
  try {
    const socket = connectToWS(DOM.progress.bar, DOM.progress.status, uniqueKey);
    const data = await analyzeFile(state.selectedFile, uniqueKey);
    if (data.success == true) {
      displayReports(data.urls);
      state.shareLink = BASE_URL + '?key=' + data.key;
      socket.close();
    } else {
      socket.close();
      switchView('error');
    }
  } catch (err) {
    console.error(err);
    switchView('error');
  } finally {
    state.isProcessing = false;
    updateButtons();
  }
}

function switchView(viewName) {
  Object.values(DOM.views).forEach((view) => view.classList.add('hidden'));
  DOM.views[viewName].classList.remove('hidden');
}

async function shareDashboard() {
  try {
    if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(state.shareLink);
    DOM.buttons.share.innerText = 'Copied';
    setTimeout(() => (DOM.buttons.share.innerText = 'Share'), 2000);
  } catch {
    try {
      const input = document.createElement('textarea');
      input.value = state.shareLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
      DOM.buttons.share.innerText = 'Copied';
      setTimeout(() => (DOM.buttons.share.innerText = 'Share'), 2000);
    } catch {
      console.error(err);
    }
  }
}

function displayReports(urls) {
  DOM.iframeContainer.innerHTML = '';

  urls.forEach((url) => {
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.className = 'dashboard-card';
    iframe.loading = 'lazy';
    DOM.iframeContainer.appendChild(iframe);
  });

  updateButtons();
  switchView('dashboard');
}

function generateUniqueKey() {
  const uniqueId = crypto.randomUUID().replaceAll('-', '');
  return uniqueId;
}

function getkey() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('key');
}

async function fetchDashboard(key) {
  const uniqueKey = generateUniqueKey();
  state.isProcessing = true;
  updateButtons();

  switchView('progress');
  try {
    const socket = connectToWS(DOM.progress.bar, DOM.progress.status, uniqueKey);
    const data = await getEmbedUrls(key, uniqueKey);
    if (data.success == true) {
      displayReports(data.urls);
      state.shareLink = BASE_URL + '?key=' + data.key;
      socket.close();
    } else {
      socket.close();
      switchView('error');
    }
  } catch (err) {
    console.error(err);
    switchView('error');
  } finally {
    state.isProcessing = false;
    updateButtons();
  }
}

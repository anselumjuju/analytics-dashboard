import {uploadFileToServer} from './uploadService.js';

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');

  const uploadView = document.getElementById('upload-view');
  const progressView = document.getElementById('progress-view');
  const errorView = document.getElementById('error-view');
  const iframeView = document.getElementById('iframe-view');

  const progressFill = document.getElementById('progress-fill');
  const uploadPercent = document.getElementById('upload-percent');
  const uploadingFilename = document.getElementById('uploading-filename');
  const errorText = document.getElementById('error-text');
  const tryAgainBtn = document.getElementById('try-again-btn');
  const resetBtn = document.getElementById('reset-btn');
  const iframeContainer = document.getElementById('iframe-container');

  const MAX_SIZE_MB = 20;

  dropZone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleFile(e.target.files[0]);
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });

  tryAgainBtn.addEventListener('click', resetUI);
  resetBtn.addEventListener('click', resetUI);

  function handleFile(file) {
    if (!validateFile(file)) return;

    uploadView.classList.add('hidden');
    progressView.classList.remove('hidden');
    uploadingFilename.textContent = file.name;

    simulateProgress(file);
  }

  function validateFile(file) {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showError(`File exceeds ${MAX_SIZE_MB}MB limit.`);
      return false;
    }

    const validTypes = ['.csv', '.json'];
    const isValid = validTypes.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isValid) {
      showError('Only .csv and .json files allowed.');
      return false;
    }

    return true;
  }

  function simulateProgress(file) {
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 12;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        finishProcessing(file);
      }

      updateProgress(progress);
    }, 180);
  }

  function updateProgress(percent) {
    const val = Math.floor(percent);
    progressFill.style.width = `${val}%`;
    uploadPercent.textContent = `${val}%`;
  }

  async function finishProcessing(file) {
    try {
      const result = await uploadFileToServer(file);

      if (!result.urls || !Array.isArray(result.urls)) {
        throw new Error('Invalid response format');
      }

      renderIframes(result.urls);

      progressView.classList.add('hidden');
      iframeView.classList.remove('hidden');
    } catch (err) {
      showError(err.message);
    }
  }

  function renderIframes(urls) {
    iframeContainer.innerHTML = '';

    urls.forEach((url) => {
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.loading = 'lazy';
      iframeContainer.appendChild(iframe);
    });
  }

  function showError(msg) {
    uploadView.classList.add('hidden');
    progressView.classList.add('hidden');
    iframeView.classList.add('hidden');

    errorText.textContent = msg;
    errorView.classList.remove('hidden');
  }

  function resetUI() {
    fileInput.value = '';
    progressFill.style.width = '0%';
    uploadPercent.textContent = '0%';

    errorView.classList.add('hidden');
    iframeView.classList.add('hidden');
    uploadView.classList.remove('hidden');
  }
});

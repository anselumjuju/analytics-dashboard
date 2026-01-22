document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');

  // Views
  const uploadView = document.getElementById('upload-view');
  const progressView = document.getElementById('progress-view');
  const errorView = document.getElementById('error-view');
  const reportView = document.getElementById('report-view');

  // Action Elements
  const progressFill = document.getElementById('progress-fill');
  const uploadPercent = document.getElementById('upload-percent');
  const uploadingFilename = document.getElementById('uploading-filename');
  const errorText = document.getElementById('error-text');
  const tryAgainBtn = document.getElementById('try-again-btn');
  const resetBtn = document.getElementById('reset-btn');
  const metricsContainer = document.getElementById('metrics-container');
  const insightsList = document.getElementById('insights-list');

  // Constants
  const MAX_SIZE_MB = 20;

  // --- Interaction Logic ---

  // Trigger file selection
  dropZone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleFile(e.target.files[0]);
  });

  // Drag & Drop
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

  // Reset Buttons
  tryAgainBtn.addEventListener('click', resetUI);
  resetBtn.addEventListener('click', resetUI);

  // --- Core Logic ---

  function handleFile(file) {
    if (!validateFile(file)) return;

    // Switch to Progress UI
    uploadView.classList.add('hidden');
    progressView.classList.remove('hidden');
    uploadingFilename.textContent = file.name;

    // Simulate Upload
    simulateUpload(file);
  }

  function validateFile(file) {
    // Size Check
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showError(`File exceeds ${MAX_SIZE_MB}MB limit.`);
      return false;
    }

    // Type Check
    const validTypes = ['.csv', '.json'];
    const isExtValid = validTypes.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isExtValid) {
      showError('Only .csv and .json files are allowed.');
      return false;
    }
    return true;
  }

  function simulateUpload(file) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        // Finish "processing" delay
        setTimeout(() => finishProcessing(file), 500);
      }
      updateProgress(progress);
    }, 200);
  }

  function updateProgress(percent) {
    const val = Math.floor(percent);
    progressFill.style.width = `${val}%`;
    uploadPercent.textContent = `${val}%`;
  }

  function finishProcessing(file) {
    // MOCK DATA GENERATION
    // In real app, this comes from API response
    const mockData = {
      rows: Math.floor(Math.random() * 5000) + 100,
      columns: Math.floor(Math.random() * 20) + 5,
      size: formatBytes(file.size),
      type: file.name.split('.').pop().toUpperCase(),
    };

    renderReport(mockData);

    // Switch Views
    progressView.classList.add('hidden');
    reportView.classList.remove('hidden');
  }

  function renderReport(data) {
    // 1. Render Metric Cards
    metricsContainer.innerHTML = `
            <div class="metric-card">
                <div class="metric-label">File Size</div>
                <div class="metric-value">${data.size}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Row Count</div>
                <div class="metric-value">${data.rows.toLocaleString()}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Columns</div>
                <div class="metric-value">${data.columns}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Data Type</div>
                <div class="metric-value">${data.type}</div>
            </div>
        `;

    // 2. Render Insights List
    const insights = ['Data structure valid and consistent.', "3 outliers detected in 'Revenue' column.", 'Timestamps normalized to UTC.'];

    insightsList.innerHTML = insights.map((i) => `<li>${i}</li>`).join('');
  }

  function showError(msg) {
    uploadView.classList.add('hidden');
    progressView.classList.add('hidden');
    reportView.classList.add('hidden');

    errorText.textContent = msg;
    errorView.classList.remove('hidden');
  }

  function resetUI() {
    // Clear file input
    fileInput.value = '';
    progressFill.style.width = '0%';
    uploadPercent.textContent = '0%';

    errorView.classList.add('hidden');
    reportView.classList.add('hidden');
    uploadView.classList.remove('hidden');
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  }
});

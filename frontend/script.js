import {uploadFileToServer} from './uploadService.js';

const DOM = {
  container: document.getElementById('app-container'),
  dropZone: document.getElementById('drop-zone'),
  fileInput: document.getElementById('file-input'),
  views: {
    upload: document.getElementById('view-upload'),
    progress: document.getElementById('view-progress'),
    error: document.getElementById('view-error'),
    dashboard: document.getElementById('view-dashboard'),
  },
  progress: {
    fill: document.getElementById('progress-fill'),
    percent: document.getElementById('percent-display'),
    filename: document.getElementById('filename-display'),
  },
  error: {
    msg: document.getElementById('error-message'),
    retry: document.getElementById('retry-btn'),
  },
  dashboard: {
    container: document.getElementById('iframe-container'),
    reset: document.getElementById('reset-btn'),
    download: document.getElementById('download-btn'),
  },
};

const CONSTANTS = {
  MAX_MB: 20,
  ALLOWED_TYPES: ['csv', 'json'],
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
});

function setupEventListeners() {
  // Drag & Drop
  DOM.dropZone.addEventListener('click', () => DOM.fileInput.click());

  DOM.dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    DOM.dropZone.classList.add('drag-over');
  });

  DOM.dropZone.addEventListener('dragleave', () => {
    DOM.dropZone.classList.remove('drag-over');
  });

  DOM.dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    DOM.dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });

  // File Input
  DOM.fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleFile(e.target.files[0]);
  });

  // Buttons
  DOM.error.retry.addEventListener('click', resetUI);
  DOM.dashboard.reset.addEventListener('click', resetUI);
  DOM.dashboard.download.addEventListener('click', downloadReport);
}

// --- Core Logic ---

async function handleFile(file) {
  if (!validateFile(file)) return;

  switchView('progress');
  DOM.progress.filename.textContent = file.name;
  const progressInterval = startFakeProgress();

  try {
    const data = await uploadFileToServer(file);

    clearInterval(progressInterval);
    updateProgressBar(100);

    if (!data || !data.urls) {
      throw new Error('Server response missing "urls"');
    }

    renderDashboards(data.urls);

    setTimeout(() => switchView('dashboard'), 500);
  } catch (err) {
    // 5. Failure: Stop loader, show error
    clearInterval(progressInterval);
    console.error(err);
    DOM.error.msg.textContent = err.message || 'Failed to connect to server.';
    switchView('error');
  }
}

function validateFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (file.size > CONSTANTS.MAX_MB * 1024 * 1024) {
    alert(`File is too large. Max ${CONSTANTS.MAX_MB}MB.`);
    return false;
  }

  if (!CONSTANTS.ALLOWED_TYPES.includes(ext)) {
    alert('Invalid format. Please upload .CSV or .JSON');
    return false;
  }
  return true;
}

// --- View Management ---

function switchView(viewName) {
  Object.values(DOM.views).forEach((el) => el.classList.add('hidden'));
  if (viewName === 'dashboard') {
    DOM.container.classList.add('wide-mode');
  } else {
    DOM.container.classList.remove('wide-mode');
  }

  DOM.views[viewName].classList.remove('hidden');
}

function resetUI() {
  DOM.fileInput.value = '';
  updateProgressBar(0);
  DOM.dashboard.container.innerHTML = '';
  switchView('upload');
}

function updateProgressBar(percent) {
  const val = Math.min(percent, 100);
  DOM.progress.fill.style.width = `${val}%`;
  DOM.progress.percent.textContent = `${Math.round(val)}%`;
}

function renderDashboards(urls) {
  DOM.dashboard.container.innerHTML = '';

  urls.forEach((url) => {
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.className = 'dashboard-card';
    iframe.loading = 'lazy';
    DOM.dashboard.container.appendChild(iframe);
  });
}

function startFakeProgress() {
  let progress = 0;
  return setInterval(() => {
    if (progress < 90) {
      progress += Math.random() * 5;
      updateProgressBar(progress);
    }
  }, 200);
}

// Download Report

const downloadReport = async () => {
  const element = document.getElementById('view-dashboard');
  const canvas = await html2canvas(element, {scale: 2});

  const imgData = canvas.toDataURL('image/png');

  const {jsPDF} = window.jspdf;
  console.log(jsPDF);
  const pdf = new jsPDF('p', 'mm', 'a4');

  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();

  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  while (heightLeft > 0) {
    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;
    position -= pageHeight;
    if (heightLeft > 0) pdf.addPage();
  }

  pdf.save('output.pdf');
};

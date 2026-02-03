const BASE_URL = 'http://localhost:5500/frontend/index.html';
const SERVER_URL = 'http://localhost:8080/dashboard-generator-1.0-SNAPSHOT';
const WS_URL = 'ws://localhost:8080/dashboard-generator-1.0-SNAPSHOT';

class DashboardGenerator {
  constructor() {
    this.state = {
      selectedFile: null,
      isProcessing: false,
      shareLink: null,
    };

    this.init();
  }

  // Init
  init() {
    this.initDOM();

    this.setupEventListeners();
    this.updateButtons();
    const key = new URLSearchParams(window.location.search).get('key');
    if (key != null) this.fetchDashboard(key);
  }

  // initializeDOM
  initDOM() {
    this.analyzeContainer = document.getElementById('analyze-container');

    // Views
    this.uploadView = this.analyzeContainer.firstElementChild;
    this.progressView = this.uploadView.nextElementSibling;
    this.dashboardView = this.progressView.nextElementSibling;
    this.errorView = this.dashboardView.nextElementSibling;

    // iFrame
    this.dashboardContainer = this.dashboardView.lastElementChild;
    this.iFrameContainer = this.dashboardContainer.lastElementChild;

    // Buttons
    this.buttons = this.analyzeContainer.getElementsByTagName('button');
    this.generateButton = this.buttons['generate-btn'];
    this.removeFileButton = this.buttons['remove-file-btn'];
    this.resetButton = this.buttons['reset-btn'];
    this.shareButton = this.buttons['share-btn'];
    this.retryButton = this.buttons['retry-btn'];

    // Progress
    this.progressContainer = this.progressView.lastElementChild;
    this.progressBarBg = this.progressContainer.firstElementChild;
    this.progressBar = this.progressBarBg.firstElementChild;
    this.progressStatus = this.progressBarBg.nextElementSibling;

    // File Upload
    this.uploadContainer = this.uploadView.children[1];
    this.dropZone = this.uploadContainer.firstElementChild;
    this.uploadEmpty = this.dropZone.firstElementChild;
    this.fileInput = this.uploadEmpty.firstElementChild;
    this.uploadFilled = this.dropZone.lastElementChild;
    this.fileNameField = this.uploadFilled.firstElementChild;
    this.fileError = this.dropZone.nextElementSibling.nextElementSibling;
  }

  // Event Listeners
  setupEventListeners() {
    this.dropZone.addEventListener('click', () => this.fileInput.click());

    this.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropZone.classList.add('drag-over');
    });
    this.dropZone.addEventListener('dragleave', () => this.dropZone.classList.remove('drag-over'));
    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropZone.classList.remove('drag-over');
      if (e.dataTransfer.files.length) this.handleFile(e.dataTransfer.files[0]);
    });

    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) this.handleFile(e.target.files[0]);
    });

    this.retryButton.addEventListener('click', () => this.resetUI());
    this.resetButton.addEventListener('click', () => this.resetUI());

    this.removeFileButton.addEventListener('click', () => this.resetUI());

    this.uploadView.addEventListener('submit', (e) => {
      e.preventDefault();
      this.generateDashboard();
    });
    this.shareButton.addEventListener('click', () => this.shareDashboard());
  }

  // Utilities
  updateButtons() {
    this.generateButton.disabled = this.state.isProcessing || !this.state.selectedFile;
    this.resetButton.disabled = this.state.isProcessing;
    this.shareButton.disabled = this.state.isProcessing || !this.state.shareLink;
  }

  switchView(viewName) {
    const views = {
      upload: this.uploadView,
      progress: this.progressView,
      dashboard: this.dashboardView,
      error: this.errorView,
    };
    Object.values(views).forEach((view) => view.classList.add('hidden'));
    views[viewName].classList.remove('hidden');
  }

  // Handling Files
  handleFile(file) {
    if (!this.validateFile(file)) return;
    this.state.selectedFile = file;
    this.fileNameField.innerText = file.name;
    this.uploadEmpty.classList.add('hidden');
    this.uploadFilled.classList.remove('hidden');
    this.removeFileButton.classList.remove('hidden');
    this.fileError.innerText = '';
    this.updateButtons();
  }

  validateFile(file) {
    if (!file) return false;
    if (!file.name.endsWith('.csv')) {
      this.fileError.innerText = 'Only CSV files are allowed.';
      return false;
    }

    if (file.size > 20 * 1024 * 1024) {
      this.fileError.innerText = 'File size exceeds the limit.';
      return false;
    }
    return true;
  }

  // Core Logic
  resetUI() {
    this.state.selectedFile = null;
    this.state.isProcessing = false;

    this.fileInput.value = '';
    this.fileNameField.innerText = '';
    this.fileError.innerText = '';

    this.uploadEmpty.classList.remove('hidden');
    this.uploadFilled.classList.add('hidden');
    this.removeFileButton.classList.add('hidden');

    this.progressBar.style.width = '0%';
    this.progressStatus.innerText = 'Analyzing your Dashboard...';

    this.iFrameContainer.innerHTML = '';

    this.state.shareLink = null;

    this.switchView('upload');
    this.updateButtons();
  }

  async generateDashboard() {
    if (!this.validateFile(this.state.selectedFile)) return;
    const uniqueKey = crypto.randomUUID().replaceAll('-', '');
    this.state.isProcessing = true;
    this.updateButtons();

    this.switchView('progress');
    try {
      const socket = this.connectToWS(this.progressBar, this.progressStatus, uniqueKey);
      const data = await this.analyzeFile(this.state.selectedFile, uniqueKey);
      if (data.success == true) {
        this.displayReports(data.urls);
        this.state.shareLink = BASE_URL + '?key=' + data.key;
        socket.close();
      } else {
        socket.close();
        this.switchView('error');
      }
    } catch (err) {
      console.error(err);
      this.switchView('error');
    } finally {
      this.state.isProcessing = false;
      this.updateButtons();
    }
  }

  async shareDashboard() {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(this.state.shareLink);
      this.shareButton.innerText = 'Copied';
      setTimeout(() => (this.shareButton.innerText = 'Share'), 2000);
    } catch (err) {
      console.error(err);
    }
  }

  displayReports(urls) {
    const reactFragment = document.createDocumentFragment();
    this.iFrameContainer.innerHTML = '';

    urls.forEach((url) => {
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.className = 'dashboard-card';
      iframe.loading = 'lazy';
      reactFragment.appendChild(iframe);
    });

    this.iFrameContainer.appendChild(reactFragment);

    if (urls.length > 0 && urls.length % 2 != 0) {
      const iframe = this.analyzeContainer.getElementsByTagName('iframe')[0];
      iframe.style.gridColumn = 'span 2';
    }

    this.updateButtons();
    this.switchView('dashboard');
  }

  async fetchDashboard(key) {
    const uniqueKey = crypto.randomUUID().replaceAll('-', '');
    this.state.isProcessing = true;
    this.updateButtons();

    this.switchView('progress');
    try {
      const socket = this.connectToWS(this.progressBar, this.progressStatus, uniqueKey);
      const data = await this.getEmbedUrls(key, uniqueKey);
      if (data.success == true) {
        this.displayReports(data.urls);
        this.state.shareLink = BASE_URL + '?key=' + data.key;
        socket.close();
      } else {
        socket.close();
        this.switchView('error');
      }
    } catch (err) {
      console.error(err);
      this.switchView('error');
    } finally {
      this.state.isProcessing = false;
      this.updateButtons();
    }
  }

  // Server Connections
  async analyzeFile(file, key) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${SERVER_URL}/api/analyze?jobId=${key}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');

    const data = await response.json();
    return data;
  }

  connectToWS(loader, status, key) {
    const socket = new WebSocket(WS_URL + '/ws/progress/' + key);

    socket.onmessage = function (event) {
      const {progress, message} = JSON.parse(event.data);
      loader.style.width = `${progress}%`;
      status.innerText = message;
    };

    return socket;
  }

  async getEmbedUrls(key, jobId) {
    const response = await fetch(`${SERVER_URL}/api/fetch/embedUrls?key=${key}&jobId=${jobId}`);

    if (!response.ok) throw new Error('Failed to fetch embed URLs');

    const data = await response.json();
    return data;
  }
}

const dashboardGenerator = new DashboardGenerator();

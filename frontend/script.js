const BASE_URL = 'http://localhost:5500/frontend/index.html';
const SERVER_URL = 'http://localhost:8080/dashboard-generator-1.0-SNAPSHOT';
const WS_URL = 'ws://localhost:8080/dashboard-generator-1.0-SNAPSHOT';

class DashboardGenerator {
  constructor() {
    this.analyzeContainer = document.getElementById('analyze-container');
    this.dashboardControls = document.getElementById('dashboard-controls');
    this.DOM = {
      fileUpload: {
        dropZone: this.analyzeContainer.querySelector('#drop-zone'),
        fileInput: this.analyzeContainer.querySelector('#file-input'),
        fileDisplayName: this.analyzeContainer.querySelector('#uploaded-file-name'),
        fileUploadError: this.analyzeContainer.querySelector('#file-upload-error'),
        beforeUpload: this.analyzeContainer.querySelector('#upload-empty'),
        afterUpload: this.analyzeContainer.querySelector('#upload-filled'),
      },
      iframeContainer: this.analyzeContainer.querySelector('#iframe-container'),
      views: {
        upload: this.analyzeContainer.querySelector('#upload-view'),
        progress: this.analyzeContainer.querySelector('#progress-view'),
        dashboard: this.analyzeContainer.querySelector('#dashboard-view'),
        error: this.analyzeContainer.querySelector('#error-view'),
      },
      progress: {
        bar: this.analyzeContainer.querySelector('#progress-bar-fill'),
        status: this.analyzeContainer.querySelector('#progress-status'),
      },
      buttons: {
        removeFile: this.analyzeContainer.querySelector('#remove-file-btn'),
        browse: this.analyzeContainer.querySelector('#browse-btn'),
        generate: this.analyzeContainer.querySelector('#generate-btn'),
        reset: this.dashboardControls.children[0],
        share: this.dashboardControls.children[1],
        retry: this.analyzeContainer.querySelector('#retry-btn'),
      },
    };
    this.state = {
      selectedFile: null,
      isProcessing: false,
      shareLink: null,
    };

    this.init();
  }

  // Init
  init() {
    this.setupEventListeners();
    this.updateButtons();
    const key = new URLSearchParams(window.location.search).get('key');
    if (key != null) this.fetchDashboard(key);
  }

  // Event Listeners
  setupEventListeners() {
    this.DOM.fileUpload.dropZone.addEventListener('click', () => this.DOM.fileUpload.fileInput.click());

    this.DOM.fileUpload.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.DOM.fileUpload.dropZone.classList.add('drag-over');
    });
    this.DOM.fileUpload.dropZone.addEventListener('dragleave', () => {
      this.DOM.fileUpload.dropZone.classList.remove('drag-over');
    });
    this.DOM.fileUpload.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.DOM.fileUpload.dropZone.classList.remove('drag-over');
      if (e.dataTransfer.files.length) this.handleFile(e.dataTransfer.files[0]);
    });

    this.DOM.fileUpload.fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) this.handleFile(e.target.files[0]);
    });

    this.DOM.buttons.retry.addEventListener('click', () => this.resetUI());
    this.DOM.buttons.reset.addEventListener('click', () => this.resetUI());

    this.DOM.buttons.removeFile.addEventListener('click', () => this.removeFile());

    this.DOM.buttons.generate.addEventListener('click', () => this.generateDashboard());
    this.DOM.buttons.share.addEventListener('click', () => this.shareDashboard());
  }

  // Utilities
  updateButtons() {
    this.DOM.buttons.generate.disabled = this.state.isProcessing || !this.state.selectedFile;
    this.DOM.buttons.reset.disabled = this.state.isProcessing;
    this.DOM.buttons.share.disabled = this.state.isProcessing || !this.state.shareLink;
  }

  switchView(viewName) {
    Object.values(this.DOM.views).forEach((view) => view.classList.add('hidden'));
    this.DOM.views[viewName].classList.remove('hidden');
  }

  // Handling Files
  handleFile(file) {
    if (!this.validateFile(file)) return;
    this.state.selectedFile = file;
    this.DOM.fileUpload.fileDisplayName.innerText = file.name;
    this.DOM.fileUpload.beforeUpload.classList.add('hidden');
    this.DOM.fileUpload.afterUpload.classList.remove('hidden');
    this.DOM.buttons.removeFile.classList.remove('hidden');
    this.DOM.fileUpload.fileUploadError.innerText = '';
    this.updateButtons();
  }

  validateFile(file) {
    if (!file) return false;
    if (!file.name.endsWith('.csv')) {
      this.DOM.fileUpload.fileUploadError.innerText = 'Only CSV files are allowed.';
      return false;
    }

    if (file.size > 20 * 1024 * 1024) {
      this.DOM.fileUpload.fileUploadError.innerText = 'File size exceeds the limit.';
      return false;
    }
    return true;
  }

  removeFile() {
    this.state.selectedFile = null;
    this.DOM.fileUpload.fileDisplayName.innerText = '';
    this.DOM.fileUpload.fileUploadError.innerText = '';
    this.DOM.fileUpload.fileInput.value = '';
    this.DOM.buttons.removeFile.classList.add('hidden');
    this.DOM.fileUpload.beforeUpload.classList.remove('hidden');
    this.DOM.fileUpload.afterUpload.classList.add('hidden');
    this.updateButtons();
  }

  // Core Logic
  resetUI() {
    this.state.selectedFile = null;
    this.state.isProcessing = false;

    this.DOM.fileUpload.fileInput.value = '';
    this.DOM.fileUpload.fileDisplayName.innerText = '';
    this.DOM.fileUpload.fileUploadError.innerText = '';

    this.DOM.fileUpload.beforeUpload.classList.remove('hidden');
    this.DOM.fileUpload.afterUpload.classList.add('hidden');
    this.DOM.buttons.removeFile.classList.add('hidden');

    this.DOM.progress.bar.style.width = '0%';
    this.DOM.progress.status.innerText = 'Analyzing your Dashboard...';

    this.DOM.iframeContainer.innerHTML = '';

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
      const socket = this.connectToWS(this.DOM.progress.bar, this.DOM.progress.status, uniqueKey);
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
      this.DOM.buttons.share.innerText = 'Copied';
      setTimeout(() => (this.DOM.buttons.share.innerText = 'Share'), 2000);
    } catch (err) {
      console.error(err);
    }
  }

  displayReports(urls) {
    this.DOM.iframeContainer.innerHTML = '';

    urls.forEach((url) => {
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.className = 'dashboard-card';
      iframe.loading = 'lazy';
      this.DOM.iframeContainer.appendChild(iframe);
    });

    this.updateButtons();
    this.switchView('dashboard');
  }

  async fetchDashboard(key) {
    const uniqueKey = crypto.randomUUID().replaceAll('-', '');
    this.state.isProcessing = true;
    this.updateButtons();

    this.switchView('progress');
    try {
      const socket = this.connectToWS(this.DOM.progress.bar, this.DOM.progress.status, uniqueKey);
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

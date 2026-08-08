const SERVER_URL = 'http://localhost:8081';
const WS_URL = 'ws://localhost:8081';

import {marked} from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

class DashboardGenerator {
  constructor() {
    this.state = {
      selectedFile: null,
      isProcessing: false,
      reportInsight: null,
      geminiInsight: null,
    };

    this.init();
  }

  // Init
  init() {
    this.initDOM();

    this.setupEventListeners();
    this.updateButtons();
  }

  // initializeDOM
  initDOM() {
    this.analyzeContainer = document.getElementById('analyze-container');

    // Views
    this.uploadView = this.analyzeContainer.firstElementChild;
    this.progressView = this.uploadView.nextElementSibling;
    this.dashboardView = this.progressView.nextElementSibling;
    this.errorView = this.dashboardView.nextElementSibling;
    this.insightModal = this.errorView.nextElementSibling;

    // iFrame
    this.dashboardContainer = this.dashboardView.lastElementChild;
    this.iFrameContainer = this.dashboardContainer.lastElementChild;

    // Buttons
    this.buttons = this.analyzeContainer.getElementsByTagName('button');
    this.generateButton = this.buttons['generate-btn'];
    this.removeFileButton = this.buttons['remove-file-btn'];
    this.resetButton = this.buttons['reset-btn'];
    this.retryButton = this.buttons['retry-btn'];
    this.insightCloseButton = this.buttons['insights-close-modal'];
    this.reportInsightButton = this.buttons['report-insight-btn'];
    this.geminiInsightButton = this.buttons['gemini-insight-btn'];

    // Progress
    this.progressContainer = this.progressView.lastElementChild;
    this.progressBarBg = this.progressContainer.firstElementChild;
    this.progressBar = this.progressBarBg.firstElementChild;
    this.progressStatus = this.progressBarBg.nextElementSibling;

    // Dashboard
    this.dashboardTitle = this.dashboardView.getElementsByTagName('h4')[0];

    // Insights
    this.insightContainer = this.insightModal.children[0].children[1];
    this.insightHeading = this.insightContainer.firstElementChild;
    this.insightTextContainer = this.insightContainer.lastElementChild;

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
    this.insightCloseButton.addEventListener('click', () => this.closeInsights());
    this.reportInsightButton.addEventListener('click', () => this.openZiaInsights());
    this.geminiInsightButton.addEventListener('click', () => this.openGeminiInsight());
  }

  // Utilities
  updateButtons() {
    this.generateButton.disabled = this.state.isProcessing || !this.state.selectedFile;
    this.resetButton.disabled = this.state.isProcessing;
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

    this.switchView('upload');
    this.updateButtons();
  }

  // Insights
  closeInsights() {
    this.insightHeading.innerText = 'Insights';
    this.insightTextContainer.innerHTML = '<p>No insights available.</p>';
    this.insightModal.classList.add('hidden');
  }

  openZiaInsights() {
    if (this.state.reportInsight != null) {
      this.insightHeading.innerText = 'Report Insight';
      this.insightTextContainer.innerHTML = marked.parse(
        this.state.reportInsight.replaceAll('%%', '%').replaceAll(/\(\d+(\.\d+)?%\)|\d+(\.\d+)?%/g, '<span class="blue">$&</span>'),
      );
    } else {
      this.insightHeading.innerText = 'Insights';
      this.insightTextContainer.innerHTML = '<p>No insights available.</p>';
    }
    this.insightModal.classList.remove('hidden');
  }

  openGeminiInsight() {
    if (this.state.geminiInsight != null) {
      this.insightHeading.innerText = 'Gemini Insight';
      this.insightTextContainer.innerHTML = marked.parse(
        this.state.geminiInsight.replaceAll('%%', '%').replaceAll(/\(\d+(\.\d+)?%\)|\d+(\.\d+)?%/g, '<span class="blue">$&</span>'),
      );
    } else {
      this.insightHeading.innerText = 'Insights';
      this.insightTextContainer.innerHTML = '<p>No insights available.</p>';
    }
    this.insightModal.classList.remove('hidden');
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
  async generateDashboard() {
    if (!this.validateFile(this.state.selectedFile)) return;
    const uniqueKey = crypto.randomUUID().replaceAll('-', '');
    this.state.isProcessing = true;
    this.updateButtons();

    this.switchView('progress');
    try {
      const socket = this.connectToWS(this.progressBar, this.progressStatus, uniqueKey);
      const [analyticsPromise, insightsPromise] = await Promise.allSettled([
        this.analyzeFile(this.state.selectedFile, uniqueKey).catch(() => {
          socket.close();
          this.switchView('error');
        }),
        this.fetchGeminiInsight(this.state.selectedFile),
      ]);

      if (analyticsPromise.status == 'fulfilled') {
        const analyticsResponse = analyticsPromise.value;
        if (insightsPromise.status == 'fulfilled') {
          const insightsResponse = insightsPromise.value;
          this.state.geminiInsight = insightsResponse.data.insight;
        }
        const data = analyticsResponse.data;
        this.dashboardTitle.innerText = data.reportHeading;
        console.log(data.reportDescription);
        this.insightsData = data.insights;
        this.state.reportInsight = this.insightsData.reportInsight;
        this.displayReportsJsApi(data.urls, data.configs, this.insightsData.reportInsights);
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

  displayReportsJsApi(urls, configs, insights) {
    const reactFragment = document.createDocumentFragment();

    if (configs == null) {
      configs = [];
      urls.forEach((u) => configs.push({embedUrl: u}));
    }

    configs.forEach((config, i) => {
      const url = config.embedUrl;
      const outerDiv = document.createElement('div');
      outerDiv.className = 'report-card';
      const reportDiv = document.createElement('div');
      const options = {
        width: '100%',
        height: window.innerWidth < 767 ? '400px' : '550px',
      };
      const report = new ZAnalyticsLib(reportDiv, url, options);
      report.createViz();

      const fullScreenBtn = document.createElement('button');
      fullScreenBtn.innerText = 'Full Screen';
      fullScreenBtn.addEventListener('click', () => report.toggleFullScreen());

      const newWindowButton = document.createElement('button');
      newWindowButton.innerText = 'New Window';
      newWindowButton.addEventListener('click', () => report.openInNewTab());

      const toggleViewButton = document.createElement('button');
      toggleViewButton.innerText = 'Toggle View';
      toggleViewButton.dataset.toggle = 'show';
      toggleViewButton.addEventListener('click', () => {
        if (toggleViewButton.dataset.toggle == 'show') {
          toggleViewButton.dataset.toggle = 'hide';
          report.hide();
        } else {
          toggleViewButton.dataset.toggle = 'show';
          report.show();
        }
      });

      const insightsButton = document.createElement('button');
      insightsButton.innerText = 'Insights';
      insightsButton.addEventListener('click', () => {
        if (insights != null && i < insights.length) {
          this.insightHeading.innerText = config.title;
          const insightContent = insights[i]
            .replaceAll(/%%/g, '%')
            .replaceAll(/\n\n(.*?)\n\n/g, '\n\n<span class="bold">$1</span>\n\n')
            .replaceAll(/\n/g, '<br />')
            .replaceAll(/\(\d+(\.\d+)?%\)|\d+(\.\d+)?%/g, '<span class="blue">$&</span>');
          this.insightTextContainer.innerHTML = '<p>' + insightContent + '</p>';
        } else {
          this.insightHeading.innerText = 'Insights';
          this.insightTextContainer.innerHTML = '<p>No insights available.</p>';
        }
        this.insightModal.classList.remove('hidden');
      });

      const vudButton = document.createElement('button');
      vudButton.innerText = 'VUD';
      vudButton.addEventListener('click', () => {
        report.showVUD();
      });

      const exportButton = document.createElement('button');
      exportButton.innerText = 'Export';
      exportButton.addEventListener('click', () => {
        report.exportAsPDF();
      });

      const sortSelector = document.createElement('select');
      if ('axisColumns' in config) {
        const axisColumns = config.axisColumns;
        const sortAxis = {
          xAxis: axisColumns.filter((axis) => axis.type === 'xAxis'),
          yAxis: axisColumns.filter((axis) => axis.type === 'yAxis'),
        };
        // OptGroup xAxis
        if (sortAxis.xAxis.length > 0) {
          const optGroupXAxis = document.createElement('optgroup');
          optGroupXAxis.label = 'XAxis';
          sortAxis.xAxis.forEach((axis, i) => {
            // Ascending
            const optionElAsc = document.createElement('option');
            optionElAsc.value = 'xaxis-asc-' + ++i;
            optionElAsc.innerText = axis.columnName + ' - Asc';
            // Descending
            const optionElDesc = document.createElement('option');
            optionElDesc.value = 'xaxis-desc-' + i;
            optionElDesc.innerText = axis.columnName + ' - Desc';
            optGroupXAxis.appendChild(optionElAsc);
            optGroupXAxis.appendChild(optionElDesc);
          });
          sortSelector.appendChild(optGroupXAxis);
        }
        // OptGroup yAxis
        if (sortAxis.yAxis.length > 0) {
          const optGroupYAxis = document.createElement('optgroup');
          optGroupYAxis.label = 'YAxis';
          sortAxis.yAxis.forEach((axis, i) => {
            // Ascending
            const optionElAsc = document.createElement('option');
            optionElAsc.value = 'yaxis-asc-' + ++i;
            optionElAsc.innerText = axis.columnName + ' - Asc';
            // Descending
            const optionElDesc = document.createElement('option');
            optionElDesc.value = 'yaxis-desc-' + i;
            optionElDesc.innerText = axis.columnName + ' - Desc';
            optGroupYAxis.appendChild(optionElAsc);
            optGroupYAxis.appendChild(optionElDesc);
          });
          sortSelector.appendChild(optGroupYAxis);
        }

        sortSelector.title = 'Sort By';
        sortSelector.addEventListener('change', (e) => {
          const selectedValue = e.target.value;
          const axis = selectedValue.includes('xaxis') ? 'XAXIS' : 'YAXIS';
          const order = selectedValue.includes('asc') ? 'asc' : 'desc';
          const index = Number(selectedValue.split('-')[2]);
          report.sortView(axis, order, index);
        });
      }

      const reportControls = document.createElement('div');
      if ('axisColumns' in config) {
        reportControls.appendChild(sortSelector);
      }
      reportControls.appendChild(newWindowButton);
      reportControls.appendChild(toggleViewButton);
      reportControls.appendChild(insightsButton);
      reportControls.appendChild(vudButton);
      reportControls.appendChild(fullScreenBtn);
      reportControls.appendChild(exportButton);

      outerDiv.appendChild(reportControls);
      outerDiv.appendChild(reportDiv);
      reactFragment.appendChild(outerDiv);
    });

    this.iFrameContainer.appendChild(reactFragment);
    this.updateButtons();

    if (urls.length > 0 && urls.length % 2 != 0) {
      const comp = this.analyzeContainer.getElementsByClassName('report-card')[0];
      comp.style.gridColumn = 'span 2';
    }

    this.switchView('dashboard');
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

  async fetchGeminiInsight(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${SERVER_URL}/api/insights/gemini`, {
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
}

new DashboardGenerator();

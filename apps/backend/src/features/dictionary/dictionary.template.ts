export function renderDictionaryHtml(data: any): string {
  const jsonData = JSON.stringify(data);

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Atena School — Data Dictionary & Schema Docs</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-page: #FFFFFF;
      --bg-sidebar: #F7F7F5;
      --bg-card: #FFFFFF;
      --bg-card-hover: #FAFAF9;
      --bg-table-head: #F4F4F2;
      --bg-subtle: #F1F1EF;
      --bg-code: #F7F6F3;
      --border: #E8E8E6;
      --border-subtle: #F0F0EE;
      --border-focus: #2563EB;
      --text-main: #191918;
      --text-secondary: #605F5B;
      --text-tertiary: #9B9A97;
      --accent: #043569;
      --accent-light: #E9F2FA;
      --accent-hover: #032852;
      
      /* Notion-style semantic tag colors */
      --tag-gray-bg: #F1F1EF;
      --tag-gray-text: #5A5A58;
      --tag-blue-bg: #E7F3F8;
      --tag-blue-text: #1D5D84;
      --tag-green-bg: #EDF5EE;
      --tag-green-text: #2E6B45;
      --tag-yellow-bg: #FDF6E2;
      --tag-yellow-text: #96650E;
      --tag-orange-bg: #FBECDD;
      --tag-orange-text: #A84E00;
      --tag-red-bg: #FDE8E8;
      --tag-red-text: #B82C2C;
      --tag-purple-bg: #F4EEF8;
      --tag-purple-text: #6A3E8E;

      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
      --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
      --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
      --shadow-lg: 0 12px 32px rgba(0,0,0,0.12);
      --sidebar-width: 270px;
    }

    [data-theme="dark"] {
      --bg-page: #191919;
      --bg-sidebar: #131313;
      --bg-card: #202020;
      --bg-card-hover: #262626;
      --bg-table-head: #1C1C1C;
      --bg-subtle: #2A2A2A;
      --bg-code: #121212;
      --border: #2E2E2E;
      --border-subtle: #242424;
      --border-focus: #3B82F6;
      --text-main: #ECECEC;
      --text-secondary: #A0A0A0;
      --text-tertiary: #6E6E6E;
      --accent: #3B82F6;
      --accent-light: #1E293B;
      --accent-hover: #60A5FA;

      --tag-gray-bg: #2B2B2B;
      --tag-gray-text: #B4B4B4;
      --tag-blue-bg: #192D3E;
      --tag-blue-text: #70B4E0;
      --tag-green-bg: #1B2E20;
      --tag-green-text: #73C991;
      --tag-yellow-bg: #352D18;
      --tag-yellow-text: #E5B84B;
      --tag-orange-bg: #362416;
      --tag-orange-text: #F38B42;
      --tag-red-bg: #381D1E;
      --tag-red-text: #E86B6B;
      --tag-purple-bg: #2B1D38;
      --tag-purple-text: #C18CE6;

      --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
      --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
      --shadow-lg: 0 12px 32px rgba(0,0,0,0.6);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font-sans);
      background-color: var(--bg-page);
      color: var(--text-main);
      display: flex;
      min-height: 100vh;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    /* ============================================================ */
    /* SIDEBAR NAVIGATION                                           */
    /* ============================================================ */
    .sidebar {
      width: var(--sidebar-width);
      min-width: var(--sidebar-width);
      background-color: var(--bg-sidebar);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: sticky;
      top: 0;
      z-index: 40;
      user-select: none;
    }

    .sidebar-header {
      padding: 18px 20px 14px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .brand-row {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text-main);
    }

    .brand-logo {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      background: linear-gradient(135deg, #043569 0%, #0A60B6 100%);
      color: #FFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 800;
      box-shadow: var(--shadow-sm);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: -0.01em;
      line-height: 1.2;
    }

    .brand-subtitle {
      font-size: 11px;
      font-weight: 500;
      color: var(--text-tertiary);
    }

    .search-trigger {
      margin: 14px 16px 8px;
      padding: 8px 12px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-secondary);
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: var(--shadow-sm);
    }

    .search-trigger:hover {
      border-color: var(--text-tertiary);
      color: var(--text-main);
    }

    .search-trigger kbd {
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 10px;
      font-family: var(--font-mono);
      font-weight: 600;
      color: var(--text-tertiary);
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 10px 12px 20px;
    }

    .nav-section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-tertiary);
      padding: 12px 10px 6px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      text-decoration: none;
      cursor: pointer;
      transition: all 0.12s ease;
      margin-bottom: 2px;
    }

    .nav-item:hover {
      background-color: var(--bg-subtle);
      color: var(--text-main);
    }

    .nav-item.active {
      background-color: var(--accent-light);
      color: var(--accent);
      font-weight: 600;
    }

    [data-theme="dark"] .nav-item.active {
      color: #93C5FD;
    }

    .nav-item-icon {
      font-size: 16px;
      line-height: 1;
      width: 18px;
      text-align: center;
    }

    .nav-item-badge {
      margin-left: auto;
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--text-tertiary);
      background: var(--bg-card);
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid var(--border);
    }

    .sidebar-footer {
      padding: 14px 16px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
    }

    .theme-toggle-btn {
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 6px 10px;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    .theme-toggle-btn:hover {
      background: var(--bg-subtle);
      color: var(--text-main);
    }

    /* ============================================================ */
    /* MAIN CONTENT AREA                                            */
    /* ============================================================ */
    .main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow-y: auto;
    }

    .top-header {
      height: 52px;
      border-bottom: 1px solid var(--border);
      background: var(--bg-page);
      position: sticky;
      top: 0;
      z-index: 30;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .breadcrumb-active {
      color: var(--text-main);
      font-weight: 600;
    }

    .header-links {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-link-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
      text-decoration: none;
      padding: 5px 10px;
      border-radius: 6px;
      border: 1px solid var(--border);
      transition: all 0.15s ease;
    }

    .header-link-btn:hover {
      background: var(--bg-subtle);
      color: var(--text-main);
    }

    .page-content {
      max-width: 1080px;
      width: 100%;
      margin: 0 auto;
      padding: 36px 32px 80px;
    }

    /* ============================================================ */
    /* VIEWS: OVERVIEW & TABLE DETAIL                               */
    /* ============================================================ */
    .view-container {
      display: none;
    }

    .view-container.active {
      display: block;
      animation: fadeIn 0.18s ease forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .hero-header {
      margin-bottom: 32px;
    }

    .hero-icon {
      font-size: 42px;
      line-height: 1;
      margin-bottom: 12px;
      display: inline-block;
    }

    .hero-title {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: var(--text-main);
      margin-bottom: 8px;
    }

    .hero-desc {
      font-size: 15px;
      color: var(--text-secondary);
      line-height: 1.6;
      max-width: 800px;
    }

    /* Meta Badges Grid */
    .meta-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
    }

    .meta-pill {
      font-size: 12px;
      font-weight: 500;
      padding: 4px 10px;
      border-radius: 6px;
      background: var(--bg-subtle);
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .meta-pill code {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      color: var(--text-main);
    }

    /* Overview Cards Grid */
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: 16px;
      margin-top: 24px;
      margin-bottom: 40px;
    }

    .overview-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      transition: all 0.16s ease;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-sm);
    }

    .overview-card:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .overview-card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .overview-card-icon {
      font-size: 24px;
    }

    .overview-card-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
    }

    .overview-card-desc {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
      flex: 1;
      margin-bottom: 14px;
    }

    .overview-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid var(--border-subtle);
      font-size: 12px;
      color: var(--text-tertiary);
    }

    /* Architecture Callout */
    .callout {
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 18px 20px;
      margin-bottom: 28px;
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }

    .callout-icon {
      font-size: 22px;
      line-height: 1;
    }

    .callout-content {
      font-size: 13.5px;
      line-height: 1.6;
      color: var(--text-main);
    }

    .callout-title {
      font-weight: 700;
      margin-bottom: 4px;
    }

    /* ============================================================ */
    /* ENUM SECTION & INTERACTIVE TABLE                             */
    /* ============================================================ */
    .enum-block {
      margin-bottom: 48px;
    }

    .enum-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border);
    }

    .enum-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .enum-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-main);
    }

    .enum-type-badge {
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      background: var(--tag-blue-bg);
      color: var(--tag-blue-text);
      border: 1px solid rgba(0,0,0,0.05);
    }

    .enum-desc {
      font-size: 13.5px;
      color: var(--text-secondary);
      margin-bottom: 14px;
    }

    /* Tabs Header */
    .tabs-header {
      display: flex;
      gap: 6px;
      margin-bottom: 12px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 4px;
    }

    .tab-btn {
      background: transparent;
      border: none;
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.12s ease;
    }

    .tab-btn:hover {
      background: var(--bg-subtle);
      color: var(--text-main);
    }

    .tab-btn.active {
      background: var(--bg-card);
      color: var(--accent);
      font-weight: 600;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
    }

    [data-theme="dark"] .tab-btn.active {
      color: #93C5FD;
    }

    /* Table Component */
    .table-responsive {
      width: 100%;
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg-card);
      box-shadow: var(--shadow-sm);
      margin-bottom: 16px;
    }

    .dict-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13px;
    }

    .dict-table th {
      background: var(--bg-table-head);
      color: var(--text-secondary);
      font-weight: 600;
      padding: 10px 14px;
      border-bottom: 1px solid var(--border);
      font-size: 11.5px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .dict-table td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border-subtle);
      color: var(--text-main);
      vertical-align: top;
    }

    .dict-table tr:last-child td {
      border-bottom: none;
    }

    .dict-table tr:hover td {
      background-color: var(--bg-card-hover);
    }

    /* Badges in table */
    .id-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: var(--accent-light);
      color: var(--accent);
      font-family: var(--font-mono);
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      transition: transform 0.1s ease;
    }

    [data-theme="dark"] .id-badge {
      color: #93C5FD;
    }

    .id-badge:hover {
      transform: scale(1.15);
    }

    .code-badge {
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 4px;
      background: var(--tag-gray-bg);
      color: var(--tag-gray-text);
      cursor: pointer;
      display: inline-block;
    }

    .code-badge:hover {
      background: var(--accent-light);
      color: var(--accent);
    }

    .lang-flag {
      font-size: 13px;
      margin-right: 4px;
    }

    .lang-item {
      margin-bottom: 3px;
      line-height: 1.4;
    }

    .lang-item:last-child {
      margin-bottom: 0;
    }

    /* Code Snippet Box */
    .code-box {
      background: var(--bg-code);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      font-family: var(--font-mono);
      font-size: 12.5px;
      line-height: 1.6;
      color: var(--text-main);
      position: relative;
      overflow-x: auto;
    }

    .copy-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 4px 8px;
      font-size: 11px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 4px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.12s ease;
    }

    .copy-btn:hover {
      color: var(--text-main);
      border-color: var(--text-tertiary);
    }

    /* ============================================================ */
    /* SEARCH MODAL (CMD + K)                                       */
    /* ============================================================ */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(2px);
      z-index: 100;
      display: none;
      align-items: flex-start;
      justify-content: center;
      padding-top: 12vh;
    }

    .modal-backdrop.open {
      display: flex;
    }

    .search-modal {
      width: 100%;
      max-width: 620px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      animation: modalSlide 0.15s ease forwards;
    }

    @keyframes modalSlide {
      from { transform: scale(0.97); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .search-input-wrapper {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .search-icon {
      font-size: 18px;
      color: var(--text-tertiary);
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 15px;
      font-family: var(--font-sans);
      color: var(--text-main);
      outline: none;
    }

    .search-results {
      max-height: 380px;
      overflow-y: auto;
      padding: 8px;
    }

    .search-item {
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      transition: background 0.1s ease;
    }

    .search-item:hover, .search-item.selected {
      background: var(--bg-subtle);
    }

    .search-item-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .search-item-info {
      display: flex;
      flex-direction: column;
    }

    .search-item-title {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-main);
    }

    .search-item-desc {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .search-item-table {
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--text-tertiary);
      background: var(--bg-page);
      border: 1px solid var(--border);
      padding: 2px 6px;
      border-radius: 4px;
    }

    /* Toast Notification */
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #191918;
      color: #FFF;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      box-shadow: var(--shadow-md);
      z-index: 200;
      display: none;
      align-items: center;
      gap: 8px;
      animation: toastIn 0.15s ease forwards;
    }

    [data-theme="dark"] .toast {
      background: #E5E5E5;
      color: #111;
    }

    .toast.show {
      display: flex;
    }

    @keyframes toastIn {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  </style>
</head>
<body data-theme="light">

  <!-- ============================================================ -->
  <!-- SIDEBAR NAVIGATION                                           -->
  <!-- ============================================================ -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <a href="#overview" class="brand-row" onclick="switchTab('overview')">
        <div class="brand-logo">A</div>
        <div class="brand-text">
          <span class="brand-title">Atena Data Docs</span>
          <span class="brand-subtitle">Schema & Dictionary v1.5.0</span>
        </div>
      </a>
    </div>

    <div class="search-trigger" onclick="openSearch()">
      <span>🔍 Поиск по кодам & полям...</span>
      <kbd>⌘K</kbd>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section-title">Главная</div>
      <a class="nav-item active" data-tab="overview" onclick="switchTab('overview')">
        <span class="nav-item-icon">🏛️</span>
        <span>Архитектура & Стандарты</span>
      </a>

      <div class="nav-section-title">Таблицы базы данных</div>
      <a class="nav-item" data-tab="bookings" onclick="switchTab('bookings')">
        <span class="nav-item-icon">📦</span>
        <span>Bookings</span>
        <span class="nav-item-badge">5 enums</span>
      </a>
      <a class="nav-item" data-tab="payments" onclick="switchTab('payments')">
        <span class="nav-item-icon">💳</span>
        <span>Payments</span>
        <span class="nav-item-badge">5 enums</span>
      </a>
      <a class="nav-item" data-tab="courses" onclick="switchTab('courses')">
        <span class="nav-item-icon">🎓</span>
        <span>Courses</span>
        <span class="nav-item-badge">3 enums</span>
      </a>
      <a class="nav-item" data-tab="students" onclick="switchTab('students')">
        <span class="nav-item-icon">👥</span>
        <span>Students</span>
        <span class="nav-item-badge">2 enums</span>
      </a>
      <a class="nav-item" data-tab="lessons" onclick="switchTab('lessons')">
        <span class="nav-item-icon">🗓️</span>
        <span>Lessons</span>
        <span class="nav-item-badge">3 enums</span>
      </a>
      <a class="nav-item" data-tab="annual_memberships" onclick="switchTab('annual_memberships')">
        <span class="nav-item-icon">🪪</span>
        <span>Annual Memberships</span>
        <span class="nav-item-badge">1 enum</span>
      </a>
      <a class="nav-item" data-tab="app_settings" onclick="switchTab('app_settings')">
        <span class="nav-item-icon">⚙️</span>
        <span>App Settings</span>
        <span class="nav-item-badge">JSONB</span>
      </a>
    </nav>

    <div class="sidebar-footer">
      <button class="theme-toggle-btn" onclick="toggleTheme()">
        <span id="theme-icon">🌙</span>
        <span id="theme-label">Темная тема</span>
      </button>
      <span style="color: var(--text-tertiary);">v1.5.0</span>
    </div>
  </aside>

  <!-- ============================================================ -->
  <!-- MAIN WORKSPACE                                               -->
  <!-- ============================================================ */
  <div class="main-wrapper">
    <header class="top-header">
      <div class="breadcrumbs">
        <span>Atena School</span>
        <span>/</span>
        <span>Data Dictionary</span>
        <span>/</span>
        <span id="current-breadcrumb" class="breadcrumb-active">Архитектура & Стандарты</span>
      </div>

      <div class="header-links">
        <a href="/docs" target="_blank" class="header-link-btn">
          <span>⚡</span> <span>Swagger UI</span>
        </a>
      </div>
    </header>

    <main class="page-content">

      <!-- ======================================================== -->
      <!-- VIEW: OVERVIEW                                           -->
      <!-- ======================================================== -->
      <div id="view-overview" class="view-container active">
        <div class="hero-header">
          <div class="hero-icon">🏛️</div>
          <h1 class="hero-title">Словарь данных и перечислений Atena School</h1>
          <p class="hero-desc">
            Единый архитектурный стандарт числовых перечислений (SmallInt Enums) и системных сущностей платформы Atena School. Все перечисления строго типизированы в TypeScript, оптимизированы в PostgreSQL (2 байта на значение) и поддерживают мультиязычные переводы (IT / EN / RU).
          </p>
          <div class="meta-badges">
            <span class="meta-pill">💾 Тип хранения: <code>SMALLINT (2 Bytes)</code></span>
            <span class="meta-pill">🛡️ Пакет типов: <code>@atena/api-types</code></span>
            <span class="meta-pill">🌐 Языки: <code>IT, EN, RU</code></span>
            <span class="meta-pill">⚡ Всего таблиц: <code>7</code></span>
          </div>
        </div>

        <div class="callout">
          <div class="callout-icon">💡</div>
          <div class="callout-content">
            <div class="callout-title">Принцип единого источника правды (Single Source of Truth)</div>
            Все числовые коды объявляются через <code>const ... as const</code> в пакете <code>packages/api-types</code>. База данных PostgreSQL использует строгие <code>SMALLINT DEFAULT 1</code>, исключая человеческие ошибки при вставках и обеспечивая ультра-быстрые индексы.
          </div>
        </div>

        <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 14px;">Реестр таблиц базы данных</h2>
        <div class="overview-grid">
          <a class="overview-card" onclick="switchTab('bookings')">
            <div class="overview-card-header">
              <span class="overview-card-icon">📦</span>
              <span class="overview-card-title">Bookings</span>
            </div>
            <p class="overview-card-desc">Заказы и бронирования курсов клиентами. Статусы оплаты, жизненного цикла, схемы оплат.</p>
            <div class="overview-card-footer">
              <span>Таблица: <code>bookings</code></span>
              <span>5 колонок</span>
            </div>
          </a>

          <a class="overview-card" onclick="switchTab('payments')">
            <div class="overview-card-header">
              <span class="overview-card-icon">💳</span>
              <span class="overview-card-title">Payments</span>
            </div>
            <p class="overview-card-desc">Бухгалтерские проводки: оплата курса (type=1) и членский взнос €30 (type=2).</p>
            <div class="overview-card-footer">
              <span>Таблица: <code>payments</code></span>
              <span>5 колонок</span>
            </div>
          </a>

          <a class="overview-card" onclick="switchTab('courses')">
            <div class="overview-card-header">
              <span class="overview-card-icon">🎓</span>
              <span class="overview-card-title">Courses</span>
            </div>
            <p class="overview-card-desc">Каталог программ школы: групповые, индивидуальные, онлайн и сертификации.</p>
            <div class="overview-card-footer">
              <span>Таблица: <code>courses</code></span>
              <span>3 колонки</span>
            </div>
          </a>

          <a class="overview-card" onclick="switchTab('students')">
            <div class="overview-card-header">
              <span class="overview-card-icon">👥</span>
              <span class="overview-card-title">Students</span>
            </div>
            <p class="overview-card-desc">Реестр студентов: статус обучения, уровень владения языком по шкале CEFR (A1..C2).</p>
            <div class="overview-card-footer">
              <span>Таблица: <code>students</code></span>
              <span>2 колонки</span>
            </div>
          </a>

          <a class="overview-card" onclick="switchTab('lessons')">
            <div class="overview-card-header">
              <span class="overview-card-icon">🗓️</span>
              <span class="overview-card-title">Lessons</span>
            </div>
            <p class="overview-card-desc">Уроки в расписании: статус проведения, отметки о посещаемости (present/absent), форматы.</p>
            <div class="overview-card-footer">
              <span>Таблица: <code>lessons</code></span>
              <span>3 колонки</span>
            </div>
          </a>

          <a class="overview-card" onclick="switchTab('annual_memberships')">
            <div class="overview-card-header">
              <span class="overview-card-icon">🪪</span>
              <span class="overview-card-title">Annual Memberships</span>
            </div>
            <p class="overview-card-desc">Годовые членские карты ассоциации (€30 за учебный год): ACTIVE, PENDING, EXPIRED.</p>
            <div class="overview-card-footer">
              <span>Таблица: <code>annual_memberships</code></span>
              <span>1 колонка</span>
            </div>
          </a>

          <a class="overview-card" onclick="switchTab('app_settings')">
            <div class="overview-card-header">
              <span class="overview-card-icon">⚙️</span>
              <span class="overview-card-title">App Settings</span>
            </div>
            <p class="overview-card-desc">Глобальные динамические системные конфигурации (JSONB Key-Value).</p>
            <div class="overview-card-footer">
              <span>Таблица: <code>app_settings</code></span>
              <span>Key-Value</span>
            </div>
          </a>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- VIEW: TABLE DETAILS (DYNAMICALLY RENDERED)               -->
      <!-- ======================================================== -->
      <div id="dynamic-table-views"></div>

    </main>
  </div>

  <!-- ============================================================ -->
  <!-- SEARCH SPOTLIGHT MODAL (CMD + K)                             -->
  <!-- ============================================================ -->
  <div id="search-modal" class="modal-backdrop" onclick="closeSearch(event)">
    <div class="search-modal" onclick="event.stopPropagation()">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input type="text" id="search-input" class="search-input" placeholder="Поиск по статусам, кодам (например, PAID, A1, STRIPE) или описанию..." oninput="handleSearch(this.value)">
      </div>
      <div id="search-results" class="search-results"></div>
    </div>
  </div>

  <!-- Toast -->
  <div id="toast" class="toast">
    <span>✅</span>
    <span id="toast-text">Скопировано в буфер обмена</span>
  </div>

  <script>
    const DICTIONARY_DATA = ${jsonData};

    const TABLE_ICONS = {
      bookings: '📦',
      payments: '💳',
      courses: '🎓',
      students: '👥',
      lessons: '🗓️',
      annual_memberships: '🪪',
      app_settings: '⚙️',
    };

    // Render Dynamic Views for each Table
    function renderTableViews() {
      const container = document.getElementById('dynamic-table-views');
      let html = '';

      for (const [tableKey, tableData] of Object.entries(DICTIONARY_DATA.tables)) {
        const icon = TABLE_ICONS[tableKey] || '📑';
        
        html += \`
          <div id="view-\${tableKey}" class="view-container">
            <div class="hero-header">
              <div class="hero-icon">\${icon}</div>
              <h1 class="hero-title">\${tableData.title}</h1>
              <p class="hero-desc">\${tableData.description}</p>
              <div class="meta-badges">
                <span class="meta-pill">Таблица в PostgreSQL: <code>public.\${tableData.table}</code></span>
                <span class="meta-pill">Колонок в справочнике: <code>\${Object.keys(tableData.columns).length}</code></span>
              </div>
            </div>
        \`;

        // Render each enum column in this table
        for (const [colKey, colData] of Object.entries(tableData.columns)) {
          html += \`
            <div class="enum-block">
              <div class="enum-header">
                <div class="enum-title-group">
                  <span class="enum-title">Колонка: <code>\${colData.column}</code></span>
                  <span class="enum-type-badge">\${colData.name}</span>
                </div>
                <span style="font-size: 12px; font-family: var(--font-mono); color: var(--text-tertiary);">\${colData.dbType}</span>
              </div>
              <p class="enum-desc">\${colData.description}</p>

              <div class="table-responsive">
                <table class="dict-table">
                  <thead>
                    <tr>
                      <th style="width: 60px;">ID</th>
                      <th style="width: 170px;">TypeScript Code</th>
                      <th style="width: 280px;">Переводы (IT / EN / RU)</th>
                      <th>Бизнес-описание</th>
                    </tr>
                  </thead>
                  <tbody>
          \`;

          for (const [valKey, valData] of Object.entries(colData.values)) {
            html += \`
              <tr>
                <td>
                  <span class="id-badge" onclick="copyText('\${valData.id}', 'ID \${valData.id}')" title="Нажмите, чтобы скопировать ID">\${valData.id}</span>
                </td>
                <td>
                  <span class="code-badge" onclick="copyText('\${colData.name}.\${valData.code}', '\${colData.name}.\${valData.code}')" title="Скопировать код">\${valData.code}</span>
                </td>
                <td>
                  <div class="lang-item"><span class="lang-flag">🇮🇹</span> <strong>\${valData.label_it || '—'}</strong></div>
                  <div class="lang-item" style="color: var(--text-secondary);"><span class="lang-flag">🇬🇧</span> \${valData.label_en || '—'}</div>
                  <div class="lang-item" style="color: var(--text-secondary);"><span class="lang-flag">🇷🇺</span> \${valData.label_ru || '—'}</div>
                </td>
                <td style="color: var(--text-secondary); line-height: 1.5;">
                  \${valData.description || '—'}
                </td>
              </tr>
            \`;
          }

          html += \`
                  </tbody>
                </table>
              </div>
            </div>
          \`;
        }

        html += \`</div>\`;
      }

      container.innerHTML = html;
    }

    // Switch active Tab / View
    function switchTab(tabKey) {
      // Update Nav Items
      document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.tab === tabKey);
      });

      // Update Views
      document.querySelectorAll('.view-container').forEach(el => {
        el.classList.remove('active');
      });

      const targetView = document.getElementById('view-' + tabKey);
      if (targetView) {
        targetView.classList.add('active');
      } else {
        document.getElementById('view-overview').classList.add('active');
      }

      // Update Breadcrumbs
      const titleMap = {
        overview: 'Архитектура & Стандарты',
        bookings: 'Таблица Bookings',
        payments: 'Таблица Payments',
        courses: 'Таблица Courses',
        students: 'Таблица Students',
        lessons: 'Таблица Lessons',
        annual_memberships: 'Таблица Annual Memberships',
        app_settings: 'Таблица App Settings',
      };
      document.getElementById('current-breadcrumb').textContent = titleMap[tabKey] || tabKey;

      // Update URL Hash
      if (window.location.hash !== '#' + tabKey) {
        history.pushState(null, null, '#' + tabKey);
      }

      // Scroll to top
      document.querySelector('.main-wrapper').scrollTop = 0;
    }

    // Copy to clipboard helper
    function copyText(text, label) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Скопировано: ' + (label || text));
      });
    }

    function showToast(text) {
      const t = document.getElementById('toast');
      document.getElementById('toast-text').textContent = text;
      t.classList.add('show');
      setTimeout(() => {
        t.classList.remove('show');
      }, 2000);
    }

    // Theme Toggle
    function toggleTheme() {
      const isDark = document.body.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      document.body.setAttribute('data-theme', newTheme);
      document.getElementById('theme-icon').textContent = newTheme === 'dark' ? '☀️' : '🌙';
      document.getElementById('theme-label').textContent = newTheme === 'dark' ? 'Светлая тема' : 'Темная тема';
      localStorage.setItem('atena_dict_theme', newTheme);
    }

    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('atena_dict_theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-icon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    document.getElementById('theme-label').textContent = savedTheme === 'dark' ? 'Светлая тема' : 'Темная тема';

    // Global Search Spotlight
    function openSearch() {
      document.getElementById('search-modal').classList.add('open');
      const input = document.getElementById('search-input');
      input.value = '';
      input.focus();
      handleSearch('');
    }

    function closeSearch(e) {
      document.getElementById('search-modal').classList.remove('open');
    }

    function handleSearch(q) {
      const query = q.toLowerCase().trim();
      const resultsContainer = document.getElementById('search-results');
      const results = [];

      for (const [tableKey, tableData] of Object.entries(DICTIONARY_DATA.tables)) {
        for (const [colKey, colData] of Object.entries(tableData.columns)) {
          for (const [valKey, valData] of Object.entries(colData.values)) {
            const matches = 
              !query ||
              colData.name.toLowerCase().includes(query) ||
              valData.code.toLowerCase().includes(query) ||
              String(valData.id).includes(query) ||
              (valData.label_it && valData.label_it.toLowerCase().includes(query)) ||
              (valData.label_en && valData.label_en.toLowerCase().includes(query)) ||
              (valData.label_ru && valData.label_ru.toLowerCase().includes(query)) ||
              (valData.description && valData.description.toLowerCase().includes(query));

            if (matches) {
              results.push({
                tableKey,
                tableTitle: tableData.title,
                enumName: colData.name,
                code: valData.code,
                id: valData.id,
                label: valData.label_it || valData.label_en || valData.label_ru,
                desc: valData.description,
              });
            }
          }
        }
      }

      if (results.length === 0) {
        resultsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-tertiary); font-size: 13px;">Ничего не найдено</div>';
        return;
      }

      resultsContainer.innerHTML = results.slice(0, 15).map(r => \`
        <div class="search-item" onclick="selectSearchResult('\${r.tableKey}')">
          <div class="search-item-left">
            <span class="id-badge">\${r.id}</span>
            <div class="search-item-info">
              <span class="search-item-title">\${r.enumName}.\${r.code} (\${r.label})</span>
              <span class="search-item-desc">\${r.desc ? r.desc.slice(0, 75) + '...' : ''}</span>
            </div>
          </div>
          <span class="search-item-table">\${r.tableKey}</span>
        </div>
      \`).join('');
    }

    function selectSearchResult(tableKey) {
      closeSearch();
      switchTab(tableKey);
    }

    // Keyboard Hotkey Listener for Cmd+K and Esc
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape') {
        closeSearch();
      }
    });

    // Handle initial hash navigation
    window.addEventListener('DOMContentLoaded', () => {
      renderTableViews();
      const hash = window.location.hash.replace('#', '') || 'overview';
      switchTab(hash);
    });

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'overview';
      switchTab(hash);
    });
  </script>
</body>
</html>`;
}

export function renderDictionaryHtml(data: any): string {
  const jsonData = JSON.stringify(data);

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Atena School — Data Dictionary & Schema Docs</title>
  <style>
    :root {
      --bg-page: #FFFFFF;
      --bg-sidebar: #F7F6F3;
      --bg-card: #FFFFFF;
      --bg-card-hover: #F7F6F3;
      --bg-table-head: #F7F6F3;
      --bg-subtle: #F1F1EF;
      --bg-code: #F7F6F3;
      --border: #E9E9E7;
      --border-subtle: #EDEDEB;
      
      --text-main: #37352F;
      --text-secondary: #787774;
      --text-tertiary: #9B9A97;
      
      --accent: #37352F;
      --accent-bg: #EFEFED;
      --badge-bg: #F1F1EF;
      --badge-text: #37352F;
      --badge-border: #E9E9E7;

      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
      
      --sidebar-width: 260px;
    }

    [data-theme="dark"] {
      --bg-page: #191919;
      --bg-sidebar: #202020;
      --bg-card: #202020;
      --bg-card-hover: #262626;
      --bg-table-head: #262626;
      --bg-subtle: #2B2B2B;
      --bg-code: #262626;
      --border: #2F2F2F;
      --border-subtle: #282828;
      
      --text-main: #E6E6E6;
      --text-secondary: #9B9B9B;
      --text-tertiary: #6F6F6F;
      
      --accent: #E6E6E6;
      --accent-bg: #2F2F2F;
      --badge-bg: #2B2B2B;
      --badge-text: #E6E6E6;
      --badge-border: #373737;
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
      -moz-osx-font-smoothing: grayscale;
    }

    /* SIDEBAR */
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
      padding: 14px 16px 12px;
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
      width: 24px;
      height: 24px;
      border-radius: 4px;
      background: var(--text-main);
      color: var(--bg-page);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 800;
      font-family: var(--font-sans);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: -0.01em;
      line-height: 1.2;
    }

    .brand-subtitle {
      font-size: 11px;
      color: var(--text-tertiary);
    }

    .search-trigger {
      margin: 10px 12px 6px;
      padding: 6px 10px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 4px;
      color: var(--text-secondary);
      font-size: 12.5px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: background 0.1s ease;
    }

    .search-trigger:hover {
      background: var(--bg-subtle);
      color: var(--text-main);
    }

    .search-trigger kbd {
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 3px;
      padding: 1px 5px;
      font-size: 10px;
      font-family: var(--font-mono);
      color: var(--text-secondary);
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 8px 10px 16px;
    }

    .nav-section-title {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-tertiary);
      padding: 12px 8px 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 400;
      color: var(--text-secondary);
      text-decoration: none;
      cursor: pointer;
      transition: background 0.1s ease;
      margin-bottom: 1px;
    }

    .nav-item:hover {
      background-color: var(--bg-subtle);
      color: var(--text-main);
    }

    .nav-item.active {
      background-color: var(--accent-bg);
      color: var(--text-main);
      font-weight: 600;
    }

    .nav-item-icon {
      font-size: 14px;
      line-height: 1;
      width: 18px;
      text-align: center;
    }

    .nav-item-badge {
      margin-left: auto;
      font-size: 10.5px;
      font-family: var(--font-mono);
      color: var(--text-tertiary);
      background: var(--bg-card);
      padding: 1px 5px;
      border-radius: 3px;
      border: 1px solid var(--border);
    }

    .sidebar-footer {
      padding: 10px 14px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11.5px;
      background: var(--bg-sidebar);
    }

    .theme-toggle-btn {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 4px 8px;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 11.5px;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: background 0.1s ease;
    }

    .theme-toggle-btn:hover {
      background: var(--bg-subtle);
      color: var(--text-main);
    }

    /* MAIN CONTENT */
    .main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow-y: auto;
    }

    .top-header {
      height: 46px;
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
      gap: 6px;
      font-size: 12.5px;
      color: var(--text-tertiary);
    }

    .breadcrumb-active {
      color: var(--text-main);
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .lang-switcher {
      display: flex;
      align-items: center;
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 2px;
      gap: 2px;
    }

    .lang-btn {
      background: transparent;
      border: none;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 11.5px;
      font-weight: 500;
      font-family: var(--font-mono);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.1s ease;
    }

    .lang-btn:hover {
      color: var(--text-main);
    }

    .lang-btn.active {
      background: var(--bg-card);
      color: var(--text-main);
      font-weight: 600;
      border: 1px solid var(--border);
    }

    .header-link-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
      text-decoration: none;
      padding: 4px 9px;
      border-radius: 4px;
      border: 1px solid var(--border);
      background: var(--bg-card);
      transition: background 0.1s ease;
    }

    .header-link-btn:hover {
      background: var(--bg-subtle);
      color: var(--text-main);
    }

    .page-content {
      max-width: 1040px;
      width: 100%;
      margin: 0 auto;
      padding: 32px 32px 80px;
    }

    .view-container {
      display: none;
    }

    .view-container.active {
      display: block;
    }

    /* Notion Hero Header */
    .hero-header {
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
    }

    .hero-header-top {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 8px;
    }

    .hero-icon-badge {
      font-size: 26px;
      line-height: 1;
      padding-top: 2px;
    }

    .hero-header-text {
      flex: 1;
    }

    .hero-title {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.015em;
      color: var(--text-main);
      margin-bottom: 4px;
    }

    .hero-desc {
      font-size: 13.5px;
      color: var(--text-secondary);
      line-height: 1.55;
    }

    .meta-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
    }

    .meta-pill {
      font-size: 11.5px;
      padding: 2px 7px;
      border-radius: 3px;
      background: var(--bg-subtle);
      color: var(--text-secondary);
      border: 1px solid var(--border);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .meta-pill code {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--text-main);
    }

    /* Notion Callout */
    .callout {
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 14px 16px;
      margin-bottom: 24px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .callout-icon {
      font-size: 18px;
      line-height: 1.2;
    }

    .callout-content {
      font-size: 13px;
      line-height: 1.55;
      color: var(--text-main);
    }

    .callout-title {
      font-weight: 600;
      margin-bottom: 2px;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 12px;
      margin-top: 16px;
      margin-bottom: 32px;
    }

    .overview-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 14px 16px;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      transition: background 0.1s ease;
      display: flex;
      flex-direction: column;
    }

    .overview-card:hover {
      background: var(--bg-card-hover);
    }

    .overview-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .overview-card-icon {
      font-size: 18px;
    }

    .overview-card-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
    }

    .overview-card-desc {
      font-size: 12.5px;
      color: var(--text-secondary);
      line-height: 1.45;
      flex: 1;
      margin-bottom: 10px;
    }

    .overview-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 8px;
      border-top: 1px solid var(--border-subtle);
      font-size: 11.5px;
      color: var(--text-tertiary);
    }

    /* Notion Enum Card */
    .enum-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 4px;
      margin-bottom: 24px;
      overflow: hidden;
    }

    .enum-card-header {
      padding: 10px 14px;
      background: var(--bg-table-head);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .enum-card-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .column-name-badge code {
      font-family: var(--font-mono);
      font-size: 13px;
      font-weight: 600;
      background: var(--badge-bg);
      padding: 2px 6px;
      border-radius: 3px;
      border: 1px solid var(--badge-border);
      color: var(--badge-text);
    }

    .enum-type-badge {
      font-family: var(--font-mono);
      font-size: 11.5px;
      font-weight: 500;
      padding: 2px 6px;
      border-radius: 3px;
      background: var(--badge-bg);
      color: var(--text-secondary);
      border: 1px solid var(--badge-border);
    }

    .db-type-badge {
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--text-tertiary);
    }

    .table-container {
      width: 100%;
      overflow-x: auto;
    }

    .dict-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 12.5px;
    }

    .dict-table th {
      background: var(--bg-table-head);
      color: var(--text-secondary);
      font-weight: 500;
      padding: 8px 14px;
      border-bottom: 1px solid var(--border);
      font-size: 11.5px;
      white-space: nowrap;
    }

    .dict-table td {
      padding: 10px 14px;
      border-bottom: 1px solid var(--border-subtle);
      color: var(--text-main);
      vertical-align: middle;
    }

    .dict-table tr:last-child td {
      border-bottom: none;
    }

    .dict-table tr:hover td {
      background-color: var(--bg-card-hover);
    }

    .id-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 22px;
      height: 22px;
      padding: 0 4px;
      border-radius: 3px;
      background: var(--badge-bg);
      color: var(--badge-text);
      font-family: var(--font-mono);
      font-weight: 600;
      font-size: 11.5px;
      cursor: pointer;
      border: 1px solid var(--badge-border);
    }

    .id-badge:hover {
      background: var(--border);
    }

    .code-badge {
      font-family: var(--font-mono);
      font-size: 11.5px;
      font-weight: 500;
      padding: 2px 6px;
      border-radius: 3px;
      background: var(--badge-bg);
      color: var(--badge-text);
      border: 1px solid var(--badge-border);
      cursor: pointer;
      display: inline-block;
    }

    .code-badge:hover {
      background: var(--border);
    }

    .single-label-wrapper {
      display: inline-block;
      font-size: 12.5px;
      font-weight: 500;
      color: var(--text-main);
    }

    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 15, 15, 0.4);
      z-index: 100;
      display: none;
      align-items: flex-start;
      justify-content: center;
      padding-top: 14vh;
    }

    .modal-backdrop.open {
      display: flex;
    }

    .search-modal {
      width: 100%;
      max-width: 580px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 6px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      overflow: hidden;
    }

    .search-input-wrapper {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-card);
    }

    .search-icon {
      font-size: 15px;
      color: var(--text-tertiary);
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 14px;
      font-family: var(--font-sans);
      color: var(--text-main);
      outline: none;
    }

    .search-results {
      max-height: 360px;
      overflow-y: auto;
      padding: 6px;
    }

    .search-item {
      padding: 8px 10px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .search-item:hover, .search-item.selected {
      background: var(--bg-subtle);
    }

    .search-item-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .search-item-info {
      display: flex;
      flex-direction: column;
    }

    .search-item-title {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-main);
    }

    .search-item-desc {
      font-size: 11.5px;
      color: var(--text-secondary);
    }

    .search-item-table {
      font-size: 10.5px;
      font-family: var(--font-mono);
      color: var(--text-tertiary);
      background: var(--bg-page);
      border: 1px solid var(--border);
      padding: 1px 5px;
      border-radius: 3px;
    }

    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #2F2F2F;
      color: #FFFFFF;
      padding: 8px 14px;
      border-radius: 4px;
      font-size: 12.5px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 200;
      display: none;
      align-items: center;
      gap: 6px;
    }

    [data-theme="dark"] .toast {
      background: #FFFFFF;
      color: #191919;
    }

    .toast.show {
      display: flex;
    }
  </style>
</head>
<body data-theme="light">

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <a href="#overview" class="brand-row" onclick="switchTab('overview')">
        <div class="brand-logo">A</div>
        <div class="brand-text">
          <span class="brand-title">Atena Data Docs</span>
          <span class="brand-subtitle">Schema & Dictionary</span>
        </div>
      </a>
    </div>

    <div class="search-trigger" onclick="openSearch()">
      <span id="search-trigger-text">Поиск...</span>
      <kbd>⌘K</kbd>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section-title" id="nav-title-main">Главная</div>
      <a class="nav-item active" data-tab="overview" onclick="switchTab('overview')">
        <span class="nav-item-icon">🏛️</span>
        <span id="nav-item-overview">Архитектура & Стандарты</span>
      </a>

      <div class="nav-section-title" id="nav-title-tables">Таблицы базы данных</div>
      <a class="nav-item" data-tab="bookings" onclick="switchTab('bookings')">
        <span class="nav-item-icon">📦</span>
        <span id="nav-item-bookings">Bookings</span>
        <span class="nav-item-badge">5 enums</span>
      </a>
      <a class="nav-item" data-tab="payments" onclick="switchTab('payments')">
        <span class="nav-item-icon">💳</span>
        <span id="nav-item-payments">Payments</span>
        <span class="nav-item-badge">5 enums</span>
      </a>
      <a class="nav-item" data-tab="courses" onclick="switchTab('courses')">
        <span class="nav-item-icon">🎓</span>
        <span id="nav-item-courses">Courses</span>
        <span class="nav-item-badge">3 enums</span>
      </a>
      <a class="nav-item" data-tab="students" onclick="switchTab('students')">
        <span class="nav-item-icon">👥</span>
        <span id="nav-item-students">Students</span>
        <span class="nav-item-badge">2 enums</span>
      </a>
      <a class="nav-item" data-tab="lessons" onclick="switchTab('lessons')">
        <span class="nav-item-icon">🗓️</span>
        <span id="nav-item-lessons">Lessons</span>
        <span class="nav-item-badge">3 enums</span>
      </a>
      <a class="nav-item" data-tab="annual_memberships" onclick="switchTab('annual_memberships')">
        <span class="nav-item-icon">🪪</span>
        <span id="nav-item-annual_memberships">Annual Memberships</span>
        <span class="nav-item-badge">1 enum</span>
      </a>
      <a class="nav-item" data-tab="app_settings" onclick="switchTab('app_settings')">
        <span class="nav-item-icon">⚙️</span>
        <span id="nav-item-app_settings">App Settings</span>
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

  <!-- MAIN WORKSPACE -->
  <div class="main-wrapper">
    <header class="top-header">
      <div class="breadcrumbs">
        <span>Atena School</span>
        <span>/</span>
        <span>Data Dictionary</span>
        <span>/</span>
        <span id="current-breadcrumb" class="breadcrumb-active">Архитектура & Стандарты</span>
      </div>

      <div class="header-actions">
        <!-- Minimalist Language Switcher -->
        <div class="lang-switcher">
          <button class="lang-btn" id="lang-btn-it" onclick="setLanguage('it')" title="Italiano">IT</button>
          <button class="lang-btn" id="lang-btn-en" onclick="setLanguage('en')" title="English">EN</button>
          <button class="lang-btn active" id="lang-btn-ru" onclick="setLanguage('ru')" title="Русский">RU</button>
        </div>

        <a href="/docs" target="_blank" class="header-link-btn">
          <span>Swagger UI</span>
        </a>
      </div>
    </header>

    <main class="page-content">

      <!-- VIEW: OVERVIEW -->
      <div id="view-overview" class="view-container active">
        <div class="hero-header">
          <div class="hero-header-top">
            <div class="hero-icon-badge">🏛️</div>
            <div class="hero-header-text">
              <h1 class="hero-title" id="overview-hero-title">Словарь данных и перечислений Atena School</h1>
              <div class="meta-badges">
                <span class="meta-pill"><span id="meta-storage-text">Тип:</span> <code>SMALLINT (2 Bytes)</code></span>
                <span class="meta-pill"><span id="meta-pkg-text">Пакет:</span> <code>@atena/api-types</code></span>
                <span class="meta-pill"><span id="meta-lang-text">Языки:</span> <code>IT, EN, RU</code></span>
                <span class="meta-pill"><span id="meta-tables-text">Таблиц:</span> <code>7</code></span>
              </div>
            </div>
          </div>
          <p class="hero-desc" id="overview-hero-desc">
            Единый архитектурный стандарт числовых перечислений (SmallInt Enums) и системных сущностей платформы Atena School. Все перечисления строго типизированы в TypeScript, оптимизированы в PostgreSQL (2 байта на значение) и поддерживают мультиязычные переводы (IT / EN / RU).
          </p>
        </div>

        <div class="callout">
          <div class="callout-icon">💡</div>
          <div class="callout-content">
            <div class="callout-title" id="callout-title-text">Принцип единого источника правды (Single Source of Truth)</div>
            <div id="callout-desc-text">Все числовые коды объявляются через <code>const ... as const</code> в пакете <code>packages/api-types</code>. База данных PostgreSQL использует строгие <code>SMALLINT DEFAULT 1</code>, исключая человеческие ошибки при вставках и обеспечивая ультра-быстрые индексы.</div>
          </div>
        </div>

        <h2 style="font-size: 15px; font-weight: 600; margin-bottom: 10px; color: var(--text-main);" id="registry-title-text">Реестр таблиц базы данных</h2>
        <div class="overview-grid" id="overview-cards-container">
          <!-- Dynamically populated per language -->
        </div>
      </div>

      <!-- VIEW: TABLE DETAILS (DYNAMICALLY RENDERED) -->
      <div id="dynamic-table-views"></div>

    </main>
  </div>

  <!-- SEARCH SPOTLIGHT MODAL -->
  <div id="search-modal" class="modal-backdrop" onclick="closeSearch(event)">
    <div class="search-modal" onclick="event.stopPropagation()">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input type="text" id="search-input" class="search-input" placeholder="Поиск по статусам, кодам..." oninput="handleSearch(this.value)">
      </div>
      <div id="search-results" class="search-results"></div>
    </div>
  </div>

  <!-- Toast -->
  <div id="toast" class="toast">
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

    // Full 3-Way i18n Dictionary
    const I18N = {
      ru: {
        searchPlaceholder: 'Поиск по статусам, кодам (например, PAID, A1, STRIPE)...',
        searchTrigger: 'Поиск по кодам & полям...',
        navMain: 'Главная',
        navOverview: 'Архитектура & Стандарты',
        navTables: 'Таблицы базы данных',
        navBookings: 'Bookings (Бронирования)',
        navPayments: 'Payments (Платежи)',
        navCourses: 'Courses (Курсы)',
        navStudents: 'Students (Студенты)',
        navLessons: 'Lessons (Уроки)',
        navMemberships: 'Annual Memberships (Взносы €30)',
        navSettings: 'App Settings (Настройки)',
        themeDark: 'Темная тема',
        themeLight: 'Светлая тема',
        toastCopied: 'Скопировано',
        colId: 'ID',
        colCode: 'TypeScript Code',
        colLabel: 'Название (RU)',
        colDesc: 'Бизнес-назначение и контекст',
        tableInPg: 'Таблица:',
        enumsCount: 'Колонок:',
        notFound: 'Ничего не найдено',
        overviewTitle: 'Словарь данных и перечислений Atena School',
        overviewDesc: 'Единый архитектурный стандарт числовых перечислений (SmallInt Enums) и системных сущностей платформы Atena School. Все перечисления строго типизированы в TypeScript, оптимизированы в PostgreSQL (2 байта на значение) и поддерживают мультиязычные переводы (IT / EN / RU).',
        metaStorage: 'Тип:',
        metaPkg: 'Пакет:',
        metaLang: 'Языки:',
        metaTables: 'Таблиц:',
        calloutTitle: 'Принцип единого источника правды (Single Source of Truth)',
        calloutDesc: 'Все числовые коды объявляются через <code>const ... as const</code> в пакете <code>packages/api-types</code>. База данных PostgreSQL использует строгие <code>SMALLINT DEFAULT 1</code>, исключая человеческие ошибки при вставках и обеспечивая ультра-быстрые индексы.',
        registryTitle: 'Реестр таблиц базы данных',
        cardTableLabel: 'Таблица:',
        cardColumnsLabel: 'кол.',
        tables: {
          bookings: {
            title: 'Бронирования и заявки на курсы',
            desc: 'Основная таблица заказов и бронирований. Содержит данные плательщика, студента, выбранный курс, сумму, скидки и статусы.',
            cardDesc: 'Заказы и бронирования курсов клиентами. Статусы оплаты, жизненного цикла, схемы оплат.',
          },
          payments: {
            title: 'Платежи и транзакции',
            desc: 'Финансовая таблица бухгалтерских записей и проводок по бронированиям и студентам. Каждый курс генерирует 2 записи: оплату курса (type=1) и членский взнос €30 (type=2).',
            cardDesc: 'Бухгалтерские проводки: оплата курса (type=1) и членский взнос €30 (type=2).',
          },
          courses: {
            title: 'Каталог курсов',
            desc: 'Академический каталог программ школы (итальянский, английский, русский и др.). Уровни CEFR A1..C2, индивидуальные/групповые форматы и статусы публикации.',
            cardDesc: 'Каталог программ школы: уровни A1..C2, индивидуальные/групповые форматы, статусы.',
          },
          students: {
            title: 'Реестр студентов',
            desc: 'Основная таблица студентов языковой школы Atena. Хранит персональные данные, уровень CEFR, статус обучения и статус оплаты годового взноса.',
            cardDesc: 'Реестр студентов: статус обучения (ACTIVE..ARCHIVED), уровень владения языком CEFR (A1..C2).',
          },
          lessons: {
            title: 'Уроки и расписание',
            desc: 'Журнал индивидуальных и групповых уроков в расписании. Отслеживает проведение занятий, посещаемость (присутствовал, отсутствовал, опоздал) и формат (очно/онлайн).',
            cardDesc: 'Уроки в расписании: статус проведения, отметки о посещаемости (present/absent), форматы.',
          },
          annual_memberships: {
            title: 'Годовые членские взносы (€30)',
            desc: 'Обязательный ежегодный ассоциативный взнос €30 на каждого студента. Действует в рамках учебного года (1 сентября — 31 августа).',
            cardDesc: 'Годовые членские карты ассоциации (€30 за учебный год): ACTIVE, PENDING, EXPIRED.',
          },
          app_settings: {
            title: 'Системные настройки приложения',
            desc: 'Глобальные параметры конфигурации в формате JSONB (включение/отключение сбора взноса, текущий учебный год, базовая ставка €30).',
            cardDesc: 'Глобальные динамические системные конфигурации (JSONB Key-Value).',
          },
        }
      },

      it: {
        searchPlaceholder: 'Cerca per stati, codici (es. PAID, A1, STRIPE)...',
        searchTrigger: 'Cerca codici e campi...',
        navMain: 'Principale',
        navOverview: 'Architettura & Standard',
        navTables: 'Tabelle del Database',
        navBookings: 'Bookings (Prenotazioni)',
        navPayments: 'Payments (Pagamenti)',
        navCourses: 'Courses (Corsi)',
        navStudents: 'Students (Studenti)',
        navLessons: 'Lessons (Lezioni)',
        navMemberships: 'Annual Memberships (Quote €30)',
        navSettings: 'App Settings (Impostazioni)',
        themeDark: 'Tema scuro',
        themeLight: 'Tema chiaro',
        toastCopied: 'Copiato',
        colId: 'ID',
        colCode: 'Codice TypeScript',
        colLabel: 'Denominazione (IT)',
        colDesc: 'Contesto aziendale e utilizzo',
        tableInPg: 'Tabella:',
        enumsCount: 'Colonne:',
        notFound: 'Nessun risultato trovato',
        overviewTitle: 'Dizionario Dati e Codici Numerici Atena School',
        overviewDesc: 'Standard architetturale unificato per le enumerazioni numeriche (SmallInt Enums) e le entità di sistema della piattaforma Atena School. Tutte le enumerazioni sono rigorosamente tipizzate in TypeScript, ottimizzate in PostgreSQL (2 byte per valore) e supportano traduzioni multilingue (IT / EN / RU).',
        metaStorage: 'Tipo:',
        metaPkg: 'Pacchetto:',
        metaLang: 'Lingue:',
        metaTables: 'Tabelle:',
        calloutTitle: 'Principio della Singola Fonte di Verità (Single Source of Truth)',
        calloutDesc: 'Tutti i codici numerici sono definiti tramite <code>const ... as const</code> nel pacchetto <code>packages/api-types</code>. Il database PostgreSQL utilizza rigorosamente <code>SMALLINT DEFAULT 1</code>, eliminando gli errori umani negli inserimenti e garantendo indici ultra-veloci.',
        registryTitle: 'Registro Tabelle del Database',
        cardTableLabel: 'Tabella:',
        cardColumnsLabel: 'col.',
        tables: {
          bookings: {
            title: 'Prenotazioni e Richieste Corsi',
            desc: "Tabella principale di ordini e prenotazioni. Contiene i dati del contraente, dello studente, il corso selezionato, l'importo, gli sconti e gli stati operativi.",
            cardDesc: 'Ordini e prenotazioni dei corsi. Stati di pagamento, ciclo di vita e piani tariffari.',
          },
          payments: {
            title: 'Pagamenti e Transazioni',
            desc: 'Tabella contabile delle registrazioni finanziarie per prenotazioni e studenti. Ogni corso genera 2 registrazioni: la quota del corso (type=1) e la quota associativa di €30 (type=2).',
            cardDesc: 'Registrazioni contabili: pagamento del corso (tipo=1) e quota associativa annuale €30 (tipo=2).',
          },
          courses: {
            title: 'Catalogo Corsi',
            desc: 'Catalogo accademico dei corsi di lingua (Italiano, Inglese, Russo, ecc.). Livelli CEFR A1..C2, formati individuali/di gruppo e stati di pubblicazione.',
            cardDesc: 'Catalogo programmi scolastici: livelli CEFR A1..C2, formati individuali/di gruppo, stati.',
          },
          students: {
            title: 'Registro Studenti',
            desc: 'Tabella degli studenti della scuola Atena. Memorizza dati anagrafici, livello CEFR, stato accademico e stato del tesseramento annuale.',
            cardDesc: 'Registro studenti: stato accademico (ACTIVE..ARCHIVED), livello linguistico CEFR (A1..C2).',
          },
          lessons: {
            title: 'Lezioni e Presenze',
            desc: "Registro delle singole lezioni a calendario. Gestisce lo svolgimento dell'ora di lezione, il registro presenze (presente, assente, ritardo) e la modalità (in presenza/online).",
            cardDesc: 'Lezioni a calendario: stato di svolgimento, presenze (presente/assente), formati aula/online.',
          },
          annual_memberships: {
            title: 'Quote Associative Annuali (€30)',
            desc: "Tesseramento obbligatorio annuale di €30 per studente. Valido per l'anno scolastico in corso (1 settembre – 31 agosto).",
            cardDesc: 'Tessere associative annuali (€30 per anno accademico): ACTIVE, PENDING, EXPIRED.',
          },
          app_settings: {
            title: 'Configurazioni e Parametri di Sistema',
            desc: 'Parametri di sistema globali salvati in formato JSONB (es. quota iscrizione attiva/disattiva, anno scolastico corrente, importo standard €30).',
            cardDesc: 'Configurazioni di sistema globali dinamiche (JSONB Key-Value).',
          },
        }
      },

      en: {
        searchPlaceholder: 'Search by statuses, codes (e.g. PAID, A1, STRIPE)...',
        searchTrigger: 'Search codes & fields...',
        navMain: 'Main',
        navOverview: 'Architecture & Standards',
        navTables: 'Database Tables',
        navBookings: 'Bookings',
        navPayments: 'Payments',
        navCourses: 'Courses',
        navStudents: 'Students',
        navLessons: 'Lessons',
        navMemberships: 'Annual Memberships (€30)',
        navSettings: 'App Settings',
        themeDark: 'Dark theme',
        themeLight: 'Light theme',
        toastCopied: 'Copied',
        colId: 'ID',
        colCode: 'TypeScript Code',
        colLabel: 'Label (EN)',
        colDesc: 'Business Context & Purpose',
        tableInPg: 'Table:',
        enumsCount: 'Columns:',
        notFound: 'No matching records found',
        overviewTitle: 'Atena School Data Dictionary & Schema Docs',
        overviewDesc: 'Unified architectural standard for numeric enumerations (SmallInt Enums) and system entities of Atena School platform. All enums are strictly typed in TypeScript, optimized in PostgreSQL (2 bytes per value), and support multilingual translations (IT / EN / RU).',
        metaStorage: 'Type:',
        metaPkg: 'Package:',
        metaLang: 'Languages:',
        metaTables: 'Tables:',
        calloutTitle: 'Single Source of Truth Principle',
        calloutDesc: 'All numeric codes are declared via <code>const ... as const</code> in the <code>packages/api-types</code> package. The PostgreSQL database strictly enforces <code>SMALLINT DEFAULT 1</code>, preventing human insertion errors and ensuring ultra-fast indexing.',
        registryTitle: 'Database Tables Registry',
        cardTableLabel: 'Table:',
        cardColumnsLabel: 'cols.',
        tables: {
          bookings: {
            title: 'Bookings & Course Enrollments',
            desc: 'Main table for orders and bookings. Contains purchaser and student details, selected course, total amount, discounts, and workflow statuses.',
            cardDesc: 'Course orders and booking inquiries. Payment states, lifecycle statuses, and payment plans.',
          },
          payments: {
            title: 'Payments & Financial Transactions',
            desc: 'Accounting ledger table for bookings and students. Each course checkout generates 2 records: course payment (type=1) and €30 annual registration fee (type=2).',
            cardDesc: 'Accounting entries: course tuition (type=1) and €30 annual membership fee (type=2).',
          },
          courses: {
            title: 'Course Catalog',
            desc: 'Academic curriculum catalog for language courses (Italian, English, Russian, etc.). CEFR levels A1..C2, individual/group formats, and publishing statuses.',
            cardDesc: 'Curriculum catalog: CEFR levels A1..C2, individual/group formats, publishing statuses.',
          },
          students: {
            title: 'Student Registry',
            desc: 'Central registry of Atena language school students. Stores personal info, CEFR proficiency level, enrollment status, and annual membership status.',
            cardDesc: 'Student registry: enrollment status (ACTIVE..ARCHIVED), CEFR language proficiency (A1..C2).',
          },
          lessons: {
            title: 'Lessons & Attendance',
            desc: 'Timetable lesson registry. Tracks class delivery, attendance status (present, absent, late, excused), and location format (in-person/online).',
            cardDesc: 'Scheduled classes: delivery status, attendance tracking (present/absent), formats.',
          },
          annual_memberships: {
            title: 'Annual Memberships (€30)',
            desc: 'Mandatory €30 annual association membership per student. Valid for the current academic year (September 1 – August 31).',
            cardDesc: 'Annual association membership cards (€30 per academic year): ACTIVE, PENDING, EXPIRED.',
          },
          app_settings: {
            title: 'System Application Settings',
            desc: 'Dynamic system-wide configuration keys stored in JSONB (e.g. registration fee active/inactive, current academic year, default €30 fee).',
            cardDesc: 'Dynamic global system configuration parameters (JSONB Key-Value).',
          },
        }
      },
    };

    // Item-level translation maps
    const ITEM_DESC_I18N = {
      it: {
        'PENDING': 'Sessione di checkout Stripe aperta, in attesa del pagamento da parte del cliente',
        'RESERVED': 'Prenotazione confermata con saldo diretto presso la reception della scuola',
        'PAID': 'Pagamento ricevuto con successo e contabilizzato per intero',
        'REFUNDED': 'È stato effettuato un rimborso totale dei fondi',
        'PARTIALLY_REFUNDED': 'È stato effettuato un rimborso parziale dei fondi',
        'FAILED': 'Transazione di pagamento rifiutata dalla banca o dal gateway',
        'CANCELLED': 'Ordine annullato prima del pagamento',
        'ACTIVE': 'Studente iscritto, corso in fase di svolgimento attivo',
        'COMPLETED': 'Tutte le lezioni sono state completate con successo, corso terminato',
        'SCHEDULED': 'Lezioni pianificate e calendarizzate nel calendario scolastico',
        'PENDING_COORDINATION': 'In attesa di definizione orari con il docente o con la segreteria',
        'STRIPE': 'Carta bancaria online tramite gateway Stripe',
        'CASH': 'Contanti presso la cassa della segreteria',
        'POS': 'Carta di debito/credito tramite terminale POS fisico in sede',
        'BANK_TRANSFER': 'Bonifico bancario diretto su conto della scuola',
        'FULL': 'Pagamento unico anticipato dell intero importo del corso',
        'INSTALLMENTS': 'Pagamento rateizzato secondo piano concordato',
        'PER_LESSON': 'Pagamento ad ogni singola lezione svolta',
        'EUR': 'Euro (€) — valuta predefinita del sistema',
        'USD': 'Dollaro statunitense ($)',
        'GBP': 'Sterlina britannica (£)',
        'COURSE_PAYMENT': 'Pagamento della quota di iscrizione al corso di lingua',
        'REGISTRATION_FEE': 'Quota associativa annuale obbligatoria di €30 (1 volta per anno scolastico)',
        'INSTALLMENT': 'Rata periodica di pagamento del corso',
        'SINGLE_LESSON': 'Pagamento di una lezione individuale singola',
        'EXAM_FEE': 'Tassa per esame di certificazione Cambridge / CELI / CILS',
        'CERTIFICATE_FEE': 'Rilascio certificato o attestato ufficiale',
        'MATERIAL_TEXTBOOK': 'Acquisto libri di testo e materiali didattici',
        'OTHER': 'Altre entrate e servizi accessori',
        'SUCCEEDED': 'Fondi accreditati con successo sul conto',
        'MANUAL': 'Registrazione manuale da parte della segreteria',
        'BANK': 'Bonifico bancario su conto corrente',
        'INACTIVE': 'Formazione non ancora iniziata o profilo temporaneamente inattivo',
        'PAUSED': 'Congedo accademico o pausa temporanea negli studi',
        'GRADUATED': 'Corso completato con successo con rilascio del diploma',
        'ARCHIVED': 'Scheda studente archiviata',
        'A1': 'Livello QCER A1: Principiante assoluto',
        'A2': 'Livello QCER A2: Elementare',
        'B1': 'Livello QCER B1: Intermedio',
        'B2': 'Livello QCER B2: Intermedio superiore / Autonomo',
        'C1': 'Livello QCER C1: Avanzato / Padronanza',
        'C2': 'Livello QCER C2: Madrelingua / Padronanza completa',
        'FIXED_DAYS': 'Giorni e orari prestabiliti a settimana (es. Lun-Mer-Ven)',
        'FLEXIBLE': 'Orario flessibile concordato con il docente',
        'IN_PERSON': 'In presenza nelle aule della scuola',
        'ONLINE': 'Online tramite videoconferenza (Google Meet / Zoom)',
        'HYBRID': 'Formato ibrido (lezioni in presenza e online alternate)',
        'RESCHEDULED': 'Lezione posticipata ad altra data/ora',
        'PRESENT': 'Studente presente alla lezione',
        'ABSENT': 'Studente assente non giustificato',
        'LATE': 'Studente arrivato in ritardo',
        'EXCUSED': 'Assenza giustificata con preavviso',
        'EXPIRED': 'Tessera annuale scaduta il 31 agosto dell anno scolastico',
      },
      en: {
        'PENDING': 'Stripe checkout session active, awaiting client payment',
        'RESERVED': 'Booking confirmed with payment due at school reception',
        'PAID': 'Payment received in full and successfully processed',
        'REFUNDED': 'Full refund of funds has been issued',
        'PARTIALLY_REFUNDED': 'Partial refund has been issued',
        'FAILED': 'Payment transaction declined by bank or gateway',
        'CANCELLED': 'Order cancelled prior to payment',
        'ACTIVE': 'Enrolled student, active ongoing studies',
        'COMPLETED': 'All lessons completed, course finished successfully',
        'SCHEDULED': 'Lessons scheduled on the academic calendar',
        'PENDING_COORDINATION': 'Awaiting schedule coordination with teacher or reception',
        'STRIPE': 'Online credit/debit card via Stripe checkout',
        'CASH': 'Cash payment at school reception desk',
        'POS': 'Physical POS terminal card payment at school',
        'BANK_TRANSFER': 'Direct bank wire transfer to school account',
        'FULL': 'Single full upfront payment for the entire course',
        'INSTALLMENTS': 'Scheduled installment payment plan',
        'PER_LESSON': 'Pay-as-you-go per individual lesson',
        'EUR': 'Euro (€) — default platform currency',
        'USD': 'US Dollar ($)',
        'GBP': 'British Pound (£)',
        'COURSE_PAYMENT': 'Language course tuition fee payment',
        'REGISTRATION_FEE': 'Mandatory €30 annual association membership fee (once per academic year)',
        'INSTALLMENT': 'Scheduled course installment payment',
        'SINGLE_LESSON': 'Individual one-off class payment',
        'EXAM_FEE': 'Cambridge / CELI / CILS exam registration fee',
        'CERTIFICATE_FEE': 'Official diploma or certificate issuance fee',
        'MATERIAL_TEXTBOOK': 'Textbooks and educational study materials',
        'OTHER': 'Other miscellaneous revenue and services',
        'SUCCEEDED': 'Funds successfully settled to school account',
        'MANUAL': 'Manual transaction logged by reception staff',
        'BANK': 'Direct bank wire transfer',
        'INACTIVE': 'Studies have not started or profile temporarily inactive',
        'PAUSED': 'Academic leave or temporary pause in studies',
        'GRADUATED': 'Course successfully completed with diploma issued',
        'ARCHIVED': 'Student record archived',
        'A1': 'CEFR A1: Absolute Beginner',
        'A2': 'CEFR A2: Elementary',
        'B1': 'CEFR B1: Intermediate',
        'B2': 'CEFR B2: Upper Intermediate',
        'C1': 'CEFR C1: Advanced / Proficient',
        'C2': 'CEFR C2: Mastery / Native-like fluency',
        'FIXED_DAYS': 'Fixed weekly schedule (e.g. Mon-Wed-Fri)',
        'FLEXIBLE': 'Flexible lesson schedule coordinated with tutor',
        'IN_PERSON': 'In-person inside school classrooms',
        'ONLINE': 'Live online video conference (Google Meet / Zoom)',
        'HYBRID': 'Hybrid mode (alternating in-person and online)',
        'RESCHEDULED': 'Lesson moved to another date or time',
        'PRESENT': 'Student attended the class',
        'ABSENT': 'Student absent without notice',
        'LATE': 'Student arrived late to class',
        'EXCUSED': 'Excused absence with advance notice',
        'EXPIRED': 'Annual membership card expired on August 31',
      }
    };

    let currentLang = localStorage.getItem('atena_dict_lang') || 'ru';

    function setLanguage(lang) {
      if (!['it', 'en', 'ru'].includes(lang)) lang = 'ru';
      currentLang = lang;
      localStorage.setItem('atena_dict_lang', lang);

      // Update switcher buttons
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.id === 'lang-btn-' + lang);
      });

      // Update static UI texts
      const t = I18N[lang];
      document.getElementById('search-trigger-text').textContent = t.searchTrigger;
      document.getElementById('search-input').placeholder = t.searchPlaceholder;
      document.getElementById('nav-title-main').textContent = t.navMain;
      document.getElementById('nav-item-overview').textContent = t.navOverview;
      document.getElementById('nav-title-tables').textContent = t.navTables;
      document.getElementById('nav-item-bookings').textContent = t.navBookings;
      document.getElementById('nav-item-payments').textContent = t.navPayments;
      document.getElementById('nav-item-courses').textContent = t.navCourses;
      document.getElementById('nav-item-students').textContent = t.navStudents;
      document.getElementById('nav-item-lessons').textContent = t.navLessons;
      document.getElementById('nav-item-annual_memberships').textContent = t.navMemberships;
      document.getElementById('nav-item-app_settings').textContent = t.navSettings;

      // Update Overview texts
      document.getElementById('overview-hero-title').textContent = t.overviewTitle;
      document.getElementById('overview-hero-desc').textContent = t.overviewDesc;
      document.getElementById('meta-storage-text').textContent = t.metaStorage;
      document.getElementById('meta-pkg-text').textContent = t.metaPkg;
      document.getElementById('meta-lang-text').textContent = t.metaLang;
      document.getElementById('meta-tables-text').textContent = t.metaTables;
      document.getElementById('callout-title-text').textContent = t.calloutTitle;
      document.getElementById('callout-desc-text').innerHTML = t.calloutDesc;
      document.getElementById('registry-title-text').textContent = t.registryTitle;

      // Re-render Overview Cards
      renderOverviewCards();

      // Re-render table views to update columns and single labels
      renderTableViews();

      // Maintain active tab
      const currentTab = window.location.hash.replace('#', '') || 'overview';
      switchTab(currentTab);
    }

    function getValLabel(valData, lang) {
      if (lang === 'it') return valData.label_it || valData.label_en || valData.label_ru || '—';
      if (lang === 'en') return valData.label_en || valData.label_it || valData.label_ru || '—';
      return valData.label_ru || valData.label_en || valData.label_it || '—';
    }

    function getValDesc(valData, lang) {
      if (lang === 'it' && ITEM_DESC_I18N.it[valData.code]) {
        return ITEM_DESC_I18N.it[valData.code];
      }
      if (lang === 'en' && ITEM_DESC_I18N.en[valData.code]) {
        return ITEM_DESC_I18N.en[valData.code];
      }
      return valData.description || '—';
    }

    function renderOverviewCards() {
      const container = document.getElementById('overview-cards-container');
      const t = I18N[currentLang];
      let html = '';

      for (const [tableKey, tableData] of Object.entries(DICTIONARY_DATA.tables)) {
        const icon = TABLE_ICONS[tableKey] || '📑';
        const localizedTable = (t.tables && t.tables[tableKey]) || {};
        const title = localizedTable.title || tableData.title;
        const cardDesc = localizedTable.cardDesc || tableData.description;
        const colCount = Object.keys(tableData.columns).length;

        html += \`
          <a class="overview-card" onclick="switchTab('\${tableKey}')">
            <div class="overview-card-header">
              <span class="overview-card-icon">\${icon}</span>
              <span class="overview-card-title">\${title}</span>
            </div>
            <p class="overview-card-desc">\${cardDesc}</p>
            <div class="overview-card-footer">
              <span>\${t.cardTableLabel} <code>\${tableKey}</code></span>
              <span>\${colCount} \${t.cardColumnsLabel}</span>
            </div>
          </a>
        \`;
      }

      container.innerHTML = html;
    }

    // Render Dynamic Views for each Table in Pure Notion Style
    function renderTableViews() {
      const container = document.getElementById('dynamic-table-views');
      const t = I18N[currentLang];
      let html = '';

      for (const [tableKey, tableData] of Object.entries(DICTIONARY_DATA.tables)) {
        const icon = TABLE_ICONS[tableKey] || '📑';
        const localizedTable = (t.tables && t.tables[tableKey]) || {};
        const tableTitle = localizedTable.title || tableData.title;
        const tableDesc = localizedTable.desc || tableData.description;
        
        html += \`
          <div id="view-\${tableKey}" class="view-container">
            <div class="hero-header">
              <div class="hero-header-top">
                <div class="hero-icon-badge">\${icon}</div>
                <div class="hero-header-text">
                  <h1 class="hero-title">\${tableTitle}</h1>
                  <div class="meta-badges">
                    <span class="meta-pill">\${t.tableInPg} <code>public.\${tableData.table}</code></span>
                    <span class="meta-pill">\${t.enumsCount} <code>\${Object.keys(tableData.columns).length}</code></span>
                  </div>
                </div>
              </div>
              <p class="hero-desc">\${tableDesc}</p>
            </div>
        \`;

        // Render each enum column in this table
        for (const [colKey, colData] of Object.entries(tableData.columns)) {
          html += \`
            <div class="enum-card">
              <div class="enum-card-header">
                <div class="enum-card-header-left">
                  <span class="column-name-badge">
                    <code>\${colData.column}</code>
                  </span>
                  <span class="enum-type-badge">\${colData.name}</span>
                </div>
                <div>
                  <span class="db-type-badge">\${colData.dbType}</span>
                </div>
              </div>

              <div class="table-container">
                <table class="dict-table">
                  <thead>
                    <tr>
                      <th style="width: 44px; text-align: center;">\${t.colId}</th>
                      <th style="width: 170px;">\${t.colCode}</th>
                      <th style="width: 220px;">\${t.colLabel}</th>
                      <th>\${t.colDesc}</th>
                    </tr>
                  </thead>
                  <tbody>
          \`;

          for (const [valKey, valData] of Object.entries(colData.values)) {
            const label = getValLabel(valData, currentLang);
            const desc = getValDesc(valData, currentLang);

            html += \`
              <tr>
                <td style="text-align: center;">
                  <span class="id-badge" onclick="copyText('\${valData.id}', 'ID \${valData.id}')" title="Скопировать ID \${valData.id}">\${valData.id}</span>
                </td>
                <td>
                  <span class="code-badge" onclick="copyText('\${colData.name}.\${valData.code}', '\${colData.name}.\${valData.code}')" title="Скопировать \${colData.name}.\${valData.code}">\${valData.code}</span>
                </td>
                <td>
                  <span class="single-label-wrapper">\${label}</span>
                </td>
                <td style="color: var(--text-secondary); line-height: 1.5; font-size: 12.5px;">
                  \${desc}
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
      document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.tab === tabKey);
      });

      document.querySelectorAll('.view-container').forEach(el => {
        el.classList.remove('active');
      });

      const targetView = document.getElementById('view-' + tabKey);
      if (targetView) {
        targetView.classList.add('active');
      } else {
        document.getElementById('view-overview').classList.add('active');
      }

      const t = I18N[currentLang];
      const localizedTable = (t.tables && t.tables[tabKey]) || {};
      const title = tabKey === 'overview' ? t.navOverview : (localizedTable.title || tabKey);
      document.getElementById('current-breadcrumb').textContent = title;

      if (window.location.hash !== '#' + tabKey) {
        history.pushState(null, null, '#' + tabKey);
      }

      document.querySelector('.main-wrapper').scrollTop = 0;
    }

    function copyText(text, label) {
      navigator.clipboard.writeText(text).then(() => {
        const t = I18N[currentLang];
        showToast(t.toastCopied + ': ' + (label || text));
      });
    }

    function showToast(text) {
      const t = document.getElementById('toast');
      document.getElementById('toast-text').textContent = text;
      t.classList.add('show');
      setTimeout(() => {
        t.classList.remove('show');
      }, 1800);
    }

    function toggleTheme() {
      const isDark = document.body.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      document.body.setAttribute('data-theme', newTheme);
      document.getElementById('theme-icon').textContent = newTheme === 'dark' ? '☀️' : '🌙';
      
      const t = I18N[currentLang];
      document.getElementById('theme-label').textContent = newTheme === 'dark' ? t.themeLight : t.themeDark;
      localStorage.setItem('atena_dict_theme', newTheme);
    }

    const savedTheme = localStorage.getItem('atena_dict_theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-icon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';

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
      const t = I18N[currentLang];

      for (const [tableKey, tableData] of Object.entries(DICTIONARY_DATA.tables)) {
        const localizedTable = (t.tables && t.tables[tableKey]) || {};
        const tableTitle = localizedTable.title || tableData.title;

        for (const [colKey, colData] of Object.entries(tableData.columns)) {
          for (const [valKey, valData] of Object.entries(colData.values)) {
            const labelIt = (valData.label_it || '').toLowerCase();
            const labelEn = (valData.label_en || '').toLowerCase();
            const labelRu = (valData.label_ru || '').toLowerCase();
            const desc = getValDesc(valData, currentLang).toLowerCase();

            const matches = 
              !query ||
              colData.name.toLowerCase().includes(query) ||
              valData.code.toLowerCase().includes(query) ||
              String(valData.id).includes(query) ||
              labelIt.includes(query) ||
              labelEn.includes(query) ||
              labelRu.includes(query) ||
              desc.includes(query);

            if (matches) {
              results.push({
                tableKey,
                tableTitle,
                enumName: colData.name,
                code: valData.code,
                id: valData.id,
                label: getValLabel(valData, currentLang),
                desc: getValDesc(valData, currentLang),
              });
            }
          }
        }
      }

      if (results.length === 0) {
        resultsContainer.innerHTML = \`<div style="padding: 20px; text-align: center; color: var(--text-tertiary); font-size: 13px;">\${t.notFound}</div>\`;
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

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape') {
        closeSearch();
      }
    });

    window.addEventListener('DOMContentLoaded', () => {
      setLanguage(currentLang);
    });

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'overview';
      switchTab(hash);
    });
  </script>
</body>
</html>`;
}

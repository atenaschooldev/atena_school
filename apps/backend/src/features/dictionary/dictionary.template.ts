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
      --bg-page: #F9FAFB;
      --bg-sidebar: #FFFFFF;
      --bg-card: #FFFFFF;
      --bg-card-hover: #F8FAFC;
      --bg-table-head: #F8FAFC;
      --bg-subtle: #F1F5F9;
      --bg-code: #F8FAFC;
      --border: #E2E8F0;
      --border-subtle: #EDF2F7;
      --border-focus: #3B82F6;
      
      --text-main: #0F172A;
      --text-secondary: #475569;
      --text-tertiary: #94A3B8;
      
      --accent: #2563EB;
      --accent-light: #EFF6FF;
      --accent-hover: #1D4ED8;
      --accent-border: #BFDBFE;

      --tag-gray-bg: #F1F5F9;
      --tag-gray-text: #475569;
      --tag-blue-bg: #EFF6FF;
      --tag-blue-text: #1D4ED8;

      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
      
      --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
      --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      --shadow-lg: 0 10px 25px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03);
      
      --sidebar-width: 280px;
    }

    [data-theme="dark"] {
      --bg-page: #0B0F19;
      --bg-sidebar: #111827;
      --bg-card: #111827;
      --bg-card-hover: #1E293B;
      --bg-table-head: #161F30;
      --bg-subtle: #1F2937;
      --bg-code: #0B0F19;
      --border: #1F2937;
      --border-subtle: #1A2234;
      --border-focus: #60A5FA;
      
      --text-main: #F8FAFC;
      --text-secondary: #94A3B8;
      --text-tertiary: #64748B;
      
      --accent: #3B82F6;
      --accent-light: #1E293B;
      --accent-hover: #60A5FA;
      --accent-border: #1D4ED8;

      --tag-gray-bg: #1F2937;
      --tag-gray-text: #CBD5E1;
      --tag-blue-bg: #172554;
      --tag-blue-text: #93C5FD;

      --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
      --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
      --shadow-lg: 0 10px 25px -3px rgba(0, 0, 0, 0.5);
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
      padding: 18px 20px 14px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .brand-row {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: var(--text-main);
    }

    .brand-logo {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
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
      font-size: 11.5px;
      font-weight: 500;
      color: var(--text-tertiary);
    }

    .search-trigger {
      margin: 14px 16px 8px;
      padding: 9px 12px;
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
      box-shadow: var(--shadow-xs);
    }

    .search-trigger:hover {
      border-color: var(--accent);
      color: var(--text-main);
      box-shadow: var(--shadow-sm);
    }

    .search-trigger kbd {
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 5px;
      padding: 2px 6px;
      font-size: 11px;
      font-family: var(--font-mono);
      font-weight: 600;
      color: var(--text-secondary);
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
      letter-spacing: 0.06em;
      color: var(--text-tertiary);
      padding: 14px 10px 6px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 500;
      color: var(--text-secondary);
      text-decoration: none;
      cursor: pointer;
      transition: all 0.12s ease;
      margin-bottom: 2px;
      border: 1px solid transparent;
    }

    .nav-item:hover {
      background-color: var(--bg-subtle);
      color: var(--text-main);
    }

    .nav-item.active {
      background-color: var(--accent-light);
      color: var(--accent);
      font-weight: 600;
      border-color: var(--accent-border);
    }

    .nav-item-icon {
      font-size: 16px;
      line-height: 1;
      width: 20px;
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

    .nav-item.active .nav-item-badge {
      border-color: var(--accent-border);
      color: var(--accent);
      background: #FFF;
    }

    [data-theme="dark"] .nav-item.active .nav-item-badge {
      background: var(--bg-card);
    }

    .sidebar-footer {
      padding: 14px 16px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      background: var(--bg-sidebar);
    }

    .theme-toggle-btn {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 6px 12px;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 12.5px;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    .theme-toggle-btn:hover {
      background: var(--bg-subtle);
      color: var(--text-main);
      border-color: var(--text-tertiary);
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
      height: 56px;
      border-bottom: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 30;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 40px;
    }

    [data-theme="dark"] .top-header {
      background: rgba(17, 24, 39, 0.85);
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13.5px;
      color: var(--text-tertiary);
    }

    .breadcrumb-active {
      color: var(--text-main);
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .lang-switcher {
      display: flex;
      align-items: center;
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 2px;
      gap: 2px;
    }

    .lang-btn {
      background: transparent;
      border: none;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.12s ease;
    }

    .lang-btn:hover {
      color: var(--text-main);
    }

    .lang-btn.active {
      background: var(--bg-card);
      color: var(--accent);
      box-shadow: var(--shadow-xs);
    }

    .header-link-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-secondary);
      text-decoration: none;
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--bg-card);
      transition: all 0.15s ease;
      box-shadow: var(--shadow-xs);
    }

    .header-link-btn:hover {
      background: var(--bg-subtle);
      color: var(--text-main);
      border-color: var(--accent);
    }

    .page-content {
      max-width: 1160px;
      width: 100%;
      margin: 0 auto;
      padding: 36px 40px 100px;
    }

    .view-container {
      display: none;
    }

    .view-container.active {
      display: block;
      animation: fadeIn 0.15s ease forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(3px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .hero-header {
      margin-bottom: 32px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 24px 28px;
      box-shadow: var(--shadow-xs);
    }

    .hero-header-top {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 12px;
    }

    .hero-icon-badge {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      flex-shrink: 0;
    }

    .hero-header-text {
      flex: 1;
    }

    .hero-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-main);
      margin-bottom: 4px;
    }

    .hero-desc {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-top: 8px;
    }

    .meta-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }

    .meta-pill {
      font-size: 12px;
      font-weight: 500;
      padding: 4px 10px;
      border-radius: 6px;
      background: var(--bg-subtle);
      color: var(--text-secondary);
      border: 1px solid var(--border);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .meta-pill code {
      font-family: var(--font-mono);
      font-size: 11.5px;
      font-weight: 600;
      color: var(--text-main);
    }

    .callout {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-left: 4px solid var(--accent);
      border-radius: 10px;
      padding: 18px 20px;
      margin-bottom: 28px;
      display: flex;
      gap: 14px;
      align-items: flex-start;
      box-shadow: var(--shadow-xs);
    }

    .callout-icon {
      font-size: 22px;
      line-height: 1;
    }

    .callout-content {
      font-size: 13.5px;
      line-height: 1.6;
      color: var(--text-secondary);
    }

    .callout-title {
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 4px;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
      margin-top: 20px;
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
      box-shadow: var(--shadow-xs);
    }

    .overview-card:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .overview-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }

    .overview-card-icon {
      font-size: 24px;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: var(--bg-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border-subtle);
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

    .enum-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 14px;
      margin-bottom: 32px;
      box-shadow: var(--shadow-xs);
      overflow: hidden;
      transition: border-color 0.15s ease;
    }

    .enum-card:hover {
      border-color: #CBD5E1;
    }

    [data-theme="dark"] .enum-card:hover {
      border-color: #334155;
    }

    .enum-card-header {
      padding: 16px 20px;
      background: var(--bg-table-head);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .enum-card-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .column-name-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
    }

    .column-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent);
    }

    .column-name-badge code {
      font-family: var(--font-mono);
      font-size: 14px;
      background: var(--bg-subtle);
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid var(--border);
    }

    .enum-type-badge {
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
      background: var(--tag-blue-bg);
      color: var(--tag-blue-text);
      border: 1px solid rgba(37, 99, 235, 0.15);
    }

    .db-type-badge {
      font-size: 11.5px;
      font-family: var(--font-mono);
      font-weight: 500;
      color: var(--text-tertiary);
      background: var(--bg-card);
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid var(--border);
    }



    .table-container {
      width: 100%;
      overflow-x: auto;
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
      padding: 10px 18px;
      border-bottom: 1px solid var(--border);
      font-size: 11.5px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      white-space: nowrap;
    }

    .dict-table td {
      padding: 12px 18px;
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
      min-width: 26px;
      height: 26px;
      padding: 0 6px;
      border-radius: 6px;
      background: var(--tag-blue-bg);
      color: var(--tag-blue-text);
      font-family: var(--font-mono);
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      border: 1px solid rgba(37, 99, 235, 0.2);
      transition: all 0.12s ease;
    }

    .id-badge:hover {
      transform: scale(1.1);
      background: var(--accent);
      color: #FFF;
    }

    .code-badge {
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
      background: var(--tag-gray-bg);
      color: var(--tag-gray-text);
      border: 1px solid var(--border);
      cursor: pointer;
      display: inline-block;
      transition: all 0.12s ease;
    }

    .code-badge:hover {
      background: var(--accent-light);
      color: var(--accent);
      border-color: var(--accent-border);
    }

    .lang-flag {
      font-size: 14px;
      margin-right: 6px;
      vertical-align: -1px;
    }

    .single-label-wrapper {
      display: inline-flex;
      align-items: center;
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-main);
    }

    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
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
      max-width: 640px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 14px;
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      animation: modalSlide 0.15s ease forwards;
    }

    @keyframes modalSlide {
      from { transform: scale(0.97); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .search-input-wrapper {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--bg-card);
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
      max-height: 400px;
      overflow-y: auto;
      padding: 8px;
    }

    .search-item {
      padding: 10px 14px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      transition: background 0.1s ease;
    }

    .search-item:hover, .search-item.selected {
      background: var(--bg-subtle);
    }

    .search-item-left {
      display: flex;
      align-items: center;
      gap: 12px;
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

    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0F172A;
      color: #FFF;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: var(--shadow-lg);
      z-index: 200;
      display: none;
      align-items: center;
      gap: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      animation: toastIn 0.15s ease forwards;
    }

    [data-theme="dark"] .toast {
      background: #F8FAFC;
      color: #0F172A;
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

  <!-- SIDEBAR -->
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
      <span id="search-trigger-text">🔍 Поиск по кодам & полям...</span>
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
        <!-- 3-Way Language Switcher -->
        <div class="lang-switcher">
          <button class="lang-btn" id="lang-btn-it" onclick="setLanguage('it')" title="Italiano">
            <span class="lang-flag">🇮🇹</span> IT
          </button>
          <button class="lang-btn" id="lang-btn-en" onclick="setLanguage('en')" title="English">
            <span class="lang-flag">🇬🇧</span> EN
          </button>
          <button class="lang-btn active" id="lang-btn-ru" onclick="setLanguage('ru')" title="Русский">
            <span class="lang-flag">🇷🇺</span> RU
          </button>
        </div>

        <a href="/docs" target="_blank" class="header-link-btn">
          <span>⚡</span> <span>Swagger UI</span>
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
                <span class="meta-pill">💾 <span id="meta-storage-text">Тип хранения:</span> <code>SMALLINT (2 Bytes)</code></span>
                <span class="meta-pill">🛡️ <span id="meta-pkg-text">Пакет типов:</span> <code>@atena/api-types</code></span>
                <span class="meta-pill">🌐 <span id="meta-lang-text">Языки:</span> <code>IT, EN, RU</code></span>
                <span class="meta-pill">⚡ <span id="meta-tables-text">Таблиц в схеме:</span> <code>7</code></span>
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

        <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 14px; color: var(--text-main);" id="registry-title-text">Реестр таблиц базы данных</h2>
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

    // Full 3-Way i18n Dictionary
    const I18N = {
      ru: {
        searchPlaceholder: 'Поиск по статусам, кодам (например, PAID, A1, STRIPE)...',
        searchTrigger: '🔍 Поиск по кодам & полям...',
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
        columnPrefix: 'Колонка:',
        tableInPg: 'Таблица в PostgreSQL:',
        enumsCount: 'Колонок со справочниками:',
        notFound: 'Ничего не найдено',
        overviewTitle: 'Словарь данных и перечислений Atena School',
        overviewDesc: 'Единый архитектурный стандарт числовых перечислений (SmallInt Enums) и системных сущностей платформы Atena School. Все перечисления строго типизированы в TypeScript, оптимизированы в PostgreSQL (2 байта на значение) и поддерживают мультиязычные переводы (IT / EN / RU).',
        metaStorage: 'Тип хранения:',
        metaPkg: 'Пакет типов:',
        metaLang: 'Языки:',
        metaTables: 'Таблиц в схеме:',
        calloutTitle: 'Принцип единого источника правды (Single Source of Truth)',
        calloutDesc: 'Все числовые коды объявляются через <code>const ... as const</code> в пакете <code>packages/api-types</code>. База данных PostgreSQL использует строгие <code>SMALLINT DEFAULT 1</code>, исключая человеческие ошибки при вставках и обеспечивая ультра-быстрые индексы.',
        registryTitle: 'Реестр таблиц базы данных',
        cardTableLabel: 'Таблица:',
        cardColumnsLabel: 'колонок',
        tables: {
          bookings: {
            title: 'Бронирования и заявки на курсы',
            desc: 'Основная таблица заказов и бронирований. Содержит данные плательщика, студента, выбранный курс, сумму, скидки и статусы.',
            cardDesc: 'Заказы и бронирования курсов клиентами. Статусы оплаты, жизненного цикла, схемы оплат.',
            columns: {
              payment_status: 'Статус онлайн/офлайн оплаты бронирования (1=PENDING..7=CANCELLED)',
              booking_status: 'Общий жизненный статус брони (1=ACTIVE, 2=COMPLETED, 3=CANCELLED)',
              scheduling_status: 'Статус согласования расписания занятий (1=SCHEDULED, 2=PENDING_COORDINATION)',
              payment_method: 'Выбранный клиентом способ оплаты курса (1=STRIPE..4=BANK_TRANSFER)',
              billing_scheme: 'Схема оплаты курса (1=FULL, 2=INSTALLMENTS, 3=PER_LESSON)',
            }
          },
          payments: {
            title: 'Платежи и транзакции',
            desc: 'Финансовая таблица бухгалтерских записей и проводок по бронированиям и студентам. Каждый курс генерирует 2 записи: оплату курса (type=1) и членский взнос €30 (type=2).',
            cardDesc: 'Бухгалтерские проводки: оплата курса (type=1) и членский взнос €30 (type=2).',
            columns: {
              currency: 'Валюта платежной транзакции (1=EUR, 2=USD, 3=GBP)',
              payment_method: 'Фактический платежный инструмент (1=STRIPE..4=BANK_TRANSFER)',
              type: 'Бухгалтерский тип платежа (1=COURSE_PAYMENT, 2=REGISTRATION_FEE (€30)..8=OTHER)',
              status: 'Статус финансовой транзакции (1=PENDING, 2=SUCCEEDED..6=CANCELLED)',
              provider: 'Платежный провайдер / шлюз (1=STRIPE, 2=MANUAL, 3=POS, 4=BANK)',
            }
          },
          courses: {
            title: 'Каталог курсов',
            desc: 'Академический каталог программ школы (итальянский, английский, русский и др.). Уровни CEFR A1..C2, индивидуальные/групповые форматы и статусы публикации.',
            cardDesc: 'Каталог программ школы: уровни A1..C2, индивидуальные/групповые форматы, статусы.',
            columns: {
              status: 'Статус публикации и доступности курса в каталоге (1=ACTIVE, 2=ARCHIVED)',
              schedule_type: 'Тип графика проведения занятий (1=FIXED_DAYS, 2=FLEXIBLE)',
              course_format: 'Формат проведения занятий (1=IN_PERSON, 2=ONLINE, 3=HYBRID)',
            }
          },
          students: {
            title: 'Реестр студентов',
            desc: 'Основная таблица студентов языковой школы Atena. Хранит персональные данные, уровень CEFR, статус обучения и статус оплаты годового взноса.',
            cardDesc: 'Реестр студентов: статус обучения (ACTIVE..ARCHIVED), уровень владения языком CEFR (A1..C2).',
            columns: {
              status: 'Статус студента в реестре школы (1=ACTIVE, 2=INACTIVE, 3=PAUSED, 4=GRADUATED, 5=ARCHIVED)',
              language_level: 'Уровень владения языком по европейской шкале CEFR (1=A1..6=C2)',
            }
          },
          lessons: {
            title: 'Уроки и расписание',
            desc: 'Журнал индивидуальных и групповых уроков в расписании. Отслеживает проведение занятий, посещаемость (присутствовал, отсутствовал, опоздал) и формат (очно/онлайн).',
            cardDesc: 'Уроки в расписании: статус проведения, отметки о посещаемости (present/absent), форматы.',
            columns: {
              status: 'Статус проведения урока в расписании (1=SCHEDULED, 2=COMPLETED, 3=CANCELLED, 4=RESCHEDULED)',
              attendance: 'Отметка о посещаемости студента на уроке (1=PENDING, 2=PRESENT, 3=ABSENT, 4=LATE, 5=EXCUSED)',
              location_type: 'Место проведения занятия (1=IN_PERSON, 2=ONLINE, 3=HYBRID)',
            }
          },
          annual_memberships: {
            title: 'Годовые членские взносы (€30)',
            desc: 'Обязательный ежегодный ассоциативный взнос €30 на каждого студента. Действует в рамках учебного года (1 сентября — 31 августа).',
            cardDesc: 'Годовые членские карты ассоциации (€30 за учебный год): ACTIVE, PENDING, EXPIRED.',
            columns: {
              status: 'Статус действия годового членского взноса (1=ACTIVE, 2=PENDING, 3=EXPIRED)',
            }
          },
          app_settings: {
            title: 'Системные настройки приложения',
            desc: 'Глобальные параметры конфигурации в формате JSONB (включение/отключение сбора взноса, текущий учебный год, базовая ставка €30).',
            cardDesc: 'Глобальные динамические системные конфигурации (JSONB Key-Value).',
            columns: {
              registration_fee_status: 'Статус обязательности членского взноса €30 при чекауте (1=ACTIVE, 2=INACTIVE)',
            }
          },
        }
      },

      it: {
        searchPlaceholder: 'Cerca per stati, codici (es. PAID, A1, STRIPE)...',
        searchTrigger: '🔍 Cerca codici e campi...',
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
        columnPrefix: 'Colonna:',
        tableInPg: 'Tabella in PostgreSQL:',
        enumsCount: 'Colonne con dizionari:',
        notFound: 'Nessun risultato trovato',
        overviewTitle: 'Dizionario Dati e Codici Numerici Atena School',
        overviewDesc: 'Standard architetturale unificato per le enumerazioni numeriche (SmallInt Enums) e le entità di sistema della piattaforma Atena School. Tutte le enumerazioni sono rigorosamente tipizzate in TypeScript, ottimizzate in PostgreSQL (2 byte per valore) e supportano traduzioni multilingue (IT / EN / RU).',
        metaStorage: 'Tipo di memorizzazione:',
        metaPkg: 'Pacchetto tipi:',
        metaLang: 'Lingue:',
        metaTables: 'Tabelle nello schema:',
        calloutTitle: 'Principio della Singola Fonte di Verità (Single Source of Truth)',
        calloutDesc: 'Tutti i codici numerici sono definiti tramite <code>const ... as const</code> nel pacchetto <code>packages/api-types</code>. Il database PostgreSQL utilizza rigorosamente <code>SMALLINT DEFAULT 1</code>, eliminando gli errori umani negli inserimenti e garantendo indici ultra-veloci.',
        registryTitle: 'Registro Tabelle del Database',
        cardTableLabel: 'Tabella:',
        cardColumnsLabel: 'colonne',
        tables: {
          bookings: {
            title: 'Prenotazioni e Richieste Corsi',
            desc: "Tabella principale di ordini e prenotazioni. Contiene i dati del contraente, dello studente, il corso selezionato, l'importo, gli sconti e gli stati operativi.",
            cardDesc: 'Ordini e prenotazioni dei corsi. Stati di pagamento, ciclo di vita e piani tariffari.',
            columns: {
              payment_status: 'Stato del pagamento online/offline della prenotazione (1=PENDING..7=CANCELLED)',
              booking_status: 'Stato generale del ciclo di vita della prenotazione (1=ACTIVE, 2=COMPLETED, 3=CANCELLED)',
              scheduling_status: 'Stato di coordinamento e inserimento a calendario (1=SCHEDULED, 2=PENDING_COORDINATION)',
              payment_method: 'Metodo di pagamento selezionato dal cliente (1=STRIPE..4=BANK_TRANSFER)',
              billing_scheme: 'Piano di fatturazione e rateizzazione (1=FULL, 2=INSTALLMENTS, 3=PER_LESSON)',
            }
          },
          payments: {
            title: 'Pagamenti e Transazioni',
            desc: 'Tabella contabile delle registrazioni finanziarie per prenotazioni e studenti. Ogni corso genera 2 registrazioni: la quota del corso (type=1) e la quota associativa di €30 (type=2).',
            cardDesc: 'Registrazioni contabili: pagamento del corso (tipo=1) e quota associativa annuale €30 (tipo=2).',
            columns: {
              currency: 'Valuta della transazione finanziaria (1=EUR, 2=USD, 3=GBP)',
              payment_method: 'Strumento effettivo di pagamento utilizzato (1=STRIPE..4=BANK_TRANSFER)',
              type: 'Tipologia contabile del pagamento (1=CORSO, 2=QUOTA_ISCRIZIONE_30€..8=ALTRO)',
              status: 'Stato della transazione finanziaria (1=PENDING, 2=SUCCEEDED..6=CANCELLED)',
              provider: 'Fornitore di pagamento / gateway (1=STRIPE, 2=MANUALE, 3=POS, 4=BONIFICO)',
            }
          },
          courses: {
            title: 'Catalogo Corsi',
            desc: 'Catalogo accademico dei corsi di lingua (Italiano, Inglese, Russo, ecc.). Livelli CEFR A1..C2, formati individuali/di gruppo e stati di pubblicazione.',
            cardDesc: 'Catalogo programmi scolastici: livelli CEFR A1..C2, formati individuali/di gruppo, stati.',
            columns: {
              status: 'Stato di visibilità e disponibilità del corso a catalogo (1=ACTIVE, 2=ARCHIVED)',
              schedule_type: 'Tipologia di programmazione oraria (1=FIXED_DAYS, 2=FLEXIBLE)',
              course_format: 'Modalità di svolgimento del corso (1=IN_PERSON, 2=ONLINE, 3=HYBRID)',
            }
          },
          students: {
            title: 'Registro Studenti',
            desc: 'Tabella degli studenti della scuola Atena. Memorizza dati anagrafici, livello CEFR, stato accademico e stato del tesseramento annuale.',
            cardDesc: 'Registro studenti: stato accademico (ACTIVE..ARCHIVED), livello linguistico CEFR (A1..C2).',
            columns: {
              status: 'Stato dello studente nel registro scolastico (1=ACTIVE, 2=INACTIVE, 3=PAUSED, 4=GRADUATED, 5=ARCHIVED)',
              language_level: 'Livello di competenza linguistica quadro QCER / CEFR (1=A1..6=C2)',
            }
          },
          lessons: {
            title: 'Lezioni e Presenze',
            desc: "Registro delle singole lezioni a calendario. Gestisce lo svolgimento dell'ora di lezione, il registro presenze (presente, assente, ritardo) e la modalità (in presenza/online).",
            cardDesc: 'Lezioni a calendario: stato di svolgimento, presenze (presente/assente), formati aula/online.',
            columns: {
              status: 'Stato di svolgimento della lezione a calendario (1=SCHEDULED, 2=COMPLETED, 3=CANCELLED, 4=RESCHEDULED)',
              attendance: "Registro presenze dello studente per l'ora di lezione (1=PENDING, 2=PRESENT, 3=ABSENT, 4=LATE, 5=EXCUSED)",
              location_type: 'Luogo e modalità di svolgimento della lezione (1=IN_PERSON, 2=ONLINE, 3=HYBRID)',
            }
          },
          annual_memberships: {
            title: 'Quote Associative Annuali (€30)',
            desc: "Tesseramento obbligatorio annuale di €30 per studente. Valido per l'anno scolastico in corso (1 settembre – 31 agosto).",
            cardDesc: 'Tessere associative annuali (€30 per anno accademico): ACTIVE, PENDING, EXPIRED.',
            columns: {
              status: 'Stato di validità della tessera annuale (1=ACTIVE, 2=PENDING, 3=EXPIRED)',
            }
          },
          app_settings: {
            title: 'Configurazioni e Parametri di Sistema',
            desc: 'Parametri di sistema globali salvati in formato JSONB (es. quota iscrizione attiva/disattiva, anno scolastico corrente, importo standard €30).',
            cardDesc: 'Configurazioni di sistema globali dinamiche (JSONB Key-Value).',
            columns: {
              registration_fee_status: 'Stato obbligatorietà quota iscrizione €30 al checkout (1=ACTIVE, 2=INACTIVE)',
            }
          },
        }
      },

      en: {
        searchPlaceholder: 'Search by statuses, codes (e.g. PAID, A1, STRIPE)...',
        searchTrigger: '🔍 Search codes & fields...',
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
        columnPrefix: 'Column:',
        tableInPg: 'PostgreSQL Table:',
        enumsCount: 'Dictionary columns:',
        notFound: 'No matching records found',
        overviewTitle: 'Atena School Data Dictionary & Schema Docs',
        overviewDesc: 'Unified architectural standard for numeric enumerations (SmallInt Enums) and system entities of Atena School platform. All enums are strictly typed in TypeScript, optimized in PostgreSQL (2 bytes per value), and support multilingual translations (IT / EN / RU).',
        metaStorage: 'Storage Type:',
        metaPkg: 'Type Package:',
        metaLang: 'Languages:',
        metaTables: 'Schema Tables:',
        calloutTitle: 'Single Source of Truth Principle',
        calloutDesc: 'All numeric codes are declared via <code>const ... as const</code> in the <code>packages/api-types</code> package. The PostgreSQL database strictly enforces <code>SMALLINT DEFAULT 1</code>, preventing human insertion errors and ensuring ultra-fast indexing.',
        registryTitle: 'Database Tables Registry',
        cardTableLabel: 'Table:',
        cardColumnsLabel: 'columns',
        tables: {
          bookings: {
            title: 'Bookings & Course Enrollments',
            desc: 'Main table for orders and bookings. Contains purchaser and student details, selected course, total amount, discounts, and workflow statuses.',
            cardDesc: 'Course orders and booking inquiries. Payment states, lifecycle statuses, and payment plans.',
            columns: {
              payment_status: 'Booking online/offline payment status (1=PENDING..7=CANCELLED)',
              booking_status: 'General booking lifecycle status (1=ACTIVE, 2=COMPLETED, 3=CANCELLED)',
              scheduling_status: 'Class scheduling and coordination status (1=SCHEDULED, 2=PENDING_COORDINATION)',
              payment_method: 'Payment instrument selected by client (1=STRIPE..4=BANK_TRANSFER)',
              billing_scheme: 'Course billing scheme (1=FULL, 2=INSTALLMENTS, 3=PER_LESSON)',
            }
          },
          payments: {
            title: 'Payments & Financial Transactions',
            desc: 'Accounting ledger table for bookings and students. Each course checkout generates 2 records: course payment (type=1) and €30 annual registration fee (type=2).',
            cardDesc: 'Accounting entries: course tuition (type=1) and €30 annual membership fee (type=2).',
            columns: {
              currency: 'Financial transaction currency (1=EUR, 2=USD, 3=GBP)',
              payment_method: 'Actual payment instrument used (1=STRIPE..4=BANK_TRANSFER)',
              type: 'Accounting payment classification (1=COURSE, 2=REGISTRATION_FEE_€30..8=OTHER)',
              status: 'Financial transaction status (1=PENDING, 2=SUCCEEDED..6=CANCELLED)',
              provider: 'Payment provider / gateway (1=STRIPE, 2=MANUAL, 3=POS, 4=BANK)',
            }
          },
          courses: {
            title: 'Course Catalog',
            desc: 'Academic curriculum catalog for language courses (Italian, English, Russian, etc.). CEFR levels A1..C2, individual/group formats, and publishing statuses.',
            cardDesc: 'Curriculum catalog: CEFR levels A1..C2, individual/group formats, publishing statuses.',
            columns: {
              status: 'Course catalog visibility & enrollment status (1=ACTIVE, 2=ARCHIVED)',
              schedule_type: 'Course schedule structure (1=FIXED_DAYS, 2=FLEXIBLE)',
              course_format: 'Course delivery format (1=IN_PERSON, 2=ONLINE, 3=HYBRID)',
            }
          },
          students: {
            title: 'Student Registry',
            desc: 'Central registry of Atena language school students. Stores personal info, CEFR proficiency level, enrollment status, and annual membership status.',
            cardDesc: 'Student registry: enrollment status (ACTIVE..ARCHIVED), CEFR language proficiency (A1..C2).',
            columns: {
              status: 'Student status in school registry (1=ACTIVE, 2=INACTIVE, 3=PAUSED, 4=GRADUATED, 5=ARCHIVED)',
              language_level: 'CEFR language proficiency framework level (1=A1..6=C2)',
            }
          },
          lessons: {
            title: 'Lessons & Attendance',
            desc: 'Timetable lesson registry. Tracks class delivery, attendance status (present, absent, late, excused), and location format (in-person/online).',
            cardDesc: 'Scheduled classes: delivery status, attendance tracking (present/absent), formats.',
            columns: {
              status: 'Scheduled lesson delivery status (1=SCHEDULED, 2=COMPLETED, 3=CANCELLED, 4=RESCHEDULED)',
              attendance: 'Student attendance record for the class (1=PENDING, 2=PRESENT, 3=ABSENT, 4=LATE, 5=EXCUSED)',
              location_type: 'Classroom venue location (1=IN_PERSON, 2=ONLINE, 3=HYBRID)',
            }
          },
          annual_memberships: {
            title: 'Annual Memberships (€30)',
            desc: 'Mandatory €30 annual association membership per student. Valid for the current academic year (September 1 – August 31).',
            cardDesc: 'Annual association membership cards (€30 per academic year): ACTIVE, PENDING, EXPIRED.',
            columns: {
              status: 'Validity status of €30 annual membership (1=ACTIVE, 2=PENDING, 3=EXPIRED)',
            }
          },
          app_settings: {
            title: 'System Application Settings',
            desc: 'Dynamic system-wide configuration keys stored in JSONB (e.g. registration fee active/inactive, current academic year, default €30 fee).',
            cardDesc: 'Dynamic global system configuration parameters (JSONB Key-Value).',
            columns: {
              registration_fee_status: 'Mandatory registration fee €30 requirement at checkout (1=ACTIVE, 2=INACTIVE)',
            }
          },
        }
      },
    };

    // Item-level translation maps for Italian and English descriptions
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

    const LANG_FLAGS = {
      it: '🇮🇹',
      en: '🇬🇧',
      ru: '🇷🇺',
    };

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

    // Render Dynamic Views for each Table
    function renderTableViews() {
      const container = document.getElementById('dynamic-table-views');
      const t = I18N[currentLang];
      const flag = LANG_FLAGS[currentLang];
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
                    <span class="meta-pill">🐘 \${t.tableInPg} <code>public.\${tableData.table}</code></span>
                    <span class="meta-pill">📊 \${t.enumsCount} <code>\${Object.keys(tableData.columns).length}</code></span>
                  </div>
                </div>
              </div>
              <p class="hero-desc">\${tableDesc}</p>
            </div>
        \`;

        // Render each enum column in this table as a structured Card
        for (const [colKey, colData] of Object.entries(tableData.columns)) {
          const colDesc = (localizedTable.columns && localizedTable.columns[colKey]) || colData.description;

          html += \`
            <div class="enum-card">
              <div class="enum-card-header">
                <div class="enum-card-header-left">
                  <span class="column-name-badge">
                    <span class="column-dot"></span>
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
                      <th style="width: 50px; text-align: center;">\${t.colId}</th>
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
                  <span class="id-badge" onclick="copyText('\${valData.id}', 'ID \${valData.id}')" title="Нажмите, чтобы скопировать ID \${valData.id}">\${valData.id}</span>
                </td>
                <td>
                  <span class="code-badge" onclick="copyText('\${colData.name}.\${valData.code}', '\${colData.name}.\${valData.code}')" title="Нажмите, чтобы скопировать \${colData.name}.\${valData.code}">\${valData.code}</span>
                </td>
                <td>
                  <div class="single-label-wrapper">
                    <span class="lang-flag">\${flag}</span>
                    <span>\${label}</span>
                  </div>
                </td>
                <td style="color: var(--text-secondary); line-height: 1.55; font-size: 13px;">
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
      const t = I18N[currentLang];
      const localizedTable = (t.tables && t.tables[tabKey]) || {};
      const title = tabKey === 'overview' ? t.navOverview : (localizedTable.title || tabKey);
      document.getElementById('current-breadcrumb').textContent = title;

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
      }, 2000);
    }

    // Theme Toggle
    function toggleTheme() {
      const isDark = document.body.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      document.body.setAttribute('data-theme', newTheme);
      document.getElementById('theme-icon').textContent = newTheme === 'dark' ? '☀️' : '🌙';
      
      const t = I18N[currentLang];
      document.getElementById('theme-label').textContent = newTheme === 'dark' ? t.themeLight : t.themeDark;
      localStorage.setItem('atena_dict_theme', newTheme);
    }

    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('atena_dict_theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-icon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';

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
        resultsContainer.innerHTML = \`<div style="padding: 24px; text-align: center; color: var(--text-tertiary); font-size: 13.5px;">\${t.notFound}</div>\`;
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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape') {
        closeSearch();
      }
    });

    // Handle initial load
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

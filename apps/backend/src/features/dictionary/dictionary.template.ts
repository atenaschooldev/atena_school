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

      /* Notion-style semantic tag colors */
      --tag-gray-bg: #F1F5F9;
      --tag-gray-text: #475569;
      --tag-blue-bg: #EFF6FF;
      --tag-blue-text: #1D4ED8;
      --tag-green-bg: #F0FDF4;
      --tag-green-text: #15803D;
      --tag-yellow-bg: #FEFCE8;
      --tag-yellow-text: #A16207;
      --tag-orange-bg: #FFF7ED;
      --tag-orange-text: #C2410C;
      --tag-red-bg: #FEF2F2;
      --tag-red-text: #B91C1C;
      --tag-purple-bg: #FAF5FF;
      --tag-purple-text: #7E22CE;

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
      --tag-green-bg: #052E16;
      --tag-green-text: #86EFAC;
      --tag-yellow-bg: #422006;
      --tag-yellow-text: #FDE047;
      --tag-orange-bg: #431407;
      --tag-orange-text: #FDBA74;
      --tag-red-bg: #450A0A;
      --tag-red-text: #FCA5A5;
      --tag-purple-bg: #3B0764;
      --tag-purple-text: #D8B4FE;

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

    /* Segmented Language Switcher */
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

    /* ============================================================ */
    /* VIEWS: OVERVIEW & TABLE DETAIL                               */
    /* ============================================================ */
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

    /* Hero Header Block */
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

    /* Architecture Callout */
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

    /* Overview Cards Grid */
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

    /* ============================================================ */
    /* ENUM CARD & TABLE CONTAINER                                  */
    /* ============================================================ */
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

    .enum-card-desc {
      padding: 12px 20px;
      font-size: 13.5px;
      color: var(--text-secondary);
      line-height: 1.5;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-subtle);
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

    /* Badges */
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

    /* ============================================================ */
    /* SEARCH MODAL (CMD + K)                                       */
    /* ============================================================ */
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

    /* Toast Notification */
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
  <!-- ============================================================ -->
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
        <!-- 3-Language Switcher -->
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

      <!-- ======================================================== -->
      <!-- VIEW: OVERVIEW                                           -->
      <!-- ======================================================== -->
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
            <p class="overview-card-desc">Каталог программ школы: уровни A1..C2, индивидуальные/групповые форматы, статусы.</p>
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
            <p class="overview-card-desc">Реестр студентов: статус обучения (ACTIVE..ARCHIVED), уровень владения языком CEFR (A1..C2).</p>
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
        <input type="text" id="search-input" class="search-input" placeholder="Поиск по статусам, кодам (например, PAID, A1, STRIPE)..." oninput="handleSearch(this.value)">
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

    // UI Localizations (IT / EN / RU)
    const I18N = {
      ru: {
        searchPlaceholder: 'Поиск по статусам, кодам (например, PAID, A1, STRIPE)...',
        searchTrigger: '🔍 Поиск по кодам & полям...',
        navMain: 'Главная',
        navOverview: 'Архитектура & Стандарты',
        navTables: 'Таблицы базы данных',
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
      },
      it: {
        searchPlaceholder: 'Cerca per stati, codici (es. PAID, A1, STRIPE)...',
        searchTrigger: '🔍 Cerca codici e campi...',
        navMain: 'Principale',
        navOverview: 'Architettura & Standard',
        navTables: 'Tabelle del Database',
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
      },
      en: {
        searchPlaceholder: 'Search by statuses, codes (e.g. PAID, A1, STRIPE)...',
        searchTrigger: '🔍 Search codes & fields...',
        navMain: 'Main',
        navOverview: 'Architecture & Standards',
        navTables: 'Database Tables',
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
      },
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

    const LANG_FLAGS = {
      it: '🇮🇹',
      en: '🇬🇧',
      ru: '🇷🇺',
    };

    // Render Dynamic Views for each Table
    function renderTableViews() {
      const container = document.getElementById('dynamic-table-views');
      const t = I18N[currentLang];
      const flag = LANG_FLAGS[currentLang];
      let html = '';

      for (const [tableKey, tableData] of Object.entries(DICTIONARY_DATA.tables)) {
        const icon = TABLE_ICONS[tableKey] || '📑';
        
        html += \`
          <div id="view-\${tableKey}" class="view-container">
            <div class="hero-header">
              <div class="hero-header-top">
                <div class="hero-icon-badge">\${icon}</div>
                <div class="hero-header-text">
                  <h1 class="hero-title">\${tableData.title}</h1>
                  <div class="meta-badges">
                    <span class="meta-pill">🐘 \${t.tableInPg} <code>public.\${tableData.table}</code></span>
                    <span class="meta-pill">📊 \${t.enumsCount} <code>\${Object.keys(tableData.columns).length}</code></span>
                  </div>
                </div>
              </div>
              <p class="hero-desc">\${tableData.description}</p>
            </div>
        \`;

        // Render each enum column in this table as a structured Card
        for (const [colKey, colData] of Object.entries(tableData.columns)) {
          html += \`
            <div class="enum-card">
              <div class="enum-card-header">
                <div class="enum-card-header-left">
                  <span class="column-name-badge">
                    <span class="column-dot"></span>
                    \${t.columnPrefix} <code>\${colData.column}</code>
                  </span>
                  <span class="enum-type-badge">\${colData.name}</span>
                </div>
                <div>
                  <span class="db-type-badge">\${colData.dbType}</span>
                </div>
              </div>
              <div class="enum-card-desc">\${colData.description}</div>

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
        overview: currentLang === 'it' ? 'Architettura & Standard' : currentLang === 'en' ? 'Architecture & Standards' : 'Архитектура & Стандарты',
        bookings: 'Bookings',
        payments: 'Payments',
        courses: 'Courses',
        students: 'Students',
        lessons: 'Lessons',
        annual_memberships: 'Annual Memberships',
        app_settings: 'App Settings',
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

      for (const [tableKey, tableData] of Object.entries(DICTIONARY_DATA.tables)) {
        for (const [colKey, colData] of Object.entries(tableData.columns)) {
          for (const [valKey, valData] of Object.entries(colData.values)) {
            const labelIt = (valData.label_it || '').toLowerCase();
            const labelEn = (valData.label_en || '').toLowerCase();
            const labelRu = (valData.label_ru || '').toLowerCase();
            const desc = (valData.description || '').toLowerCase();

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
                tableTitle: tableData.title,
                enumName: colData.name,
                code: valData.code,
                id: valData.id,
                label: getValLabel(valData, currentLang),
                desc: valData.description,
              });
            }
          }
        }
      }

      if (results.length === 0) {
        const t = I18N[currentLang];
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

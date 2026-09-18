export const DICTIONARY_STYLES = `
    :root {
      --bg-page: #FFFFFF;
      --bg-sidebar: #FAFAFA;
      --bg-card: #FFFFFF;
      --bg-card-hover: #F4F4F5;
      --bg-table-head: #FAFAFA;
      --bg-subtle: #F4F4F5;
      --bg-code: #F4F4F5;
      --border: #E4E4E7;
      --border-subtle: #F4F4F5;
      
      --text-main: #09090B;
      --text-secondary: #52525B;
      --text-tertiary: #A1A1AA;
      
      --accent: #09090B;
      --accent-bg: #E4E4E7;
      --badge-bg: #F4F4F5;
      --badge-text: #09090B;
      --badge-border: #E4E4E7;

      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
      
      --sidebar-width: 260px;
    }

    [data-theme="dark"] {
      --bg-page: #000000;
      --bg-sidebar: #09090B;
      --bg-card: #09090B;
      --bg-card-hover: #18181B;
      --bg-table-head: #18181B;
      --bg-subtle: #27272A;
      --bg-code: #18181B;
      --border: #27272A;
      --border-subtle: #1E1E22;
      
      --text-main: #FAFAFA;
      --text-secondary: #A1A1AA;
      --text-tertiary: #71717A;
      
      --accent: #FAFAFA;
      --accent-bg: #27272A;
      --badge-bg: #18181B;
      --badge-text: #FAFAFA;
      --badge-border: #27272A;
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
      color: inherit;
    }

    .brand-logo {
      width: 28px;
      height: 28px;
      background: var(--text-main);
      color: var(--bg-page);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-main);
      line-height: 1.2;
    }

    .brand-subtitle {
      font-size: 11px;
      color: var(--text-tertiary);
    }

    .search-trigger {
      margin: 12px 14px 4px;
      padding: 6px 10px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 4px;
      color: var(--text-tertiary);
      font-size: 12.5px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: border-color 0.15s ease;
    }

    .search-trigger:hover {
      border-color: var(--text-tertiary);
    }

    .search-trigger kbd {
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 3px;
      padding: 1px 4px;
      font-size: 10px;
      font-family: var(--font-mono);
      color: var(--text-secondary);
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 10px 8px;
    }

    .nav-section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-tertiary);
      padding: 10px 8px 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 4px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      margin-bottom: 2px;
      transition: background 0.1s ease, color 0.1s ease;
    }

    .nav-item:hover {
      background-color: var(--bg-card-hover);
      color: var(--text-main);
    }

    .nav-item.active {
      background-color: var(--bg-card-hover);
      color: var(--text-main);
      font-weight: 600;
    }

    .nav-item-icon {
      font-size: 14px;
    }

    .nav-item-badge {
      margin-left: auto;
      font-size: 11px;
      font-family: var(--font-mono);
      background: var(--bg-subtle);
      color: var(--text-tertiary);
      padding: 1px 5px;
      border-radius: 3px;
    }

    .sidebar-footer {
      padding: 12px 14px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11.5px;
    }

    .theme-toggle-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px;
      border-radius: 3px;
    }

    .theme-toggle-btn:hover {
      color: var(--text-main);
      background: var(--bg-card-hover);
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
      position: sticky;
      top: 0;
      background: var(--bg-page);
      border-bottom: 1px solid var(--border-subtle);
      padding: 10px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 30;
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
      gap: 12px;
    }

    .lang-switcher {
      display: flex;
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 2px;
    }

    .lang-btn {
      border: none;
      background: transparent;
      padding: 2px 8px;
      font-size: 11.5px;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: 3px;
      transition: all 0.1s ease;
    }

    .lang-btn.active {
      background: var(--bg-card);
      color: var(--text-main);
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .header-link-btn {
      text-decoration: none;
      color: var(--text-secondary);
      font-size: 12.5px;
      font-weight: 500;
      padding: 4px 10px;
      border-radius: 4px;
      border: 1px solid var(--border);
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .header-link-btn:hover {
      color: var(--text-main);
      border-color: var(--text-tertiary);
    }

    .page-content {
      flex: 1;
      padding: 32px 48px 64px;
      max-width: 1080px;
      width: 100%;
      margin: 0 auto;
    }

    .view-container {
      display: none;
    }

    .view-container.active {
      display: block;
    }

    /* NOTION-STYLE HEADERS */
    .hero-header {
      margin-bottom: 28px;
    }

    .hero-header-top {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 12px;
    }

    .hero-icon-badge {
      font-size: 32px;
      line-height: 1;
    }

    .hero-header-text {
      flex: 1;
    }

    .hero-title {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.4px;
      color: var(--text-main);
      margin-bottom: 6px;
    }

    .hero-desc {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .meta-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    .meta-pill {
      font-size: 12px;
      color: var(--text-secondary);
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 2px 8px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .meta-pill code {
      font-family: var(--font-mono);
      font-weight: 600;
      color: var(--text-main);
    }

    .callout {
      background: var(--bg-subtle);
      border-left: 3px solid var(--text-main);
      padding: 12px 16px;
      border-radius: 0 4px 4px 0;
      margin-bottom: 28px;
      display: flex;
      gap: 12px;
      font-size: 13px;
      line-height: 1.5;
      color: var(--text-secondary);
    }

    .callout-icon {
      font-size: 16px;
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
`;

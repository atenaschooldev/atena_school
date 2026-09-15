export function renderDictionaryHtml(data: any): string {
  const jsonData = JSON.stringify(data);

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Atena School — Data Dictionary (Notion Style)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #FFFFFF;
      --bg-hover: #F7F6F3;
      --bg-callout: #F7F6F3;
      --bg-table-header: #FAFAFA;
      --text-main: #37352F;
      --text-secondary: #787774;
      --text-tertiary: #9B9A97;
      --border: #E9E9E7;
      --border-dark: #D3D1CB;
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;

      /* Notion Tag Colors */
      --tag-gray-bg: #F1F1EF;
      --tag-gray-text: #5A5A58;
      --tag-blue-bg: #E7F3F8;
      --tag-blue-text: #2B6E94;
      --tag-green-bg: #EDF3EC;
      --tag-green-text: #3B7554;
      --tag-yellow-bg: #FBF3DB;
      --tag-yellow-text: #B47C1C;
      --tag-orange-bg: #FAEBDD;
      --tag-orange-text: #C46200;
      --tag-red-bg: #FDEBEC;
      --tag-red-text: #C13838;
      --tag-purple-bg: #F4F0F7;
      --tag-purple-text: #7C4FA0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font-sans);
      background-color: var(--bg);
      color: var(--text-main);
      line-height: 1.5;
      padding: 40px 28px 80px;
      -webkit-font-smoothing: antialiased;
    }

    .notion-page {
      max-width: 1180px;
      margin: 0 auto;
    }

    /* Page Header */
    .page-icon {
      font-size: 52px;
      line-height: 1;
      margin-bottom: 12px;
      user-select: none;
    }

    .page-title {
      font-size: 34px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-main);
      margin-bottom: 6px;
    }

    .page-desc {
      font-size: 15px;
      color: var(--text-secondary);
      margin-bottom: 20px;
    }

    /* Page Meta Properties */
    .page-properties {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-bottom: 16px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }

    .prop-row {
      display: flex;
      align-items: center;
      font-size: 13px;
    }

    .prop-name {
      width: 140px;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .prop-val {
      color: var(--text-main);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .notion-link {
      color: var(--text-main);
      text-decoration: underline;
      text-underline-offset: 3px;
      text-decoration-color: var(--border-dark);
      transition: color 0.15s ease;
    }

    .notion-link:hover {
      color: #2EAADC;
    }

    /* Callout */
    .notion-callout {
      background: var(--bg-callout);
      border-radius: 4px;
      padding: 14px 16px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-size: 13.5px;
      color: var(--text-main);
      margin-bottom: 28px;
      border: 1px solid rgba(0, 0, 0, 0.04);
    }

    .notion-callout-icon {
      font-size: 18px;
      line-height: 1.3;
    }

    /* Database View Toolbar */
    .db-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .db-search {
      position: relative;
      width: 320px;
    }

    .db-search input {
      width: 100%;
      font-family: var(--font-sans);
      font-size: 13px;
      padding: 7px 12px 7px 30px;
      border: 1px solid var(--border);
      border-radius: 4px;
      outline: none;
      background: #FFFFFF;
      color: var(--text-main);
      transition: border-color 0.15s;
    }

    .db-search input:focus {
      border-color: var(--border-dark);
      box-shadow: 0 0 0 2px rgba(46, 170, 220, 0.2);
    }

    .db-search-icon {
      position: absolute;
      left: 9px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 12px;
      color: var(--text-tertiary);
    }

    /* Table Section Card */
    .table-section {
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 36px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    }

    .table-section-header {
      padding-bottom: 16px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }

    .table-header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .table-badge-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .table-name-badge {
      font-family: var(--font-mono);
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
      background: var(--tag-gray-bg);
      padding: 4px 10px;
      border-radius: 4px;
      border: 1px solid var(--border);
    }

    .table-title-text {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-main);
    }

    .table-stats-pill {
      font-size: 12px;
      color: var(--text-secondary);
      background: var(--bg-hover);
      padding: 3px 10px;
      border-radius: 9999px;
      border: 1px solid var(--border);
    }

    .table-description {
      font-size: 13.5px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    /* Column Group Block */
    .column-group {
      margin-bottom: 32px;
    }

    .column-group:last-child {
      margin-bottom: 0;
    }

    .column-group-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 8px;
    }

    .column-group-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 600;
      color: var(--text-main);
    }

    .col-db-name {
      font-family: var(--font-mono);
      font-size: 13px;
      font-weight: 600;
      color: var(--tag-blue-text);
      background: var(--tag-blue-bg);
      padding: 3px 8px;
      border-radius: 4px;
    }

    .col-db-type {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 500;
      color: var(--tag-gray-text);
      background: var(--tag-gray-bg);
      padding: 2px 6px;
      border-radius: 3px;
    }

    .col-enum-type {
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 500;
      color: var(--tag-purple-text);
      background: var(--tag-purple-bg);
      padding: 3px 8px;
      border-radius: 4px;
      cursor: pointer;
    }

    .col-enum-type:hover {
      filter: brightness(0.95);
    }

    .column-purpose {
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 10px;
    }

    /* Notion Data Table */
    .notion-table-wrap {
      border: 1px solid var(--border);
      border-radius: 4px;
      overflow-x: auto;
    }

    table.notion-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      line-height: 1.4;
      text-align: left;
    }

    table.notion-table th {
      background: var(--bg-table-header);
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 12px;
      padding: 8px 12px;
      border-right: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      user-select: none;
      white-space: nowrap;
    }

    table.notion-table th:last-child {
      border-right: none;
    }

    table.notion-table td {
      padding: 8px 12px;
      border-right: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
      color: var(--text-main);
    }

    table.notion-table td:last-child {
      border-right: none;
    }

    table.notion-table tr:last-child td {
      border-bottom: none;
    }

    table.notion-table tr:hover td {
      background-color: var(--bg-hover);
    }

    /* Notion Tag Pills */
    .notion-pill {
      display: inline-flex;
      align-items: center;
      padding: 2px 7px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: 500;
      line-height: 1.25;
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
    }

    .notion-pill:hover {
      filter: brightness(0.96);
    }

    .pill-id {
      font-family: var(--font-mono);
      font-weight: 700;
      background: var(--tag-gray-bg);
      color: var(--tag-gray-text);
      min-width: 22px;
      justify-content: center;
    }

    .pill-code {
      font-family: var(--font-mono);
      font-weight: 500;
      background: var(--tag-blue-bg);
      color: var(--tag-blue-text);
    }

    .pill-success {
      background: var(--tag-green-bg);
      color: var(--tag-green-text);
    }

    .pill-warning {
      background: var(--tag-yellow-bg);
      color: var(--tag-yellow-text);
    }

    .pill-danger {
      background: var(--tag-red-bg);
      color: var(--tag-red-text);
    }

    .pill-purple {
      background: var(--tag-purple-bg);
      color: var(--tag-purple-text);
    }

    .flag-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
    }

    .desc-text {
      color: var(--text-secondary);
      font-size: 12px;
      line-height: 1.4;
    }

    /* Notion Toast */
    .notion-toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #2F3437;
      color: #FFFFFF;
      padding: 8px 14px;
      border-radius: 4px;
      font-size: 13px;
      box-shadow: 0 4px 12px rgba(15, 15, 15, 0.15);
      display: flex;
      align-items: center;
      gap: 8px;
      transform: translateY(60px);
      opacity: 0;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 9999;
      pointer-events: none;
    }

    .notion-toast.show {
      transform: translateY(0);
      opacity: 1;
    }
  </style>
</head>
<body>

  <div class="notion-page">
    <!-- Icon & Title -->
    <div class="page-icon">📖</div>
    <h1 class="page-title">Словарь данных (Data Dictionary)</h1>
    <p class="page-desc">Реестр числовых статусов, колонок базы данных PostgreSQL и переводов (IT / EN / RU)</p>

    <!-- Properties -->
    <div class="page-properties">
      <div class="prop-row">
        <span class="prop-name"><span>🌐</span> Спецификация</span>
        <span class="prop-val"><a class="notion-link" href="/docs">Swagger Documentation (/docs)</a></span>
      </div>
      <div class="prop-row">
        <span class="prop-name"><span>📦</span> API Endpoint</span>
        <span class="prop-val"><a class="notion-link" href="/api/v1/dictionary" target="_blank">/api/v1/dictionary</a></span>
      </div>
      <div class="prop-row">
        <span class="prop-name"><span>🔢</span> Формат в БД и API</span>
        <span class="prop-val"><span class="notion-pill pill-id">SMALLINT</span> Исключительно числовые энамы (1, 2, 3...)</span>
      </div>
    </div>

    <!-- Callout -->
    <div class="notion-callout">
      <div class="notion-callout-icon">💡</div>
      <div>
        <strong>Строгий числовой формат (Numeric Enums):</strong> В базе данных PostgreSQL (Supabase) и во всех REST API эндпоинтах статусы и методы оперируют <strong>исключительно числами (1, 2, 3...)</strong>. Текстовые строки в БД больше не хранятся. Данные сгруппированы строго по <strong>Таблицам</strong> и <strong>Колонкам базы данных</strong>. Нажмите на любой ID или код, чтобы скопировать.
      </div>
    </div>

    <!-- Database Toolbar -->
    <div class="db-toolbar">
      <div style="font-size: 13px; color: var(--text-secondary);">
        Таблиц в словаре: <strong>1 (bookings)</strong> &bull; Колонок со статусами: <strong>5</strong> &bull; Перечислений: <strong>19</strong>
      </div>
      <div class="db-search">
        <span class="db-search-icon">🔍</span>
        <input type="text" id="searchInput" placeholder="Поиск по колонке, коду, статусу или ID..." autofocus>
      </div>
    </div>

    <!-- Container for Rendered Tables -->
    <div id="dictionaryContent">
      <!-- Injected via JavaScript -->
    </div>
  </div>

  <!-- Toast -->
  <div id="toast" class="notion-toast">
    <span>✓</span>
    <span id="toastMsg">Скопировано</span>
  </div>

  <script>
    const data = ${jsonData};

    function copyVal(text, label) {
      navigator.clipboard.writeText(text).then(() => {
        const toast = document.getElementById('toast');
        const msg = document.getElementById('toastMsg');
        msg.textContent = label ? \`Скопировано: \${label}\` : 'Скопировано в буфер';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 1600);
      });
    }

    function getPillClass(code, id) {
      if (['PAID', 'ACTIVE', 'COMPLETED'].includes(code)) return 'pill-success';
      if (['PENDING', 'RESERVED', 'PENDING_COORDINATION', 'INSTALLMENTS'].includes(code)) return 'pill-warning';
      if (['FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'].includes(code)) return 'pill-danger';
      if (['STRIPE', 'SCHEDULED', 'FULL'].includes(code)) return 'pill-code';
      return 'pill-purple';
    }

    function renderGroupedTables() {
      const container = document.getElementById('dictionaryContent');
      container.innerHTML = '';

      for (const [tableName, tableData] of Object.entries(data.tables || {})) {
        const tableSection = document.createElement('div');
        tableSection.className = 'table-section';
        tableSection.setAttribute('data-table', tableName.toLowerCase());

        const columns = tableData.columns || tableData.enums || {};
        const colCount = Object.keys(columns).length;

        // Build Table Header
        let sectionHtml = \`
          <div class="table-section-header">
            <div class="table-header-top">
              <div class="table-badge-group">
                <span class="table-name-badge">public.\${tableName}</span>
                <span class="table-title-text">\${tableData.title || tableName}</span>
              </div>
              <span class="table-stats-pill">Колонок с энамами: \${colCount}</span>
            </div>
            <p class="table-description">\${tableData.description || 'Таблица базы данных'}</p>
          </div>
        \`;

        // Build Column Groups inside this Table
        let columnGroupsHtml = '';

        for (const [colName, colDef] of Object.entries(columns)) {
          const values = Object.values(colDef.values || {});

          const rowsHtml = values.map(v => {
            const pillColor = getPillClass(v.code, v.id);
            const rowSearch = \`\${tableName} \${colName} \${v.id} \${v.code} \${v.label_it} \${v.label_en} \${v.label_ru} \${v.description}\`.toLowerCase();

            return \`
              <tr data-search="\${rowSearch}">
                <td style="width: 55px; text-align: center;">
                  <span class="notion-pill pill-id" onclick="copyVal('\${v.id}', 'ID: \${v.id}')" title="Копировать ID: \${v.id}">\${v.id}</span>
                </td>
                <td style="width: 190px;">
                  <span class="notion-pill \${pillColor}" onclick="copyVal('\${v.code}', '\${v.code}')" title="Копировать код: \${v.code}">\${v.code}</span>
                </td>
                <td style="width: 220px;">
                  <div class="flag-cell">
                    <span>🇮🇹</span>
                    <span>\${v.label_it}</span>
                  </div>
                </td>
                <td style="width: 200px;">
                  <div class="flag-cell">
                    <span>🇬🇧</span>
                    <span>\${v.label_en}</span>
                  </div>
                </td>
                <td style="width: 200px;">
                  <div class="flag-cell">
                    <span>🇷🇺</span>
                    <span>\${v.label_ru}</span>
                  </div>
                </td>
                <td>
                  <span class="desc-text">\${v.description || '—'}</span>
                </td>
              </tr>
            \`;
          }).join('');

          columnGroupsHtml += \`
            <div class="column-group" data-search="\${tableName} \${colName} \${colDef.name} \${colDef.description}".toLowerCase()>
              <div class="column-group-header">
                <div class="column-group-title">
                  <span>Колонка в БД:</span>
                  <span class="col-db-name">\${tableName}.\${colName}</span>
                  <span class="col-db-type">\${colDef.dbType || 'INTEGER'}</span>
                </div>
                <div class="col-enum-type" onclick="copyVal('\${colDef.name}', '\${colDef.name}')" title="Копировать TypeScript Enum">
                  TypeScript: enum \${colDef.name}
                </div>
              </div>
              <div class="column-purpose">\${colDef.description}</div>
              <div class="notion-table-wrap">
                <table class="notion-table">
                  <thead>
                    <tr>
                      <th style="width: 55px; text-align: center;">ID</th>
                      <th>Код (Code)</th>
                      <th>Итальянский (IT)</th>
                      <th>Английский (EN)</th>
                      <th>Русский (RU)</th>
                      <th>Назначение / Бизнес-логика</th>
                    </tr>
                  </thead>
                  <tbody>
                    \${rowsHtml}
                  </tbody>
                </table>
              </div>
            </div>
          \`;
        }

        tableSection.innerHTML = sectionHtml + columnGroupsHtml;
        container.appendChild(tableSection);
      }
    }

    // Live search filter
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      const columnGroups = document.querySelectorAll('.column-group');

      columnGroups.forEach(group => {
        const groupSearch = group.getAttribute('data-search') || '';
        const rows = group.querySelectorAll('tbody tr');
        let visibleRows = 0;

        rows.forEach(row => {
          const rowSearch = row.getAttribute('data-search') || '';
          if (!q || groupSearch.includes(q) || rowSearch.includes(q)) {
            row.style.display = '';
            visibleRows++;
          } else {
            row.style.display = 'none';
          }
        });

        group.style.display = visibleRows > 0 ? '' : 'none';
      });

      // Hide parent table section if all its columns are hidden
      document.querySelectorAll('.table-section').forEach(sec => {
        const visibleGroups = sec.querySelectorAll('.column-group:not([style*="display: none"])');
        sec.style.display = visibleGroups.length > 0 ? '' : 'none';
      });
    });

    renderGroupedTables();
  </script>
</body>
</html>`;
}

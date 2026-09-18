export function generateDictionaryClientScript(jsonData: string, i18nJson: string, itemDescI18nJson: string): string {
  return `
    const DICTIONARY_DATA = ${jsonData};
    const I18N = ${i18nJson};
    const ITEM_DESC_I18N = ${itemDescI18nJson};

    const TABLE_ICONS = {
      bookings: '📦',
      payments: '💳',
      courses: '🎓',
      students: '👥',
      lessons: '🗓️',
      attendance_records: '📋',
      annual_memberships: '🪪',
      app_settings: '⚙️',
      users: '👤',
      contact_messages: '✉️',
      notifications: '🔔',
      error_codes: '⚠️',
      days_of_week: '📅',
      discounts: '🏷️',
      exam_certifications: '📜',
      contact_topics: '💬',
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
      const t = I18N[lang] || I18N.ru;
      const el = (id) => document.getElementById(id);

      if (el('search-trigger-text')) el('search-trigger-text').textContent = t.searchTrigger;
      if (el('search-input')) el('search-input').placeholder = t.searchPlaceholder;
      if (el('nav-title-main')) el('nav-title-main').textContent = t.navMain;
      if (el('nav-item-overview')) el('nav-item-overview').textContent = t.navOverview;
      if (el('nav-title-tables')) el('nav-title-tables').textContent = t.navTables;
      if (el('nav-item-bookings')) el('nav-item-bookings').textContent = t.navBookings;
      if (el('nav-item-payments')) el('nav-item-payments').textContent = t.navPayments;
      if (el('nav-item-courses')) el('nav-item-courses').textContent = t.navCourses;
      if (el('nav-item-students')) el('nav-item-students').textContent = t.navStudents;
      if (el('nav-item-lessons')) el('nav-item-lessons').textContent = t.navLessons;
      if (el('nav-item-annual_memberships')) el('nav-item-annual_memberships').textContent = t.navMemberships;
      if (el('nav-item-app_settings')) el('nav-item-app_settings').textContent = t.navSettings;

      // Update Overview texts
      if (el('overview-hero-title')) el('overview-hero-title').textContent = t.overviewTitle;
      if (el('overview-hero-desc')) el('overview-hero-desc').textContent = t.overviewDesc;
      if (el('meta-storage-text')) el('meta-storage-text').textContent = t.metaStorage;
      if (el('meta-pkg-text')) el('meta-pkg-text').textContent = t.metaPkg;
      if (el('meta-lang-text')) el('meta-lang-text').textContent = t.metaLang;
      if (el('meta-tables-text')) el('meta-tables-text').textContent = t.metaTables;
      if (el('callout-title-text')) el('callout-title-text').textContent = t.calloutTitle;
      if (el('callout-desc-text')) el('callout-desc-text').innerHTML = t.calloutDesc;
      if (el('registry-title-text')) el('registry-title-text').textContent = t.registryTitle;

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
      if (lang === 'it' && ITEM_DESC_I18N.it && ITEM_DESC_I18N.it[valData.code]) {
        return ITEM_DESC_I18N.it[valData.code];
      }
      if (lang === 'en' && ITEM_DESC_I18N.en && ITEM_DESC_I18N.en[valData.code]) {
        return ITEM_DESC_I18N.en[valData.code];
      }
      return valData.description || '—';
    }

    function renderOverviewCards() {
      const container = document.getElementById('overview-cards-container');
      if (!container) return;
      const t = I18N[currentLang] || I18N.ru;
      let html = '';

      for (const [tableKey, tableData] of Object.entries(DICTIONARY_DATA.tables)) {
        const icon = TABLE_ICONS[tableKey] || '📑';
        const localizedTable = (t.tables && t.tables[tableKey]) || {};
        const title = localizedTable.title || tableData.title;
        const cardDesc = localizedTable.cardDesc || tableData.description;
        const colCount = Object.keys(tableData.columns || {}).length;

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

    function renderTableViews() {
      const container = document.getElementById('dynamic-table-views');
      if (!container) return;
      const t = I18N[currentLang] || I18N.ru;
      let html = '';

      for (const [tableKey, tableData] of Object.entries(DICTIONARY_DATA.tables)) {
        const icon = TABLE_ICONS[tableKey] || '📑';
        const localizedTable = (t.tables && t.tables[tableKey]) || {};
        const tableTitle = localizedTable.title || tableData.title;
        const tableDesc = localizedTable.desc || tableData.description;
        const colEntries = Object.entries(tableData.columns || {});
        
        html += \`
          <div id="view-\${tableKey}" class="view-container">
            <div class="hero-header">
              <div class="hero-header-top">
                <div class="hero-icon-badge">\${icon}</div>
                <div class="hero-header-text">
                  <h1 class="hero-title">\${tableTitle}</h1>
                  <div class="meta-badges">
                    <span class="meta-pill">\${t.tableInPg} <code>public.\${tableData.table}</code></span>
                    <span class="meta-pill">\${t.enumsCount} <code>\${colEntries.length}</code></span>
                  </div>
                </div>
              </div>
              <p class="hero-desc">\${tableDesc}</p>
            </div>
        \`;

        for (const [colKey, colData] of colEntries) {
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

          for (const [valKey, valData] of Object.entries(colData.values || {})) {
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
        const overviewEl = document.getElementById('view-overview');
        if (overviewEl) overviewEl.classList.add('active');
      }

      const t = I18N[currentLang] || I18N.ru;
      const localizedTable = (t.tables && t.tables[tabKey]) || {};
      const title = tabKey === 'overview' ? t.navOverview : (localizedTable.title || tabKey);
      const breadcrumbEl = document.getElementById('current-breadcrumb');
      if (breadcrumbEl) breadcrumbEl.textContent = title;

      if (window.location.hash !== '#' + tabKey) {
        history.pushState(null, null, '#' + tabKey);
      }

      const wrapper = document.querySelector('.main-wrapper');
      if (wrapper) wrapper.scrollTop = 0;
    }

    function copyText(text, label) {
      navigator.clipboard.writeText(text).then(() => {
        const t = I18N[currentLang] || I18N.ru;
        showToast(t.toastCopied + ': ' + (label || text));
      });
    }

    function showToast(text) {
      const t = document.getElementById('toast');
      if (!t) return;
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
      
      const t = I18N[currentLang] || I18N.ru;
      document.getElementById('theme-label').textContent = newTheme === 'dark' ? t.themeLight : t.themeDark;
      localStorage.setItem('atena_dict_theme', newTheme);
    }

    const savedTheme = localStorage.getItem('atena_dict_theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    const themeIconEl = document.getElementById('theme-icon');
    if (themeIconEl) themeIconEl.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    function openSearch() {
      const modal = document.getElementById('search-modal');
      if (!modal) return;
      modal.classList.add('open');
      const input = document.getElementById('search-input');
      if (input) {
        input.value = '';
        input.focus();
      }
      handleSearch('');
    }

    function closeSearch(e) {
      const modal = document.getElementById('search-modal');
      if (modal) modal.classList.remove('open');
    }

    function handleSearch(q) {
      const query = q.toLowerCase().trim();
      const resultsContainer = document.getElementById('search-results');
      if (!resultsContainer) return;
      const results = [];
      const t = I18N[currentLang] || I18N.ru;

      for (const [tableKey, tableData] of Object.entries(DICTIONARY_DATA.tables || {})) {
        const localizedTable = (t.tables && t.tables[tableKey]) || {};
        const tableTitle = localizedTable.title || tableData.title;

        for (const [colKey, colData] of Object.entries(tableData.columns || {})) {
          for (const [valKey, valData] of Object.entries(colData.values || {})) {
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
  `;
}

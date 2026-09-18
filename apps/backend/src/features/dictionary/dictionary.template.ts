import { DICTIONARY_STYLES } from './templates/dictionary.styles';
import { DICTIONARY_I18N_RAW, ITEM_DESC_I18N_RAW } from './templates/dictionary.i18n';
import { generateDictionaryClientScript } from './templates/dictionary.scripts';

export function renderDictionaryHtml(data: any): string {
  const jsonData = JSON.stringify(data);
  const i18nJson = JSON.stringify(DICTIONARY_I18N_RAW);
  const itemDescI18nJson = JSON.stringify(ITEM_DESC_I18N_RAW);

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Atena School — Data Dictionary & Schema Docs</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
${DICTIONARY_STYLES}
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
        <span class="nav-item-badge">4 enums</span>
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
      <a class="nav-item" data-tab="attendance_records" onclick="switchTab('attendance_records')">
        <span class="nav-item-icon">📋</span>
        <span>Attendance</span>
        <span class="nav-item-badge">1 enum</span>
      </a>
      <a class="nav-item" data-tab="annual_memberships" onclick="switchTab('annual_memberships')">
        <span class="nav-item-icon">🪪</span>
        <span id="nav-item-annual_memberships">Memberships</span>
        <span class="nav-item-badge">1 enum</span>
      </a>
      <a class="nav-item" data-tab="users" onclick="switchTab('users')">
        <span class="nav-item-icon">👤</span>
        <span>Users</span>
        <span class="nav-item-badge">1 enum</span>
      </a>
      <a class="nav-item" data-tab="contact_messages" onclick="switchTab('contact_messages')">
        <span class="nav-item-icon">✉️</span>
        <span>Contact Messages</span>
        <span class="nav-item-badge">1 enum</span>
      </a>
      <a class="nav-item" data-tab="notifications" onclick="switchTab('notifications')">
        <span class="nav-item-icon">🔔</span>
        <span>Notifications</span>
        <span class="nav-item-badge">2 enums</span>
      </a>
      <a class="nav-item" data-tab="app_settings" onclick="switchTab('app_settings')">
        <span class="nav-item-icon">⚙️</span>
        <span id="nav-item-app_settings">App Settings</span>
        <span class="nav-item-badge">JSONB</span>
      </a>
      <a class="nav-item" data-tab="discounts" onclick="switchTab('discounts')">
        <span class="nav-item-icon">🏷️</span>
        <span>Discounts</span>
        <span class="nav-item-badge">1 enum</span>
      </a>
      <a class="nav-item" data-tab="exam_certifications" onclick="switchTab('exam_certifications')">
        <span class="nav-item-icon">📜</span>
        <span>Certifications</span>
        <span class="nav-item-badge">1 enum</span>
      </a>
      <a class="nav-item" data-tab="days_of_week" onclick="switchTab('days_of_week')">
        <span class="nav-item-icon">📅</span>
        <span>Days of Week</span>
        <span class="nav-item-badge">1 enum</span>
      </a>
      <a class="nav-item" data-tab="error_codes" onclick="switchTab('error_codes')">
        <span class="nav-item-icon">⚠️</span>
        <span>Error Codes</span>
        <span class="nav-item-badge">1 enum</span>
      </a>
    </nav>

    <div class="sidebar-footer">
      <button class="theme-toggle-btn" onclick="toggleTheme()">
        <span id="theme-icon">🌙</span>
        <span id="theme-label">Темная тема</span>
      </button>
      <span style="color: var(--text-tertiary);">v2.0.0</span>
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
        <!-- Language Switcher -->
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
                <span class="meta-pill"><span id="meta-tables-text">Таблиц:</span> <code>16</code></span>
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
${generateDictionaryClientScript(jsonData, i18nJson, itemDescI18nJson)}
  </script>
</body>
</html>`;
}

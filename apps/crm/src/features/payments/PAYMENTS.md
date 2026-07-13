# Модуль Оплат (`payments`)

Этот модуль отвечает за финансовые операции школы, выставление счетов ученикам и отслеживание задолженностей по оплатам за курсы.

---

## Архитектура и Структура файлов

```
payments/
├── components/
│   ├── payments-placeholder.tsx # Презентационный UI-компонент заглушки (PaymentsPlaceholder)
│   └── pagamenti-view.tsx       # Главная страница (разметка, интеграция хука)
├── hooks/
│   └── use-payments.ts          # Кастомный хук логики оплат (usePayments)
└── index.ts                     # Точка экспорта Public API фичи
```

---

## 1. Логика и Состояние (`hooks/use-payments.ts`)

- **`usePayments`** ([use-payments.ts](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/payments/hooks/use-payments.ts))
  Кастомный хук для управления состоянием оплат. На данный момент возвращает базовые параметры, такие как глобальный поиск.

---

## 2. Компоненты Отображения (UI)

- **`PagamentiView`** ([pagamenti-view.tsx](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/payments/components/pagamenti-view.tsx))
  Главный контейнер страницы оплат.
- **`PaymentsPlaceholder`** ([payments-placeholder.tsx](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/payments/components/payments-placeholder.tsx))
  Презентационный компонент-заглушка для будущего расширения финансовой аналитики, реестра оплат, счетов и квитанций.

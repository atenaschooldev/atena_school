# Модуль Курсов (`courses`)

Этот модуль отвечает за управление образовательными курсами, распределение учебных классов по уровням и категориям, а также контроль стоимости и наполняемости групп.

---

## Архитектура и Структура файлов

```
courses/
├── components/
│   ├── course-card.tsx      # Чистый UI-компонент карточки курса (CourseCard)
│   ├── course-form.tsx      # Форма создания/редактирования курса (CourseForm)
│   └── corsi-view.tsx       # Главная страница (разметка, оркестрация компонентов)
├── hooks/
│   └── use-courses.ts       # Бизнес-логика, Zustand селекторы, CRUD методы (useCourses)
├── index.ts                 # Точка экспорта Public API фичи
├── types.ts                 # Описание типов и контрактов данных курса
└── utils.ts                 # Утилиты цветовой схемы языковых уровней
```

---

## 1. Типы данных (`types.ts`)

- **`Course`** ([types.ts](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/courses/types.ts))
  Интерфейс сущности курса:
  - `id`: Идентификатор курса.
  - `nome`: Название учебного курса.
  - `livello`: Языковой уровень (`Level` — A1, A2, B1, B2, C1, C2).
  - `insegnanteIds`: Список ID преподавателей, допущенных к курсу.
  - `moduli`: Количество учебных модулей.
  - `capienza`: Лимит количества студентов в группе.
  - `colore`: Ключ цветового токена CSS для визуального выделения.
  - `descrizione`, `durata`, `categoria`: Описание, продолжительность и категория курса.
  - `prezzo`: Стоимость обучения.
  - `stato`: Статус курса (`attivo`, `in-programmazione`, `concluso`).

---

## 2. Цветовая система языковых уровней (`utils.ts`)

Модуль предоставляет типизированные абстракции для стилизации языковых уровней CEFR:

- **`levelColor`** ([utils.ts](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/courses/utils.ts)): Возвращает полупрозрачный фон с цветной обводкой (идеально для тегов в таблицах).
- **`levelColorSolid`** ([utils.ts](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/courses/utils.ts)): Возвращает залитый сплошной цвет с тенью (используется для активных кнопок выбора и акцентных элементов интерфейса).

---

## 3. Логика и Состояние (`hooks/use-courses.ts`)

- **`useCourses`** ([use-courses.ts](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/courses/hooks/use-courses.ts))
  Кастомный хук для управления бизнес-логикой страницы курсов. Управляет Zustand-экшенами и состояниями модального окна добавления/редактирования курсов.

---

## 4. Компоненты Отображения (UI)

- **`CorsiView`** ([corsi-view.tsx](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/courses/components/corsi-view.tsx))
  Легковесный оркестратор страницы курсов. Использует хук `useCourses` для получения состояния и отрендеривает таблицу `DataTable` или сетку карточек.
- **`CourseCard`** ([course-card.tsx](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/courses/components/course-card.tsx))
  Чистый презентационный UI-компонент карточки курса. Принимает данные курса, списки студентов и преподавателей, а также callback-обработчики изменений как Props.
- **`CourseForm`** ([course-form.tsx](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/courses/components/course-form.tsx))
  Модальное окно для создания/редактирования курса. Позволяет выбрать уровень, категорию курса, лимит мест, цену и привязать преподавателей через всплывающий список.

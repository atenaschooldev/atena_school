# Модуль Студентов (`students`)

Этот модуль отвечает за просмотр, поиск, фильтрацию, добавление и изменение личных карточек и учебных статусов студентов школы.

---

## Архитектура и Структура файлов

```
students/
├── components/
│   ├── student-badges.tsx    # Чистые компоненты выбора уровня/статуса (LevelBadgeSelector, StatusBadgeSelector)
│   ├── student-card.tsx      # Чистый UI-компонент карточки студента (StudentCard)
│   ├── student-form.tsx      # Форма создания/редактирования студента (StudentForm)
│   └── studenti-view.tsx     # Главная страница (разметка, оркестрация компонентов)
├── hooks/
│   └── use-students.ts       # Бизнес-логика, Zustand селекторы, CRUD методы (useStudents)
├── index.ts                  # Точка экспорта Public API фичи
└── types.ts                  # Описание интерфейсов и типов данных студента
```

---

## 1. Типы данных (`types.ts`)

- **`Student`** ([types.ts](../../features/students/types.ts))
  Интерфейс, описывающий полную структуру записи студента:
  - `id`: Строковый уникальный идентификатор.
  - `nome`, `cognome`: Имя и фамилия.
  - `email`, `telefono`: Контактные данные.
  - `livello`: Уровень знания языка (`Level` из модуля `courses`).
  - `dataNascita`: Дата рождения (строка в формате ISO).
  - `corsiIds`: Массив ID курсов, на которые записан студент.
  - `documenti`: Количество привязанных электронных документов.
  - `stato`: Статус обучения (`attivo`, `sospeso`, `ritirato`).
  - `dataIscrizione`: Дата зачисления.
  - `foto`: URL фотографии студента (опционально).
  - `contratto`: Ссылка на электронный договор (опционально).

---

## 2. Логика и Состояние (`hooks/use-students.ts`)

- **`useStudents`** ([use-students.ts](../../features/students/hooks/use-students.ts))
  Кастомный хук, инкапсулирующий всю бизнес-логику страницы. Извлекает состояние и действия из глобального стора (Zustand), управляет локальным состоянием диалогов создания/редактирования/просмотра контрактов и экспортирует типизированные обработчики событий (`handleNewClick`, `handleLevelChange`, `handleStatusChange`, `handleFormSubmit` и т.д.).

---

## 3. Компоненты Отображения (UI)

- **`StudentiView`** ([studenti-view.tsx](../../features/students/components/studenti-view.tsx))
  Легковесный оркестратор экрана. Загружает состояние из `useStudents`, объявляет колонки таблицы и рендерит интерфейс на базе `DataTable`. Не содержит в себе бизнес-логики.
- **`StudentCard`** ([student-card.tsx](../../features/students/components/student-card.tsx))
  Чистый UI-компонент карточки студента для плиточного вида. Получает все обработчики изменений напрямую через Props.
- **`LevelBadgeSelector`** и **`StatusBadgeSelector`** ([student-badges.tsx](../../features/students/components/student-badges.tsx))
  Вспомогательные бейджи-кнопки для быстрой смены параметров через выпадающие меню `PillSelect`. Работают независимо от стора.
- **`StudentForm`** ([student-form.tsx](../../features/students/components/student-form.tsx))
  Форма добавления и редактирования профиля, управляющая связями студента с доступными курсами.

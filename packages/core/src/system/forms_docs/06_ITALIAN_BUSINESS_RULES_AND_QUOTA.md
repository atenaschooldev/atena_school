# 🇮🇹 06. Итальянские бизнес-правила и Quota Associativa (€30)

Спецификация обработки фискальных данных, родительских профилей и проверки членского взноса.

---

## 1. Итальянский фискальный контекст

Языковая школа Atena School в Италии зарегистрирована как образовательная ассоциация (Associazione Culturale / Ente Formativo). Согласно итальянскому законодательству:
1. Каждый студент курса обязан быть членом ассоциации и оплачивать ежегодный членский взнос (**Quota Associativa**) в размере **€30.00**.
2. Взнос оплачивается один раз в год на конкретного человека (по его `Codice Fiscale`).
3. Если за студента платит родитель, членом ассоциации является **ребёнок**, а родитель выступает заказчиком/плательщиком (**Purchaser**).

---

## 2. Логика флага `isForChild`

```
                                    Пользователь заполняет форму
                                                 │
                                                 ▼
                             ┌───────────────────────────────────────┐
                             │       Покупка для ребёнка?            │
                             │       (isForChild === true)           │
                             └───────────┬───────────────┬───────────┘
                                        НЕТ              ДА
                                         │                │
                                         ▼                ▼
                     ┌────────────────────────┐  ┌───────────────────────────────────┐
                     │ Покупатель = Студент   │  │ Родитель (Purchaser)              │
                     │ • purchaser_tax_code   │  │ • Оплата / Чек Stripe             │
                     │ • student_tax_code =   │  ├───────────────────────────────────┤
                     │   purchaser_tax_code   │  │ Ребёнок (Student)                 │
                     │                        │  │ • student_tax_code                │
                     │ Проверка взноса €30:   │  │ • Личный кабинет и журнал уроков  │
                     │ ПО ИНН ПОКУПАТЕЛЯ      │  │                                   │
                     └────────────────────────┘  │ Проверка взноса €30:              │
                                                 │ СТРОГО ПО ИНН РЕБЁНКА             │
                                                 └───────────────────────────────────┘
```

---

## 3. Алгоритм проверки взноса в базе данных

```ts
import { sanitizeTaxCode } from '@atena/utils';

export async function checkAnnualMembershipFee(
  supabase: SupabaseClient,
  taxCode: string
): Promise<{ feeDue: boolean; existingMembership?: any }> {
  const cleanCode = sanitizeTaxCode(taxCode);
  const currentYear = new Date().getFullYear();

  const { data } = await supabase
    .from('annual_memberships')
    .select('*')
    .eq('student_tax_code', cleanCode)
    .eq('year', currentYear)
    .eq('status', 1) // 1 = ACTIVE / PAID
    .maybeSingle();

  if (data) {
    return { feeDue: false, existingMembership: data };
  }

  return { feeDue: true };
}
```

---

## 4. Управление квотой в CRM/Админке

Для гибкости бизнес-процессов Atena School реализован выделенный блок управления Quota Associativa (`RegistrationFeeSettingsCard`):

1. **Главный переключатель (Master Switch)**:
   - `registration_fee_enabled`: `true / false`.
   - Позволяет полностью отключить начисление и проверку членского взноса (например, в период промо-кампаний или при безналоговых спецкурсах).
2. **Настройка суммы взноса**:
   - `registration_fee_eur`: числовое поле (по умолчанию `30`, диапазон `0 - 500 €`).
   - Быстрые пресеты в интерфейсе: `€0 (Бесплатно)`, `€20`, `€30 (Стандарт)`, `€50`.
3. **Учебный год (Academic Year)**:
   - `academic_year`: строка (например, `2026/2027`), выводится в квитанциях и договорах.
4. **Размещение в Админке**:
   - **Настройки аккаунта**: `apps/admin/src/app/settings/account/page.tsx`
   - **Раздел Moduli & Form Engine**: `apps/admin/src/features/forms/components/forms-list-view.tsx`
   - **White-Label карточка школы**: `apps/admin/src/components/shared/school-profile-card.tsx`


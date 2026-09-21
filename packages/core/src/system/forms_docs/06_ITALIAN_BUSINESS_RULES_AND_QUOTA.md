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

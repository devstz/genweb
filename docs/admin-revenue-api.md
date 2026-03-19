# Контракт выручки в админ-API

## Источник данных

- В отчётах суммируются **подтверждённые покупки** (`payment_status = confirmed`).
- Для строки покупки с заполненными `purchase.amount` и `purchase.currency` сумма попадает в **RUB** или **USD** по фактической валюте платежа (без конвертации и без смешивания).
- Старые записи **без `amount`**: учитываются **только в ветке RUB** через `COALESCE(pack.prices_by_currency->>'RUB', pack.price)`.
- **EUR** в агрегатах дашборда и UTM **не выводится** (только ₽ и $).

## Дашборд

`GET /admin/dashboard/metrics?period=week|month`

- `metrics.revenueMonth`: `rub`, `usd`, `todayRub`, `todayUsd`.
- `revenueTrend[]`: `rub`, `usd`, `label`, `fullDate` (два значения на день).

## UTM

Поля `revenue_rub` и `revenue_usd` в:

- списке кампаний, карточке кампании, summary, stats, series (в каждой точке серии).

CSV экспорт: колонки `revenue_rub`, `revenue_usd`.

## Настройка «отображение валюты» в админке

Влияет на **карточки пакетов (цены)**, не на эти отчёты — выручка всегда показывается **двумя строками RUB + USD**.

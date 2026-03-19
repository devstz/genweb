# Деплой: миграции и кэш

## База (genaivideoalicebot)

После обновления кода с `prices_by_currency`:

```bash
alembic upgrade head
```

Убедиться, что применена миграция `b3c4d5e6f7a8_pack_prices_by_currency` (или актуальная `head`).

## Админ-дашборд (genweb)

Клиент кэширует `GET /admin/dashboard/metrics` **на 2 минуты** на ключ `period + revenue_currency`. После смены валюты в настройках допустима задержка до TTL; полное обновление — перезагрузка страницы или смена периода (неделя/месяц).

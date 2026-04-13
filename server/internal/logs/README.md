# Logs And Analytics

Этот модуль отвечает за:

- запись технических логов в JSONL-файлы;
- чтение логов;
- агрегацию статистики по дням и IP;
- выдачу статистики через HTTP-эндпоинты.

## Формат хранения

Все логи пишутся в формате JSONL (одна JSON-запись на строку).

По умолчанию директория задается через `LOGS_DIR` (если не задана, используется `./logs`).

## Что собирает каждый лог-файл

### `connections.jsonl`

События жизненного цикла WebSocket-соединений:

- подключение (`event = "connected"`);
- отключение (`event = "disconnected"`);
- длительность сессии (`duration_seconds`);
- причина отключения (`disconnect_reason`);
- идентификатор сессии и IP клиента.

Пример записи:

```json
{
    "timestamp": "2026-04-13T15:20:00Z",
    "session_id": "...",
    "client_ip": "1.2.3.4",
    "event": "connected"
}
```

### `errors.jsonl`

Ошибки по этапам обработки:

- этап (`stage`): `connection_upgrade`, `read_config`, `unmarshal_config`, `process_start`, `send_message`, `scan_output`;
- тип ошибки (`error_type`);
- текст ошибки (`message`);
- признак восстанавливаемости (`recoverable`).

Пример записи:

```json
{
    "timestamp": "2026-04-13T15:20:01Z",
    "session_id": "...",
    "client_ip": "1.2.3.4",
    "stage": "process_start",
    "error_type": "ProcessError",
    "message": "...",
    "recoverable": false
}
```

### `metrics.jsonl`

Метрики выполнения симуляции:

- время выполнения процесса (`process_duration_ms`);
- количество отправленных строк (`lines_streamed`);
- средняя latency отправки сообщения (`avg_message_latency_ms`);
- пропускная способность (`lines_per_second`);
- код выхода (`exit_code`);
- успешность выполнения (`success`).

Пример записи:

```json
{
    "timestamp": "2026-04-13T15:20:10Z",
    "session_id": "...",
    "client_ip": "1.2.3.4",
    "process_duration_ms": 9123,
    "lines_streamed": 1480,
    "avg_message_latency_ms": 1.2,
    "lines_per_second": 162.2,
    "exit_code": 0,
    "success": true
}
```

### `ip_access.jsonl`

Упрощенный журнал доступа по IP:

- IP адрес;
- успешность выполнения (`success`);
- длительность обработки (`duration` в миллисекундах);
- timestamp.

Пример записи:

```json
{
    "timestamp": "2026-04-13T15:20:10Z",
    "ip": "1.2.3.4",
    "success": true,
    "duration": 9123
}
```

## HTTP-эндпоинты аналитики

### `GET /api/analytics/weekly`

Возвращает агрегированную статистику за последние 7 дней.

Поля ответа:

- `period`: описание периода;
- `total_connections`: общее число подключений;
- `total_errors`: общее число ошибок;
- `success_rate`: процент успешных запросов;
- `unique_ips`: уникальные IP;
- `top_ips`: топ IP по числу запросов;
- `daily_breakdown`: разбивка по дням;
- `country_distribution`: распределение по странам.

Пример ответа:

```json
{
    "period": "Last 7 days from 2026-04-13",
    "total_connections": 120,
    "total_errors": 6,
    "success_rate": 95,
    "unique_ips": 18,
    "top_ips": [],
    "daily_breakdown": {},
    "country_distribution": {}
}
```

### `GET /api/analytics/daily?date=YYYY-MM-DD`

Возвращает статистику за конкретный день.

Query-параметры:

- `date` (обязательный): дата в формате `YYYY-MM-DD`.

Ошибки:

- `400 Bad Request` если параметр не передан или неверный формат.

Структура ответа аналогична weekly, но в рамках одного дня.

### `GET /api/analytics/ip/:ip?days=7`

Возвращает детальную статистику по конкретному IP.

Path-параметры:

- `ip`: IP адрес клиента.

Query-параметры:

- `days` (опционально): глубина периода в днях.

Поля ответа:

- `ip`;
- `total_requests`;
- `total_errors`;
- `success_count`;
- `period_days`;
- `daily_breakdown`.

Пример ответа:

```json
{
    "ip": "1.2.3.4",
    "total_requests": 42,
    "total_errors": 2,
    "success_count": 40,
    "period_days": 7,
    "daily_breakdown": {}
}
```

### `GET /api/health`

Проверка состояния сервиса.

Пример ответа:

```json
{
    "status": "ok",
    "timestamp": {}
}
```

## Важные замечания

1. `country_distribution` сейчас возвращается, но фактическая геолокация IP не вычисляется (нет интеграции с GeoIP провайдером).
2. Для production рекомендуется:

- ротация файлов логов;
- ограничение размера JSONL;
- архивирование/экспорт в централизованное хранилище (ELK, ClickHouse, Loki, S3 и т.д.).

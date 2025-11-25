# Avito Parser Service

Сервис для парсинга Avito через браузерную автоматизацию (Puppeteer).

## Функционал

- ✅ Авторизация на Avito через логин/пароль
- ✅ Сохранение cookies для быстрой авторизации
- ✅ Парсинг списка чатов
- ✅ Парсинг сообщений из чата
- ✅ Отправка сообщений
- ✅ Поддержка прокси (HTTP/HTTPS/SOCKS4/SOCKS5)
- ✅ **Обход капчи через операторов CRM** (бесплатно!)
- ✅ Эмуляция поведения человека

## API Endpoints

### POST /api/v1/parser/login
Авторизация на Avito

**Body:**
```json
{
  "account": {
    "id": 1,
    "login": "79001234567",
    "password": "password",
    "proxyHost": "proxy.example.com",
    "proxyPort": 8080,
    "proxyType": "http",
    "proxyLogin": "user",
    "proxyPassword": "pass"
  }
}
```

### POST /api/v1/parser/chats
Получить список чатов

**Body:**
```json
{
  "account": {
    "id": 1,
    "cookies": "...",
    "proxyHost": "...",
    ...
  }
}
```

### POST /api/v1/parser/messages
Получить сообщения из чата

**Body:**
```json
{
  "account": {...},
  "chatId": "123456"
}
```

### POST /api/v1/parser/send
Отправить сообщение

**Body:**
```json
{
  "account": {...},
  "chatId": "123456",
  "message": "Здравствуйте!"
}
```

### GET /api/v1/captcha/pending
Получить список ожидающих капчи (для операторов)

### POST /api/v1/captcha/submit
Отправить решение капчи

**Body:**
```json
{
  "captchaId": "captcha_1_1234567890",
  "answer": "abc123"
}
```

## Environment Variables

```env
PORT=5011
NODE_ENV=production
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

## Как работает решение капчи

1. **Парсер встречает капчу** → делает скриншот и отправляет в очередь
2. **Оператор в CRM видит модалку** с изображением капчи
3. **Оператор вводит ответ** → отправляется в парсер
4. **Парсер продолжает** работу

**Преимущества:**
- ✅ Бесплатно (не нужен 2captcha)
- ✅ Надежнее (человек лучше распознает)
- ✅ Быстрее (оператор всегда онлайн)

## Docker

```bash
docker build -t avito-parser-service .
docker run -p 5011:5011 avito-parser-service
```

## Kubernetes

См. файлы в `/k8s/deployments/`


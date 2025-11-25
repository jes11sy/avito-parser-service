# Деплой Avito Parser Service

## 🎉 Капча решается БЕСПЛАТНО операторами!

Вместо платного 2captcha, капчу решают операторы прямо в CRM!

---

## 1. Обновить БД

```bash
# Применить миграцию
kubectl exec -it deployment/avito-service -n backend -- sh
cd /app
npx prisma db push

# Или выполнить SQL напрямую
psql -h 89.223.121.98 -U gen_user -d default_db < prisma/migrations/add_parser_fields.sql
```

## 2. Обновить секреты

```bash
# Применить секреты (2captcha больше не нужен!)
kubectl apply -f ../../k8s/secrets/avito-parser-secrets.yaml
```

## 3. Собрать и задеплоить parser-service

```bash
cd api-services/avito-parser-service

# Установить зависимости
npm install

# Собрать Docker образ
docker build -t jes11sy/avito-parser-service:latest .

# Запушить
docker push jes11sy/avito-parser-service:latest

# Задеплоить в Kubernetes
kubectl apply -f ../../k8s/deployments/avito-parser-service.yaml

# Проверить статус
kubectl get pods -n backend | grep parser
kubectl logs -f deployment/avito-parser-service -n backend
```

## 4. Обновить аккаунты в БД

Для каждого аккаунта нужно добавить логин/пароль от Avito:

```sql
UPDATE avito 
SET 
  avito_login = '79001234567',  -- телефон или email
  avito_password = 'password',   -- пароль от Avito
  use_parser = true              -- включить парсер
WHERE id = 1;
```

## 5. Тестирование

```bash
# Проверить health
curl http://avito-parser-service:5011/api/v1/parser/health

# Проверить логин (из пода avito-service)
kubectl exec -it deployment/avito-service -n backend -- sh
curl -X POST http://avito-parser-service:5011/api/v1/parser/login \
  -H "Content-Type: application/json" \
  -d '{"account": {"id": 1, "login": "79001234567", "password": "pass"}}'
```

## 6. Обновить frontend callcentre

```bash
cd ../../"frontend callcentre"

# Собрать образ
docker build -t jes11sy/frontend-callcentre:latest .

# Запушить
docker push jes11sy/frontend-callcentre:latest

# Перезапустить
kubectl rollout restart deployment/frontend-callcentre -n frontend
kubectl rollout status deployment/frontend-callcentre -n frontend
```

## 7. Обновить Ingress

```bash
# Применить обновленный Ingress (добавлены маршруты /parser и /captcha)
kubectl apply -f ../../k8s/ingress/backend-ingress.yaml
```

## 8. Использование в CRM

После деплоя:

1. **Чаты работают через парсер** для аккаунтов где `use_parser = true`
2. **Операторы видят капчу** в модальном окне автоматически
3. **Решают капчу** → парсер продолжает работу

**Скорость:**
- Загрузка чатов: 2-3 сек
- Загрузка сообщений: 1-2 сек
- Отправка сообщения: 2-3 сек

**Стоимость:**
- Прокси: уже есть
- ~~2captcha: ~$10-30/мес~~ → **$0 (БЕСПЛАТНО!)** 💰

## Troubleshooting

### Ошибка "Chromium not found"
```bash
# В Dockerfile уже установлен Chromium
# Если ошибка - проверьте что образ собран правильно
```

### Капча не решается
```bash
# Проверьте что оператор видит модалку в CRM
# Проверьте логи:
kubectl logs -f deployment/avito-parser-service -n backend | grep -i captcha

# Проверьте очередь капчи:
curl https://api.lead-schem.ru/api/v1/captcha/pending

# Проверьте что frontend обновлен:
kubectl rollout status deployment/frontend-callcentre -n frontend
```

### Медленная работа
```bash
# Увеличьте ресурсы в deployment:
resources:
  limits:
    memory: "4Gi"
    cpu: "2000m"
```

## Мониторинг

```bash
# Логи parser-service
kubectl logs -f deployment/avito-parser-service -n backend

# Метрики
kubectl top pod -n backend | grep parser

# Проверить браузеры
kubectl exec -it deployment/avito-parser-service -n backend -- ps aux | grep chromium

# Проверить очередь капчи
curl https://api.lead-schem.ru/api/v1/captcha/pending

# Проверить что операторы видят капчу
# Откройте https://callcentre.lead-schem.ru
# При появлении капчи модалка появится автоматически
```

---

## 🎯 Преимущества нового подхода

✅ **Бесплатно** - не нужен 2captcha  
✅ **Надежнее** - человек лучше распознает  
✅ **Быстрее** - оператор всегда онлайн  
✅ **Экономия** - ~$10-30/мес на каждый аккаунт  

**Как работает:**
1. Парсер встречает капчу → делает скриншот
2. Оператор видит модалку в CRM
3. Оператор вводит ответ
4. Парсер продолжает работу

Подробнее см. `CAPTCHA_SETUP.md` в корне проекта.


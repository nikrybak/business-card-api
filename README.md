# Business card API

Цифровая визитка Никиты Рыбака - backend на NestJS, Prisma и GraphQL

- Apollo Sandbox: <https://business-card-api-amp9.onrender.com/graphql>
- Health check: <https://business-card-api-amp9.onrender.com/health/ready>

Сервис на бесплатном тарифе Render засыпает без запросов - первый ответ после паузы идёт до минуты

## Запуск

Нужен только Docker:

```bash
docker compose up --build
```

Сервис `migrate` применяет миграции и заполняет базу, после него `api` открывает Sandbox на <http://localhost:3000/graphql>

Пример запроса:

```graphql
{
  profile {
    name
    description
    links {
      label
      url
    }
    skills(category: BACKEND) {
      name
    }
    experience {
      company
      position
      period {
        start
        end
        months
      }
      achievements
    }
    projects {
      name
      url
    }
  }
}
```

Локальная разработка - Node.js 22+ и npm, который идёт вместе с Node:

```bash
docker compose up -d db
cp .env.example .env
npm ci
npm run db:migrate && npm run db:seed
npm run start:dev
```

Проверки:

```bash
npm run typecheck && npm run lint && npm run format:check
npm test
npm run test:e2e
```

Живые проверки работающего сервиса - Sandbox, health, вложенные данные, фильтр, ошибки валидации:

```bash
npm run smoke -- https://business-card-api-amp9.onrender.com
```

## Архитектура

```text
src/
  main.ts               старт: логгер, shutdown hooks, порт
  app/                  сборка приложения - знает всех, его не знает никто
    app.module.ts       корень: конфиг, Prisma, срезы, GraphQL, фильтр ошибок
    app.config.ts       PORT, NODE_ENV
    app-exception.filter.ts  политика ошибок API
    request-context.ts  контекст запроса: request id и DataLoader'ы
    request-logging.plugin.ts  структурная запись лога на GraphQL-операцию
    health.controller.ts     GET /health и /health/ready
  database/             подключение к базе - не знает ни app, ни срезов
    database.config.ts  DATABASE_URL
    prisma.module.ts    глобальный PrismaService
    prisma.service.ts
    seed/               содержимое визитки и идемпотентный сид
  shared/               кирпичи для срезов - не знает никого
    env.ts              readEnv, readPort
    domain.error.ts     база доменных ошибок
    grouped-loader.ts   DataLoader "дети по родителю"
  card/                 срез "визитка" - модуль собирает три слоя
    index.ts            публичный вход среза: всё, что видно снаружи
    card.module.ts      единственное место, где слои связаны
    card.config.ts      настройки среза (PROFILE_SLUG)
    domain/
      card.reader.ts    порт CardReader и типы, которыми он говорит
      card.service.ts   владелец визитки
      card.rules.ts     чистые правила: период работы, выбор навыков
      card.errors.ts    доменные ошибки
    data/
      prisma-card.repository.ts  адаптер Prisma для порта
    api/
      card.resolvers.ts поля GraphQL
      card.inputs.ts    что приходит: аргументы
      card.outputs.ts   что уходит: типы ответа и CardMapper (запись -> тип, поля явно)
      card.loaders.ts   DataLoader'ы на запрос, контекст и @Loaders()
      card.example.ts   пример запроса для Sandbox
prisma/                 схема и миграции
test/                   e2e на реальной базе и на in-memory адаптере порта
```

### Слои и зависимости

Верхний уровень: `main -> app -> card -> database -> shared`; каждый знает только тех, кто правее, и свой конфиг регистрирует сам (`app.config.ts`, `database.config.ts`, `card.config.ts`)

Внутри среза направление одно: `api -> domain <- data`

- `domain` не знает ни про GraphQL, ни про Prisma как технологию - он объявляет порт `CardReader`, абстрактный класс, который заодно служит токеном DI
- `data` реализует порт через Prisma, `CardModule` связывает их одной строкой `{ provide: CardReader, useClass: PrismaCardRepository }` - хранилище меняется без правок домена и API. Это проверено: `test/card-in-memory.e2e-spec.ts` поднимает всё приложение с `InMemoryCardReader` вместо Prisma и отвечает на GraphQL-запросы без базы
- `api` отдаёт наружу только DTO - маппер `CardMapper` копирует поля явно, служебные `slug`, `sortOrder` и внешние ключи в ответ не попадают
- типы хранилища домен и API берут только из `card.reader.ts` - про `~/database` в срезе знают ровно два файла: порт и адаптер
- направление закреплено в ESLint (`no-restricted-imports` по слоям): `shared` не импортирует никого, `database` - `app` и срезы, срезы - `app`; внутри среза `domain` не импортирует `api`, `data`, GraphQL и базу, `api` - `data` и базу, `data` - `api` и GraphQL; нарушение роняет `lint`

Новый срез, например "блог", добавляется рядом с `card` тем же набором папок и подключается одним импортом модуля

### Вложенные данные без N+1

Главный вопрос задания - как GraphQL ходит в базу за вложенными данными. Варианты:

1. `include` по всему дереву в корневом резолвере - один запрос, но база читает все таблицы даже для `{ profile { name } }`
2. Построение `include` из AST запроса - точно, но связывает слой данных с GraphQL и усложняется на фрагментах и алиасах
3. DataLoader на каждую связь - выбран

Каждая связь - отдельный `@ResolveField`, который читает данные через DataLoader:

- поле, которого нет в запросе, не стоит ни одного запроса к базе
- все ключи одного тика собираются в один `WHERE parent_id IN (...)`: достижения всех мест работы читаются одним запросом, а не запросом на каждое место
- полный запрос визитки - ровно 6 запросов к базе при любом числе записей
- DataLoader'ы создаются заново на каждый HTTP-запрос в контексте GraphQL, поэтому кэш не протекает между пользователями, а сервисы остаются синглтонами без request scope
- владелец визитки читается один раз на HTTP-запрос, сколько бы алиасов `profile` ни было в документе

Это проверяет e2e-тест: число вызовов `findAchievements` равно одному при четырёх местах работы

### База данных

- PostgreSQL, Prisma 7 с драйвер-адаптером `@prisma/adapter-pg` - без бинарного движка запросов
- Профиль - корень, остальные таблицы ссылаются на него с `ON DELETE CASCADE`
- Индексы `(parent_id, sortOrder)` и уникальный `(profileId, startedAt, company)` покрывают и выборку по родителю, и порядок
- Порядок ссылок, навыков и проектов хранится явно в `sortOrder` - он часть содержимого, а не случайность вставки
- Стек хранится массивом `text[]` - это атрибут записи, отдельная таблица ради него не нужна
- Период работы хранится датами, а месяцы и формат `YYYY-MM` считает домен - так нет рассинхрона между хранимым и вычисляемым

### Инициализация базы

Миграции и сид - шаг деплоя, а не запуска приложения: после зелёных проверок на `main` джоба CI `migrate-production` выполняет `prisma migrate deploy` и сид на боевой базе. Prisma CLI нужен только для разработки и этой джобы, поэтому лежит в `devDependencies`. Рабочий образ собран на distroless `gcr.io/distroless/nodejs22-debian12:nonroot`: только Node.js, скомпилированный `dist` и прод-пакеты, без npm, shell и root - это проверяет `npm run check:image` в CI

Сид идемпотентный: содержимое визитки лежит в коде (`src/database/seed/card.data.ts`) и считается источником истины, поэтому сид в одной транзакции приводит базу к нему: профиль обновляется по `slug`, места работы - по ключу `(profileId, startedAt, company)`, остальные строки пишутся заново. Повторный запуск не плодит дубли и не меняет `id`, которые видит API, а правка данных - это правка одного файла

### Ошибки

- Доменные ошибки наследуют `DomainError` и несут код, например `PROFILE_NOT_FOUND`
- Глобальный `AppExceptionFilter` отдаёт клиенту сообщение и код доменной ошибки, а всё неожиданное пишет в лог со стеком и заменяет на `INTERNAL_SERVER_ERROR` из `ApolloServerErrorCode` - детали инфраструктуры наружу не уходят

Коды, которые получает клиент в `errors[].extensions.code`:

| Код                         | HTTP | Когда                                               |
| --------------------------- | ---- | --------------------------------------------------- |
| `PROFILE_NOT_FOUND`         | 200  | владелец визитки из `PROFILE_SLUG` не найден в базе |
| `INTERNAL_SERVER_ERROR`     | 200  | любой неожиданный сбой, подробности только в логе   |
| `GRAPHQL_PARSE_FAILED`      | 400  | синтаксическая ошибка или документ больше лимита    |
| `GRAPHQL_VALIDATION_FAILED` | 400  | неизвестное поле, неверное значение enum            |

- HTTP-маршруты, такие как `/health`, обрабатываются стандартным фильтром Nest
- Документ больше 500 токенов или 10 000 символов отклоняется на разборе (`parseOptions.maxLexicalTokens` и `maxSourceLength` из `graphql-js`) с кодом `GRAPHQL_PARSE_FAILED` и не доходит до резолверов. Пример визитки в Sandbox - 41 токен, интроспекция - около 180 токенов и 2 000 символов
- Подключение к базе ограничено 5 секундами (`connectionTimeoutMillis`): у драйвера `pg` по умолчанию ожидание бесконечное
- Заголовок `X-Powered-By` отключён, Sandbox не опрашивает схему повторно

### Конфигурация, логи, остановка

- Конфигурация разбита по ключам `app`, `database`, `card` через `registerAs` и внедряется типизированно через `@Inject(config.KEY)`. Значения проверяются при старте - без `DATABASE_URL` сервис не поднимется
- Один логгер на процесс: в production это JSON-строки для сборщика логов, в разработке - цветной вывод. Плагин Apollo пишет одну структурную запись на операцию: `requestId`, имя, длительность, ошибки. Request id берётся из заголовка `x-request-id`, если он безопасный, иначе генерируется, и возвращается в ответе - по нему находится всё, что случилось с запросом
- Две проверки: `/health` отвечает, пока жив процесс, `/health/ready` - только когда отвечает база. Render смотрит на readiness, поэтому новый инстанс получает трафик лишь после того, как достучался до базы
- Graceful shutdown: по SIGTERM Nest перестаёт принимать запросы, затем `PrismaService` закрывает пул соединений

### Схема GraphQL

Code-first: типы описаны классами DTO, схема собирается из них. В разработке она пишется в `schema.gql` - файл лежит в репозитории, чтобы контракт было видно без запуска

## Стек

TypeScript, Node.js 22, NestJS 11, GraphQL и Apollo Server 5, Prisma 7, PostgreSQL 17, Docker, npm, Jest, ESLint и Prettier, GitHub Actions

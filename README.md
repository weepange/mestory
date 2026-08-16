# Mestory 🌆 — Цифровая платформа для персонализированного открытия города

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-EF4444.svg)](https://turbo.build/)
[![Fastify](https://img.shields.io/badge/Fastify-4.x-000000.svg)](https://fastify.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14%20App%20Router-000000.svg)](https://nextjs.org/)
[![Expo](https://img.shields.io/badge/Expo%20SDK-54-000020.svg)](https://expo.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5.svg)](https://kubernetes.io/)

> **Mestory** — современная многосторонняя цифровая экосистема, объединяющая жителей, локальных авторов и городской бизнес в единое интерактивное пространство для поиска мест, актуальных событий, сторис и авторских маршрутов.
> 
> 📍 **Пилотный запуск**: Ростов-на-Дону (с архитектурной поддержкой масштабирования на любые города).

---

## 📑 Содержание

1. [Ключевые возможности](#-ключевые-возможности)
2. [Архитектура монорепозитория](#-архитектура-монорепозитория)
3. [Технологический стек](#-технологический-стек)
4. [Быстрый запуск в Docker (Рекомендуемый)](#-быстрый-запуск-в-docker)
5. [Локальная разработка без Docker](#-локальная-разработка-без-docker)
6. [Тестирование мобильного приложения (iOS / Android / Web)](#-тестирование-мобильного-приложения)
7. [Оркестрация в Kubernetes (K8s)](#-оркестрация-в-kubernetes)
8. [Алгоритм гибридных рекомендаций](#-алгоритм-гибридных-рекомендаций)
9. [Спецификация API и эндпоинты](#-спецификация-api)
10. [Безопасность и архитектурные решения](#-безопасность-и-архитектура)
11. [Troubleshooting (Частые вопросы)](#-troubleshooting)

---

## ✨ Ключевые возможности

| Функция | Описание |
| :--- | :--- |
| **🧠 Гибридный рекомендательный движок** | Умная персонализированная лента, учитывающая GPS-координаты пользователя (дистанцию), интересы и теги, активность сохранений и верификацию заведений. |
| **📸 Интерактивные Истории (Instagram-style)** | Полноэкранный плеер сторис с сегментированным прогрессом, паузой по удержанию, быстрыми реакциями и карточкой привязанного заведения в 1 тап. |
| **🗺️ Интерактивная карта Яндекс.Карт** | Кастомные метки по категориям, фильтрация по радиусу, карточки в модальных шторках и построение пешеходных/автомобильных маршрутов в Яндекс Go. |
| **👤 Единый профиль Жителя и Автора** | Любой пользователь может вести свой блог, публиковать сторис, собирать тематические подборки («Где пить фильтр-кофе») и получать бейдж верифицированного эксперта. |
| **🏢 Личный кабинет бизнеса (`/business`)** | Инструменты для владельцев заведений: статистика просмотров, добавления в закладки, клики маршрутов и верификация по ИНН. |
| **⚡ Демо-вход в 1 клик** | Мгновенное переключение между ролями (**Житель**, **Автор @don_foodie**, **Владелец LEO Wine**) для тестирования функционала. |

---

## 🏗️ Архитектура монорепозитория

Проект организован на базе **Turborepo** и **pnpm workspaces**:

```
mestory/
├── apps/
│   ├── api/                     # Бэкенд Fastify REST API + Prisma ORM (порт 4000)
│   │   ├── prisma/              # Схема БД schema.prisma, миграции
│   │   ├── src/modules/         # auth, places, events, stories, feed, collections, business
│   │   ├── src/seed.ts          # Датасет заведений и авторов Ростова-на-Дону
│   │   └── docker-entrypoint.sh # Автоматический push схемы, seed и старт в Docker
│   │
│   ├── web/                     # Веб-приложение Next.js 14 App Router (порт 3000)
│   │   ├── src/app/             # Страницы: Главная, Закладки, Кабинет бизнеса, Профиль автора
│   │   └── src/components/      # StoriesBar, StoryViewerModal (Portal), YandexMap, PlaceDetailDrawer
│   │
│   └── mobile/                  # Кроссплатформенное приложение React Native / Expo SDK 54
│       ├── app/(tabs)/          # Табы: Лента, Карта, Закладки, Профиль (Expo Router)
│       └── src/components/      # Нативные сторис, карточки мест, модальные шторки
│
├── packages/
│   ├── shared/                  # Общий код: типы TypeScript, схемы валидации Zod, константы
│   └── tsconfig/                # Единые конфигурации компилятора TypeScript
│
├── k8s/                         # Манифесты Kubernetes (StatefulSet, Deployment, Ingress, Kustomize)
├── docker-compose.yml           # Multi-container Compose файл (PostgreSQL 16 + API + Web)
└── deploy.sh                    # Единый CLI-скрипт управления развертыванием
```

---

## ⚡ Технологический стек

- **Backend**: Node.js 20, Fastify 4, Prisma ORM 5, JWT (HS256, 7 дней), Swagger/OpenAPI, Bcrypt, Zod.
- **Frontend (Web)**: Next.js 14 (App Router, Standalone output), React 18, Tailwind CSS, Lucide Icons, Yandex Maps JS API v2.1.
- **Mobile App**: React Native 0.81, Expo SDK 54, Expo Router v6, React Native Reanimated, react-native-web.
- **База данных**: PostgreSQL 16 (с именованным Docker-томом `mestory_postgres_data`) / SQLite для автономных тестов.
- **Оркестрация**: Docker, Docker Compose, Kubernetes (K8s/Kustomize).

---

## 🐳 Быстрый запуск в Docker

Самый надежный и изолированный способ запуска всей платформы. Все данные PostgreSQL сохраняются между перезапусками.

### 1. Запуск всех сервисов:
```bash
./deploy.sh up
```
*(Или напрямую: `docker compose up -d --build`)*

Скрипт автоматически:
1. Поднимет контейнер PostgreSQL 16 и проверит healthcheck.
2. Соберет и запустит контейнер Fastify API на порту `4000`, автоматически накатит схему базы данных и заполнит ее тестовыми местами Ростова-на-Дону.
3. Соберет оптимизированный Standalone-образ Next.js 14 и запустит веб-сайт на порту `3000`.

### 2. Доступ к сервисам:
- 🌐 **Веб-сайт**: [http://localhost:3000](http://localhost:3000)
- 🔌 **Fastify API**: [http://localhost:4000](http://localhost:4000)
- 📚 **Swagger Документация**: [http://localhost:4000/docs](http://localhost:4000/docs)
- 🗄️ **PostgreSQL**: `localhost:5432` (пользователь: `mestory`, пароль: `mestory_secret_2026`, БД: `mestory_db`)

### 3. Управление контейнерами:
```bash
./deploy.sh logs      # Просмотр логов в реальном времени
./deploy.sh restart   # Быстрый перезапуск без потери данных
./deploy.sh down      # Остановка контейнеров (данные БД остаются нетронутыми)
```

---

## 💻 Локальная разработка без Docker

Если вы хотите вносить изменения в исходный код с Hot Reload (горячей перезагрузкой):

### 1. Требования:
- Node.js >= 18.0.0 (рекомендуется v20+)
- `pnpm` >= 9.0.0 (`npm i -g pnpm`)

### 2. Установка зависимостей и инициализация БД:
```bash
# Клонирование репозитория
git clone https://github.com/weepange/mestory.git
cd mestory

# Установка всех зависимостей монорепозитория
pnpm install

# Генерация Prisma Client и наполнение базы данными
pnpm db:generate
pnpm db:push
pnpm db:seed
```

### 3. Запуск всех приложений одновременно:
```bash
pnpm dev
```
*(Turborepo параллельно запустит API на порту 4000 и Next.js на порту 3000).*

---

## 📱 Тестирование мобильного приложения

Мобильное приложение построено на **Expo SDK 54** и готово к тестированию тремя способами:

### Способ 1: На физическом смартфоне через Expo Go (Рекомендуется)
1. Установите бесплатное приложение **Expo Go** на телефон:
   - [Expo Go в App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779)
   - [Expo Go в Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Убедитесь, что телефон и компьютер подключены к **одному Wi-Fi роутеру**.
3. В терминале запустите Metro-сервер:
   ```bash
   pnpm --filter @mestory/mobile start --clear
   ```
4. Отсканируйте появившийся QR-код:
   - **На iPhone**: откройте обычную камеру iOS и нажмите на баннер «Открыть в Expo Go».
   - **На Android**: откройте приложение Expo Go и нажмите «Scan QR code».

### Способ 2: В браузере (быстрый предпросмотр UI)
```bash
pnpm --filter @mestory/mobile web
```
Откройте [http://localhost:8081](http://localhost:8081) в браузере и нажмите `F12` -> режим мобильного устройства (`Ctrl + Shift + M`).

### Способ 3: В Android Emulator / iOS Simulator
- **Android**: запустите эмулятор в Android Studio и выполните `pnpm --filter @mestory/mobile android`.
- **iOS** *(только macOS)*: `pnpm --filter @mestory/mobile ios`.

> 💡 **Автономность**: мобильное приложение снабжено умным клиентом с fallback-кэшем. Даже при слабом сигнале или отсутствии связи с ПК приложение запустится за 0.05 секунды.

---

## ☸️ Оркестрация в Kubernetes

Все манифесты находятся в папке [`k8s/`](file:///home/wpng1337/mestory/k8s) и сконфигурированы под Kustomize:

- **Namespace**: `mestory`
- **PostgreSQL**: StatefulSet с PersistentVolumeClaim (`10Gi`) + Liveness/Readiness probes.
- **API**: Deployment (2 реплики) + RollingUpdate стратегия + ClusterIP Service.
- **Web**: Standalone Next.js Deployment (2 реплики) + ClusterIP Service.
- **Ingress**: NGINX Ingress с роутингом `/` на Web и `/api` на API.

### Применение манифестов в кластер:
```bash
# Развертывание
./deploy.sh k8s:apply
# или напрямую: kubectl apply -k k8s/

# Проверка статуса подов и сервисов
./deploy.sh k8s:status
```

---

## 🧠 Алгоритм гибридных рекомендаций

Лента рекомендаций формируется в [`apps/api/src/modules/feed/feed.service.ts`](file:///home/wpng1337/mestory/apps/api/src/modules/feed/feed.service.ts) по многофакторной скоринговой модели:

$$\text{Score} = S_{\text{geo}} + S_{\text{interests}} + S_{\text{rating}} + S_{\text{engagement}} + S_{\text{verification}}$$

1. **Геолокация ($S_{\text{geo}}$, вес 40%)**:
   - Расстояние вычисляется по формуле Haversine.
   - Экспоненциальное затухание: места в радиусе 1 км получают максимальный балл, за пределами 10 км влияние дистанции снижается.
2. **Совпадение интересов ($S_{\text{interests}}$, вес 25%)**:
   - Сравнение тегов места с предпочтениями пользователя (например, «Спешелти кофе», «Донская кухня», «Летняя терраса»).
3. **Рейтинг ($S_{\text{rating}}$, вес 15%)**:
   - Нормализованная оценка заведения на основе отзывов гостей.
4. **Сохранения ($S_{\text{engagement}}$, вес 10%)**:
   - Частота добавлений карточки заведения в персональные закладки жителями города.
5. **Верификация ($S_{\text{verification}}$, вес 10%)**:
   - Бонус заведениям с подтвержденным юридическим статусом и авторским рекомендациям.

---

## 🔌 Спецификация API

Интерактивная Swagger-документация доступна по адресу: **`http://localhost:4000/docs`**.

### Основные группы маршрутов:

| Метод | Эндпоинт | Описание |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Регистрация нового жителя / автора |
| `POST` | `/api/auth/login` | Авторизация и выдача JWT-токена |
| `POST` | `/api/auth/demo-login` | Демо-вход в 1 клик (`user`, `creator`, `business`) |
| `GET` | `/api/auth/me` | Получение профиля текущего пользователя |
| `GET` | `/api/feed` | Персонализированная лента рекомендаций (`lat`, `lng`, `category`, `cityId`) |
| `GET` | `/api/places` | Каталог заведений с фильтрацией и поиском |
| `GET` | `/api/places/:idOrSlug` | Детальная карточка места с отзывами и контактами |
| `GET` | `/api/events` | Городская афиша событий с фильтрацией по дате и категории |
| `GET` | `/api/stories` | Сгруппированные сторис авторов и заведений |
| `POST` | `/api/stories/:id/view`| Фиксация просмотра истории |
| `GET` | `/api/collections` | Авторские и кураторские подборки мест |
| `POST` | `/api/collections/bookmark` | Добавление / удаление места из закладок |
| `GET` | `/api/business/stats` | Аналитика карточки заведения (для владельцев бизнеса) |
| `GET` | `/health` | Системный эндпоинт проверки здоровья контейнеров |

---

## 🔒 Безопасность и архитектура

- **Валидация входящих данных**: все DTO строго валидируются через схемы **Zod** до попадания в контроллеры.
- **Защита от SQL Injection**: использование **Prisma ORM** с типобезопасными параметризованными запросами.
- **Хеширование паролей**: криптографический алгоритм **Bcrypt** с солью в 10 раундов.
- **Изоляция React Portal**: модальное окно историй в Web вынесено в корень `document.body` через React Portal с высшим приоритетом `z-[9999]`, исключая баги наложения контекстов CSS.
- **CORS и Rate Limiting**: настроена защита от межсайтовых запросов и сокрытие стектрейсов ошибок в production.

---

## 🛠️ Troubleshooting

### 1. Порт 4000 или 3000 уже занят на компьютере:
Если при запуске Docker возникает ошибка `address already in use`:
```bash
# Остановите локальные процессы Node.js
fuser -k 4000/tcp 3000/tcp 2>/dev/null || true
# Запустите сервисы заново
./deploy.sh up
```

### 2. Ошибка ngrok туннеля при запуске мобильного приложения:
Если ngrok исчерпал лимит сессий, запускайте приложение напрямую по локальной сети:
```bash
pnpm --filter @mestory/mobile start --clear
```

### 3. Очистка и полный сброс базы данных:
Если вы хотите пересоздать данные с нуля:
```bash
pnpm db:push --force-reset
pnpm db:seed
```

---

## 📄 Лицензия

Проект разработан под лицензией MIT. Исходный код открыт и доступен в [GitHub репозитории weepange/mestory](https://github.com/weepange/mestory).
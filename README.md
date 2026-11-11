# Calendar Thirteen

Веб-календарь из тринадцати месяцев по 28 дней. Страница является статическим приложением: HTML, CSS и JavaScript из каталога `dist` раздаются через Nginx.

## Контейнер

Готовый образ публикуется в GitHub Container Registry:

```text
ghcr.io/vryzhkov/calendarthirteen
```

Доступные типы тегов:

- `latest` — последний успешный образ из ветки `main`;
- `v1.0.0` — образ, собранный из одноимённого Git-тега;
- `sha-xxxxxxx` — образ конкретного коммита.

Образы собираются для `linux/amd64` и `linux/arm64`.

## Локальная сборка

Собрать образ из текущих исходников:

```bash
docker build -t calendar-thirteen:local .
```

Запустить его:

```bash
docker run --rm -p 8080:80 calendar-thirteen:local
```

Страница будет доступна по адресу <http://localhost:8080>. Проверить состояние контейнера можно через <http://localhost:8080/healthz>.

## Автоматическая публикация в GHCR

Workflow `.github/workflows/docker.yml` запускается:

- при отправке изменений в `main`;
- при создании Git-тега, начинающегося с `v`;
- вручную через вкладку **Actions** в GitHub.

Workflow использует встроенный `GITHUB_TOKEN`, собирает multi-arch образ, отправляет его в `ghcr.io` и создаёт подтверждение происхождения образа. Дополнительные секреты для публикации не нужны.

После первой сборки пакет появится на странице профиля GitHub в разделе **Packages**. По умолчанию новый пакет может быть приватным. Чтобы VPS мог скачивать образ без авторизации, откройте настройки пакета и измените **Package visibility** на `Public`.

## Развёртывание на VPS

### 1. Требования

На сервере должны быть установлены:

- Docker Engine;
- Docker Compose plugin (`docker compose`);
- доступ к `ghcr.io`.

Для Ubuntu используйте [официальную инструкцию установки Docker Engine](https://docs.docker.com/engine/install/ubuntu/). Проверка установки:

```bash
sudo docker run --rm hello-world
sudo docker compose version
```

Все следующие команды предполагают, что Docker запускается через `sudo`. Если пользователь добавлен в группу `docker`, `sudo` можно убрать.

### 2. Подготовка каталога

```bash
sudo mkdir -p /opt/calendar-thirteen
sudo chown "$USER":"$USER" /opt/calendar-thirteen
cd /opt/calendar-thirteen
```

Скопируйте в этот каталог файлы `compose.yaml` и `.env.example` из репозитория, затем создайте рабочий файл настроек:

```bash
cp .env.example .env
```

Содержимое `.env` по умолчанию:

```dotenv
GHCR_IMAGE=ghcr.io/vryzhkov/calendarthirteen
IMAGE_TAG=latest
BIND_ADDRESS=127.0.0.1
APP_PORT=8080
```

Для воспроизводимого production-развёртывания вместо `latest` рекомендуется указывать версию:

```dotenv
IMAGE_TAG=v1.0.0
```

### 3. Авторизация для приватного образа

Этот шаг не нужен, если GHCR-пакет публичный.

Для приватного пакета создайте в GitHub **Personal Access Token (classic)** с минимальным разрешением `read:packages`. На VPS выполните:

```bash
export GHCR_TOKEN="ВСТАВЬТЕ_ТОКЕН"

echo "$GHCR_TOKEN" | sudo docker login ghcr.io \
  --username YOUR_GITHUB_USERNAME \
  --password-stdin

unset GHCR_TOKEN
```

Не записывайте токен в `.env`, `compose.yaml` или историю Git.

### 4. Первый запуск

```bash
cd /opt/calendar-thirteen
sudo docker compose pull
sudo docker compose up -d
```

Проверить контейнер:

```bash
sudo docker compose ps
sudo docker compose logs --tail=100 calendar
curl --fail http://127.0.0.1:8080/healthz
```

Успешная проверка возвращает:

```text
ok
```

### 5. Домен и HTTPS

По умолчанию контейнер доступен только на `127.0.0.1:8080`. Это безопасная конфигурация для работы за обратным прокси.

Например, минимальный `Caddyfile`:

```caddyfile
calendar.example.com {
    reverse_proxy 127.0.0.1:8080
}
```

Направьте DNS-запись `A` домена на IP-адрес VPS и откройте наружу порты 80 и 443. Caddy автоматически запросит и будет обновлять TLS-сертификат.

Если страница должна временно открываться непосредственно по IP без обратного прокси, измените `.env`:

```dotenv
BIND_ADDRESS=0.0.0.0
APP_PORT=80
```

Затем пересоздайте контейнер:

```bash
sudo docker compose up -d
```

При прямой публикации порта обязательно настройте firewall VPS. Учитывайте, что Docker создаёт собственные правила `iptables`, и опубликованные порты могут обходить часть правил UFW.

## Обновление

Если используется `latest`:

```bash
cd /opt/calendar-thirteen
sudo docker compose pull
sudo docker compose up -d
```

Если используются версии, измените `IMAGE_TAG` в `.env`, затем выполните те же команды.

Проверка после обновления:

```bash
sudo docker compose ps
curl --fail http://127.0.0.1:8080/healthz
```

## Откат

Укажите предыдущую рабочую версию в `.env`:

```dotenv
IMAGE_TAG=v1.0.0
```

Примените изменение:

```bash
sudo docker compose pull
sudo docker compose up -d
```

## Выпуск версии

Создать версию и запустить её публикацию можно Git-тегом:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Статус сборки отображается во вкладке **Actions**, а опубликованные теги образа — в разделе **Packages** репозитория или профиля владельца.

## Структура контейнерных файлов

```text
Dockerfile                    сборка Nginx-образа
compose.yaml                  запуск контейнера на VPS
.env.example                  пример параметров развёртывания
.dockerignore                 исключения контекста сборки
deploy/nginx.conf             конфигурация веб-сервера
.github/workflows/docker.yml  публикация образа в GHCR
```

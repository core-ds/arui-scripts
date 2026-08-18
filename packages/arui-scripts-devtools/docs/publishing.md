# Публикация в Chrome Web Store

Всё, что можно приготовить заранее, лежит в репозитории: архив собирается одной командой,
картинки карточки — другой, тексты для формы — ниже, копируйте как есть.

Что придётся сделать руками: завести аккаунт разработчика (единоразовый взнос **5 $**),
загрузить архив и заполнить форму. Это [Chrome Web Store Developer Dashboard][dashboard].

## 1. Собрать архив

```bash
yarn workspace @alfalab/scripts-devtools pack:store
```

Готово: `packages/arui-scripts-devtools/build/arui-devtools-<версия>.zip`.

В архиве только то, что нужно расширению: манифест в корне (стор ищет его именно там), два
скрипта, две страницы и четыре иконки. Карты исходников не попадают — сборка на них падает.
Архив воспроизводимый: одинаковая сборка даёт одинаковые байты, поэтому по хешу видно, что
именно уехало в стор.

## 2. Картинки карточки

```bash
node packages/arui-scripts-devtools/scripts/store-assets.js
```

Скрипт напечатает команды для снятия png — выполните их. Итог в `docs/store/`:

| Файл                        | Размер   | Куда                            |
| --------------------------- | -------- | ------------------------------- |
| `icon-128.png`              | 128×128  | Store icon                      |
| `screenshot-*.png` (5 штук) | 1280×800 | Screenshots, максимум 5         |
| `promo-440x280.png`         | 440×280  | Small promo tile, необязательно |

Размеры стор проверяет строго: не тот размер — форма просто не примет файл.

Иконка расширения и знак на плитке рисуются `scripts/generate-icons.js`, скриншоты — тем же
стендом, что и картинки в README, поэтому в карточке будет ровно то же приложение.

## 3. Заполнить карточку

**Store listing**

-   **Name**: `ARUI DevTools` (берётся из манифеста)
-   **Summary** — до 132 символов, тоже из манифеста:

    > Отладка микрофронтендов arui-scripts: загрузки модулей, стадии, share scope, события шины
    > и подмена провайдера на localhost

-   **Category**: Developer Tools
-   **Language**: Russian
-   **Description** — готовый текст:

    > Вкладка **ARUI** в Chrome DevTools для приложений, которые собирают микрофронтенды
    > на `arui-scripts`.
    >
    > Что видно:
    >
    > • **Модули** — таблица попыток загрузки: откуда брали модуль, какой манифест прочитали,
    > какая версия приехала. Строка раскрывается в водопад стадий с паузами между ними
    > и в список ресурсов с Resource Timing.
    >
    > • **Ошибки** — стадия, на которой всё сломалось, сообщение и стек. Кадры стека кликабельны
    > и открывают файл во вкладке Sources.
    >
    > • **Таймлайн** — что грузилось параллельно, а что встало в очередь за чужой загрузкой.
    > Записи переживают перезагрузку страницы: модуль, упавший на старте, ищут уже после F5.
    >
    > • **Share scope** — что реально лежит в общих скоупах, кто какую версию просил и кто
    > из-за этого получит не ту.
    >
    > • **Event bus** — события шины и число слушателей у каждого: сразу видно событие,
    > ушедшее в пустоту.
    >
    > • **Подмена** — адрес провайдера перенаправляется на локальный дев-сервер. Правку в модуле
    > видно в реальном хосте на стенде, собирать и выкладывать её для этого не нужно.
    >
    > Приложению ничего доустанавливать не нужно: расширение читает публичный контракт
    > `globalThis.__ARUI_DEVTOOLS__`, который наполняет загрузчик модулей. В прод-сборке сбор
    > диагностики спит и включается ключом `arui:devtools` в localStorage.
    >
    > Исходники и документация: https://github.com/core-ds/arui-scripts

**Privacy**

-   **Single purpose** — одна строка, англоязычная форма читается ревьюером:

    > Debugging micro-frontends built with arui-scripts: shows module loading diagnostics
    > in a dedicated Chrome DevTools tab.

-   **Permission justification → `declarativeNetRequest`**:

    > Lets a developer redirect requests from a module provider origin to a local dev server
    > (for example https://cdn.example.com to http://localhost:8082) using session-scoped
    > redirect rules. This is the core debugging feature: it allows testing a local build of
    > a micro-frontend inside a real host application without deploying it. Rules are created
    > only when the user explicitly enables a redirect in the panel and disappear when the
    > browser session ends.

-   **Permission justification → host permissions**:

    > Host access is optional and requested at runtime only for the single origin the user
    > chose to redirect, at the moment they press "Enable". The extension asks for nothing on
    > install, never injects content scripts and never reads or modifies page content.

-   **Remote code**: No, всё в пакете.
-   **Data usage**: не отмечать ни одну категорию, подтвердить три пункта про непродажу и
    нецелевое использование. Расширение читает диагностику инспектируемой страницы через
    `chrome.devtools.inspectedWindow.eval` и показывает её локально; наружу не уходит ничего.
-   **Privacy policy URL**: https://github.com/core-ds/arui-scripts/blob/master/packages/arui-scripts-devtools/docs/privacy.md

**Distribution**

-   **Visibility** — выбирайте по тому, кому расширение нужно:
    -   **Public** — видно в каталоге и в поиске. Для открытого инструмента открытого репозитория.
    -   **Unlisted** — ставится только по прямой ссылке, в поиске нет. Разумный вариант
        для внутреннего инструмента, который не хочется рекламировать.
    -   **Private** — только для аккаунтов вашей организации; требует, чтобы стор был подключён
        к Google Workspace компании.
-   **Regions**: все.

## 4. Перед отправкой

-   [ ] `yarn workspace @alfalab/scripts-devtools test` и `lint` — зелёные
-   [ ] версия в `package.json` поднята (манифест берёт её оттуда) и не совпадает с уже
        опубликованной: стор не принимает повторную версию
-   [ ] архив пересобран **после** правки версии
-   [ ] распакованный архив ставится в `chrome://extensions` через «Загрузить распакованное»
        и вкладка **ARUI** появляется в DevTools
-   [ ] скриншоты пересняты, если менялась вёрстка

Первая проверка занимает от нескольких дней; расширения с host-правами смотрят внимательнее,
поэтому текст justification лучше не сокращать.

## 5. Обновления

Поднять версию в `package.json`, пересобрать архив, загрузить его в той же карточке
(Package → Upload new package) и отправить на проверку. Обновление у пользователей
прилетает само.

[dashboard]: https://chrome.google.com/webstore/devconsole

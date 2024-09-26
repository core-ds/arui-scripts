# [15.3.0](https://github.com/core-ds/arui-scripts/compare/v15.2.0...v15.3.0) (2023-06-30)

## 17.4.0

### Minor Changes

-   [#266](https://github.com/core-ds/arui-scripts/pull/266) [`cf14904`](https://github.com/core-ds/arui-scripts/commit/cf14904e4a6412a193077ccc6e8e6216eda2e475) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Добавлен механизм работы с конфигурацией для client-only режима

## 17.3.0

### Minor Changes

-   [#262](https://github.com/core-ds/arui-scripts/pull/262) [`a4ea53d`](https://github.com/core-ds/arui-scripts/commit/a4ea53d746983d8dfe32157b4a4472c4f5e1bdaa) Thanks [@dzvyagin](https://github.com/dzvyagin)! - Исправление передачи таргет браузеров в babel-client

## 17.2.1

### Patch Changes

-   [#263](https://github.com/core-ds/arui-scripts/pull/263) [`6b22d44`](https://github.com/core-ds/arui-scripts/commit/6b22d44f6b3e8e6c5a6e2ef7454a5fbff2c5d0e4) Thanks [@kiskv](https://github.com/kiskv)! - Исправлено падение при использовании tsconfig, который не содержит поля compilerOptions

## 17.2.0

### Minor Changes

-   [#249](https://github.com/core-ds/arui-scripts/pull/249) [`8a47674`](https://github.com/core-ds/arui-scripts/commit/8a476744fca2fe1cd5af7d64fe55c28be196af35) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Добавлена возможность сборки coverage с кода при NODE_ENV=cypress или USE_ISTANBUL=enabled. Coverage собирается только при использовании babel

## 17.1.7

### Patch Changes

-   [#237](https://github.com/core-ds/arui-scripts/pull/237) [`cb39b30`](https://github.com/core-ds/arui-scripts/commit/cb39b30baf2440c6a4363752424b25675160f193) Thanks [@reabiliti](https://github.com/reabiliti)! - Фикс бага добавления полифилов при билде проекта, если используется импорт core-js

## 17.1.6

### Patch Changes

-   [#235](https://github.com/core-ds/arui-scripts/pull/235) [`a616a5c`](https://github.com/core-ds/arui-scripts/commit/a616a5cfa8be0ccd6a011401b586965534b4a34a) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Убрана ненужная проверка на наличие файлов, необходимых для сборки. Эта проверка и так будет сделана вебпаком, поэтому сммысла от доп проверки на нашем уровне - нет

## 17.1.5

### Patch Changes

-   [#233](https://github.com/core-ds/arui-scripts/pull/233) [`9398cd6`](https://github.com/core-ds/arui-scripts/commit/9398cd64dcb5b84031142f1d7a40ca46503e82d3) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Исправление команды docker-build: она генерировала некорректный dockerfile,
    из-за чего контейнер не мог запуститься с ошибкой `Cannot find module '/src/start.sh'`

## 17.1.4

### Patch Changes

-   [#231](https://github.com/core-ds/arui-scripts/pull/231) [`36747a6`](https://github.com/core-ds/arui-scripts/commit/36747a6b830a0e3b9ff3ec255b3f9e5cede77ca1) Thanks [@baarsa](https://github.com/baarsa)! - Добавлена трансформация .mjs файлов в конфигурации jest

## 17.1.3

### Patch Changes

-   [#229](https://github.com/core-ds/arui-scripts/pull/229) [`abc994d`](https://github.com/core-ds/arui-scripts/commit/abc994da6977f03fb05c89b3fe0180808d97350c) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Исправлен некорректный CMD в dockerfile который мог приводить к ошибкам при запуске проектов

## 17.1.2

### Patch Changes

-   [#225](https://github.com/core-ds/arui-scripts/pull/225) [`f62c2c8`](https://github.com/core-ds/arui-scripts/commit/f62c2c8255d9667e4f3761708311bf5708dca0fb) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Поправлена загрузка js файлов из mjs кода зависимостей. babel-runtime добавляется не как fully specified path, из-за этого при работе с некоторыми библиотеками могли возникать проблемы

## 17.1.1

### Patch Changes

-   [#223](https://github.com/core-ds/arui-scripts/pull/223) [`028c5d3`](https://github.com/core-ds/arui-scripts/commit/028c5d34f99353e5123b64b6a319428d42aa56bb) Thanks [@qrik116](https://github.com/qrik116)! - Исправлено формирование имени css файлов, с учётом configName

## 17.1.0

### Minor Changes

-   [#221](https://github.com/core-ds/arui-scripts/pull/221) [`4e7843f`](https://github.com/core-ds/arui-scripts/commit/4e7843f4e2ca53e62e9c15c782ab3ec05e9c0d1e) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Добавлен режим clientOnly, позволяющий использовать arui-scripts для сборки проектов, не требующих серверной части

## 17.0.2

### Patch Changes

-   [#219](https://github.com/core-ds/arui-scripts/pull/219) [`bfb77ac`](https://github.com/core-ds/arui-scripts/commit/bfb77ac9bb82171cd341f72ee9dc5c29c3330887) Thanks [@qrik116](https://github.com/qrik116)! - Исправление реализации префиксов для css правил в модулях

## 17.0.1

### Patch Changes

-   [#217](https://github.com/core-ds/arui-scripts/pull/217) [`3ba381a`](https://github.com/core-ds/arui-scripts/commit/3ba381a68370727973bc10a66711adc272394161) Thanks [@qrik116](https://github.com/qrik116)! - Исправление импорта jest настроек в jest-preset, для корректного запуска `node 'node_modules/.bin/jest'`

## 17.0.0

### Major Changes

-   [#209](https://github.com/core-ds/arui-scripts/pull/209) [`4ae24e3`](https://github.com/core-ds/arui-scripts/commit/4ae24e35fd9234c9a819fcaef6dc81f06287d2b1) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Теперь по умолчанию jest будет использовать babel для преобразования ts-кода. Если по какой-то причине это
    вас не устраивает - вы можете использовать настройку `jestUseTsJest`.

-   [#210](https://github.com/core-ds/arui-scripts/pull/210) [`156f551`](https://github.com/core-ds/arui-scripts/commit/156f5514003339470afcae571a1b5b5deed6837a) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - disableDevWebpackTypecheck теперь включён по умолчанию. Это означает что в консоль вашего браузера больше не будут
    попадать ошибки тайпскрипта, так же ошибки больше не будут останавливать дев сборку.

    В дев режиме тайп чекинг будет писать сообщения об ошибках только в stdout процесса сборщика.

    Это позволяет значительно ускорить сборку, особенно в проектах со многими конфигурациями вебпака (десктоп/мобилка, модули и тд).

    Если вы хотите вернуть старое поведение - вы можете это сделать установив настройку `disableDevWebpackTypecheck` в `false`.

-   [#208](https://github.com/core-ds/arui-scripts/pull/208) [`cb515e1`](https://github.com/core-ds/arui-scripts/commit/cb515e1255b8fae812b01d7b965b4a8a2ad416ef) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Флаг useTscLoader помечен как deprecated

### Minor Changes

-   [#213](https://github.com/core-ds/arui-scripts/pull/213) [`6eff863`](https://github.com/core-ds/arui-scripts/commit/6eff863b3ca56b1f77fb16f5c46afccd802621bd) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Улучшен механизм инвалидации кешей вебпака

## 16.1.0

### Minor Changes

-   [#198](https://github.com/core-ds/arui-scripts/pull/198) [`c2d6b5d`](https://github.com/core-ds/arui-scripts/commit/c2d6b5d6a54363f32b2e4f80863e6bd477c42c80) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Добавлен новый вид базовых образов - slim версии уже существовавших.
    В slim версиях отсутствуют многочисленные модули nginx, которые обычно не нужны в проектах.

### Patch Changes

-   [#200](https://github.com/core-ds/arui-scripts/pull/200) [`607bd73`](https://github.com/core-ds/arui-scripts/commit/607bd73504e8ecb72b30c60b9f18784a45dedd98) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump express from 4.18.2 to 4.19.2

-   [#197](https://github.com/core-ds/arui-scripts/pull/197) [`de1f623`](https://github.com/core-ds/arui-scripts/commit/de1f62341986efb075703be7da5cd390473e49a8) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump webpack-dev-middleware from 5.3.3 to 5.3.4

-   [#196](https://github.com/core-ds/arui-scripts/pull/196) [`e497b58`](https://github.com/core-ds/arui-scripts/commit/e497b58f24841b0fb521c9eb3d5b7b884d3b27fc) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump follow-redirects from 1.15.4 to 1.15.6

## 16.0.3

### Patch Changes

-   [#192](https://github.com/core-ds/arui-scripts/pull/192) [`6d65513`](https://github.com/core-ds/arui-scripts/commit/6d655138c2fa5343e89eeee616e512c706f3a9a9) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Исправлена проверка версии докера при запуске опредленных команд. Теперь проверка так же учитывает версию клиентской части докера

## 16.0.2

### Patch Changes

-   [#190](https://github.com/core-ds/arui-scripts/pull/190) [`ce4c92b`](https://github.com/core-ds/arui-scripts/commit/ce4c92b55cb5f5e3410b99f233372b1b90444be5) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Исправлен запуск команды docker-build при использовании докера версии 17-20

## 16.0.1

### Patch Changes

-   [#186](https://github.com/core-ds/arui-scripts/pull/186) [`40318c0`](https://github.com/core-ds/arui-scripts/commit/40318c0089fdeba92bc6bd26ae945d6139c94ca7) Thanks [@dependabot](https://github.com/apps/dependabot)! - Обновление бибилиотеки ip с 2.0.0 до 2.0.1

-   [#187](https://github.com/core-ds/arui-scripts/pull/187) [`eef36d9`](https://github.com/core-ds/arui-scripts/commit/eef36d9eb518f31bad1e787b622c310e41593506) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Исправлена проблема с запуском AruiRuntimeModule на серверной стороне

## 16.0.0

### Major Changes

-   [#179](https://github.com/core-ds/arui-scripts/pull/179) [`2a47b41`](https://github.com/core-ds/arui-scripts/commit/2a47b412cf3937542652d5d105357567cb0bdf21) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Прекращена поддержка nodejs@14.
    Поддерживаемые версии nodejs: `16.20.2, 18.0.0+, 20.0.0+`.

    Базовые образы `alpine-node-nginx` больше не будут публиковаться с тегом `latest`, он остается зафиксированным на версии `14.21.3`.

    Вы можете продолжать использовать `arui-scripts` с nodejs@14, но мы не будем исправлять ошибки, связанные с этой версией nodejs.
    Совместимость peer зависимостей не гарантируется.

-   [#178](https://github.com/core-ds/arui-scripts/pull/178) [`5158f3a`](https://github.com/core-ds/arui-scripts/commit/5158f3a761d5d85ce506353d6a08cd5d15313411) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Обновление списка поддерживаемых браузеров.
    Прекращена поддержка IE11.

    Это влияет как на собираемый js-код, так и на стили.

    При желании вы можете переопределить список поддеживаемых браузеров через оверрайды.

    ```ts
    // arui-scripts.overrides.ts
    import { OverrideFile } from 'arui-scripts';
    const override: OverrideFile = {
        browsers: () => ['last 2 versions', 'not ie < 11'], // или любой другой ваш список
    };

    export default override;
    ```

## 15.11.0

### Minor Changes

-   [#181](https://github.com/core-ds/arui-scripts/pull/181) [`14b9350`](https://github.com/core-ds/arui-scripts/commit/14b9350877e4ba0088245a78bc36037b7b0a11b5) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Обновление версий babel

## 15.10.6

### Patch Changes

-   [#172](https://github.com/core-ds/arui-scripts/pull/172) [`f8960f0`](https://github.com/core-ds/arui-scripts/commit/f8960f09358df76daefa564ec7dd845a6a722e2a) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Исправлено добавление префиксов для некоторых селекторов при использовании compat модулей

## 15.10.5

### Patch Changes

-   [#167](https://github.com/core-ds/arui-scripts/pull/167) [`24327b9`](https://github.com/core-ds/arui-scripts/commit/24327b96d6dc2471809747110f1c9be1cd2e4735) Thanks [@Echzio](https://github.com/Echzio)! - исправление docker-build команды для windows

## 15.10.4

### Patch Changes

-   [#157](https://github.com/core-ds/arui-scripts/pull/157) [`9240320`](https://github.com/core-ds/arui-scripts/commit/92403200dbf5f167155ea33cf3375eea42cda57d) Thanks [@Echzio](https://github.com/Echzio)! - Исправлено поведение команды `docker-build:compiled`, теперь она корректно формирует .dockerignore при билде. Исправление бага #156

## 15.10.3

### Patch Changes

-   [#153](https://github.com/core-ds/arui-scripts/pull/153) [`9ba7186`](https://github.com/core-ds/arui-scripts/commit/9ba71864bf0266b4614b381f4747752a98a7477e) Thanks [@IH8E](https://github.com/IH8E)! - Исправлен адрес для dev-server на ipv4 для корректной работы с node18

## 15.10.2

### Patch Changes

-   [#151](https://github.com/core-ds/arui-scripts/pull/151) [`6beb22b`](https://github.com/core-ds/arui-scripts/commit/6beb22b99305fdd46819494b0c2baf88b41d3281) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Исправлены типы для оверрайдов, теперь prod овверайды так же принимают дополнительные аргументы

## 15.10.1

### Patch Changes

-   [#148](https://github.com/core-ds/arui-scripts/pull/148) [`cd6c8df`](https://github.com/core-ds/arui-scripts/commit/cd6c8df45ed53ca72208ab59ce51960664629edc) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump @babel/traverse from 7.22.10 to 7.23.2

## 15.10.0

### Minor Changes

-   [#142](https://github.com/core-ds/arui-scripts/pull/142) [`473ab9f`](https://github.com/core-ds/arui-scripts/commit/473ab9f0482c740741c7ed7ae6e926d5ae06feca) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Runtime css чанки теперь могут подключаться в определяемую из вне ноду

## 15.9.0

### Minor Changes

-   [#143](https://github.com/core-ds/arui-scripts/pull/143) [`1d94d1f`](https://github.com/core-ds/arui-scripts/commit/1d94d1fd57c1899966624b497c3506e0c818410e) Thanks [@Echzio](https://github.com/Echzio)! - добавление findPlugin хелпера для overrides-файла

## 15.8.2

### Patch Changes

-   [#137](https://github.com/core-ds/arui-scripts/pull/137) [`6aa87a0`](https://github.com/core-ds/arui-scripts/commit/6aa87a046e7307847c55b95ed3bc7ba061b2de41) Thanks [@dependabot](https://github.com/apps/dependabot)! - Обновлен postcss для исправления уязвимостей

## 15.8.1

### Patch Changes

-   [#131](https://github.com/core-ds/arui-scripts/pull/131) [`776b849`](https://github.com/core-ds/arui-scripts/commit/776b849e980470c71c56100f85bd6273a1e508cb) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Исправлена ошибка, не позволявшая задать пресеты через конфиг-файл

## 15.8.0

### Minor Changes

-   [#122](https://github.com/core-ds/arui-scripts/pull/122) [`112b32a`](https://github.com/core-ds/arui-scripts/commit/112b32a5b642d3bd2dd96c24ce3c65c9908b4b03) Thanks [@sanityFair](https://github.com/sanityFair)! - ## Текущая реализация нацелена на снятие лишней нагрузки в режиме разработки при проверки типов.

    #### disableDevWebpackTypecheck=false, команда start:

        1. В конфиге для клиента запускается ForkTsCheckerWebpackPlugin.
        2. В конфигах, сделанных через createSingle - не запускается.

    #### disableDevWebpackTypecheck=false, команда build:

        1. В конфиге для клиента запускается ForkTsCheckerWebpackPlugin.
        2. В конфигах, сделанных через createSingle - не запускается.

    #### disableDevWebpackTypecheck=true, команда start:

        1. Запускается runCompilers c TSC_WATCH_COMMAND.
        2. В вебпаке для клиента и сервера ForkTsCheckerWebpackPlugin не запускается.

    #### disableDevWebpackTypecheck=true, команда build:

        1. В конфиге для клиента запускается ForkTsCheckerWebpackPlugin.
        2. В конфигах, сделанных через createSingle - не запускается.

### Patch Changes

-   [#117](https://github.com/core-ds/arui-scripts/pull/117) [`8b6d9c7`](https://github.com/core-ds/arui-scripts/commit/8b6d9c75e1c466b82cd12edcdca3f8c3f1d56d3f) Thanks [@Echzio](https://github.com/Echzio)! - Добавление findLoader в конфигурацию webpack для override-файла, который будет полезен для поиска и переопределения лоадеров

## 15.7.4

### Patch Changes

-   [#119](https://github.com/core-ds/arui-scripts/pull/119) [`c2c8382`](https://github.com/core-ds/arui-scripts/commit/c2c8382f809432dad79f8c9eae4db999f98a44d2) Thanks [@reme3d2y](https://github.com/reme3d2y)! - Исправлено дублирование css-переменных в дев режиме, оно приводило к замедлению работы devtools.

## 15.7.3

### Patch Changes

-   [#109](https://github.com/core-ds/arui-scripts/pull/109) [`a6d38a3`](https://github.com/core-ds/arui-scripts/commit/a6d38a3db0e9df0e9367395ae863bafd363710ce) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Исправление реализации префиксов для css правил в модулях

## 15.7.2

### Patch Changes

-   [#104](https://github.com/core-ds/arui-scripts/pull/104) [`332b437`](https://github.com/core-ds/arui-scripts/commit/332b437851900d288f6d98f191666d21e5571879) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Исправление обработки color-mod функций в css при использовании keepCssVars: false.
    Исправление для [бага](https://github.com/core-ds/arui-scripts/issues/103).

-   [#105](https://github.com/core-ds/arui-scripts/pull/105) [`d314448`](https://github.com/core-ds/arui-scripts/commit/d3144488d9a93f1d664a1e90f769d0f8b76528b8) Thanks [@vaagnavanesyan](https://github.com/vaagnavanesyan)! - ignore css order to prevent conflicts

## 15.7.1

### Patch Changes

-   [#100](https://github.com/core-ds/arui-scripts/pull/100) [`06f382d`](https://github.com/core-ds/arui-scripts/commit/06f382d4cead2a4a3a9d7d9c3e340230040eb75e) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Исправлена проблема сборки css при использовании keepCssVars: false:
    Теперь все переменные будут удаляться из css.
    Исправление для #97

## 15.7.0

### Minor Changes

-   [#94](https://github.com/core-ds/arui-scripts/pull/94) [`ad23eb0`](https://github.com/core-ds/arui-scripts/commit/ad23eb09e75080a3828f04c9a30a72ea19ddde59) Thanks [@sanityFair](https://github.com/sanityFair)! - ## В данном PR исправлены:

    -   Prototype pollution in webpack loader-utils Critical
    -   Improper Neutralization of Special Elements used in a Command in Shell-quote Critical
    -   json-schema is vulnerable to Prototype Pollution Critical
    -   Prototype Pollution in immer Critical (
    -   Для обновления пришлось вынести в плагины WatchMissingNodeModulesPlugin из react-dev-utils, так как в последней версии его убрали.)
    -   Prototype Pollution in handlebars Critical

## 15.6.2

### Patch Changes

-   [#90](https://github.com/core-ds/arui-scripts/pull/90) [`1169f2d`](https://github.com/core-ds/arui-scripts/commit/1169f2d24e185f07644492054b2e40cc4cd75351) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Correctly add prefix for module css selector when css has nested rules

## 15.6.1

### Patch Changes

-   [#91](https://github.com/core-ds/arui-scripts/pull/91) [`33a1c60`](https://github.com/core-ds/arui-scripts/commit/33a1c60dceae7fa78ede8e073ccb7f57927c07b0) Thanks [@Echzio](https://github.com/Echzio)! - fix docs

-   [#88](https://github.com/core-ds/arui-scripts/pull/88) [`dcb6fd3`](https://github.com/core-ds/arui-scripts/commit/dcb6fd3a69a5877e43ae08e6330c8bbb0a095bb3) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Correctly merge complex settings

## 15.6.0

### Minor Changes

-   [#83](https://github.com/core-ds/arui-scripts/pull/83) [`4123653`](https://github.com/core-ds/arui-scripts/commit/41236530565511eceb86d6a950c338fc386b4848) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Allow to configure proxy through aruiScripts settings

### Patch Changes

-   [#85](https://github.com/core-ds/arui-scripts/pull/85) [`d31109c`](https://github.com/core-ds/arui-scripts/commit/d31109c81a39173918bc17568b792b5fb1df06dc) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Change types for OverrideFunction, it's actually also include application context

## 15.5.3

### Patch Changes

-   [#74](https://github.com/core-ds/arui-scripts/pull/74) [`2827327`](https://github.com/core-ds/arui-scripts/commit/2827327868addc654677c2fd79f6ef8da2f15ce8) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Don't require setup files from jest config

-   [#82](https://github.com/core-ds/arui-scripts/pull/82) [`3617329`](https://github.com/core-ds/arui-scripts/commit/361732947536ea14dab3c6e2f8285d7604f3f7a3) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Add 200 response for OPTIONS request when devServerCors option is enabled

## 15.5.2

### Patch Changes

-   [`eca6d00`](https://github.com/core-ds/arui-scripts/commit/eca6d0094d36f5041a2ad2c29c95e6099219c154) - Fix postcss prefix for modules

## 15.5.1

### Patch Changes

-   [#64](https://github.com/core-ds/arui-scripts/pull/64) [`82b0587`](https://github.com/core-ds/arui-scripts/commit/82b0587b9333193a6eaad3ed29b2d3a32745479c) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Always load custom media variables, remove css vars when keepCssVars set to false

## 15.5.0

### Minor Changes

-   [#56](https://github.com/core-ds/arui-scripts/pull/56) [`1c64198`](https://github.com/core-ds/arui-scripts/commit/1c641989791c4ff1e7a20d05c115f8a1d7817e30) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Add modules support and various tools to work with them correctly.

    Modules provides a way to define reusable piece of code to consume from different applications.
    Additional tooling provides a convenient way to consume this modules in applications.
    Full documentation is available in [separate doc](https://github.com/core-ds/arui-scripts/blob/master/packages/arui-scripts/docs/modules.md).

## 15.4.1

### Patch Changes

-   [#57](https://github.com/core-ds/arui-scripts/pull/57) [`3d35ddc`](https://github.com/core-ds/arui-scripts/commit/3d35ddc84a97a5324bdf8172be972826838148a8) Thanks [@vaagnavanesyan](https://github.com/vaagnavanesyan)! - move imagemin plugins to peer deps

-   [#60](https://github.com/core-ds/arui-scripts/pull/60) [`2b38d23`](https://github.com/core-ds/arui-scripts/commit/2b38d230032dd8f7b1f1adba805d1dc238c74243) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Fix presets loading

## 15.4.0

### Minor Changes

-   [#54](https://github.com/core-ds/arui-scripts/pull/54) [`fdc1307`](https://github.com/core-ds/arui-scripts/commit/fdc13071597d8fc0c011aeba4fa2d5edcf6091d5) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Add helper to build a separate webpack configuration

### Patch Changes

-   [#53](https://github.com/core-ds/arui-scripts/pull/53) [`34c7c76`](https://github.com/core-ds/arui-scripts/commit/34c7c7628ac56dad5df0dff46c11a3c609b75f37) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Work correctly with multiple webpack configuration for client bundles

### Features

-   remove svgo-loader in favor of imagemin ([255c16a](https://github.com/core-ds/arui-scripts/commit/255c16ad07f4e224104d4cf6b521110104f3fa99))
-   use asset modules instead of loaders ([713b57e](https://github.com/core-ds/arui-scripts/commit/713b57ed028046f80711d0f7978fb9e57ceb4d35))
-   **imagemin:** process gif with imagemin ([ecc2045](https://github.com/core-ds/arui-scripts/commit/ecc2045fd19ef29427af2882c3ab257542b8bdcc))
-   **imagemin:** process jpg with imagemin ([afffe97](https://github.com/core-ds/arui-scripts/commit/afffe975338e3c1e201494d1eb7c5138df36cafc))
-   **imagemin:** process png with imagemin ([56ab95b](https://github.com/core-ds/arui-scripts/commit/56ab95b42313bd3620443cc2f66ac6cd6e0dbff5))
-   **imagemin:** process svg with imagemin ([8705c64](https://github.com/core-ds/arui-scripts/commit/8705c6456617eee236f8e9991ffad1d077768843))

# [15.2.0](https://github.com/core-ds/arui-scripts/compare/v15.1.0...v15.2.0) (2023-06-26)

### Features

-   **webpack:** add deduplication plugin ([0c841a7](https://github.com/core-ds/arui-scripts/commit/0c841a795a621fb509154773f659bac4b819535e))

# [15.1.0](https://github.com/core-ds/arui-scripts/compare/v15.0.0...v15.1.0) (2023-06-26)

### Features

-   remove component-testing feature ([2859ab6](https://github.com/core-ds/arui-scripts/commit/2859ab613c5f0bef289fc4ae0768465df9f62d8d))

# [15.0.0](https://github.com/core-ds/arui-scripts/compare/v14.9.0...v15.0.0) (2023-06-19)

-   Merge pull request #38 from core-ds/feat/update-postcss-dependencies ([7598853](https://github.com/core-ds/arui-scripts/commit/75988531368ba5e873d44f75212433cfb4881ff7)), closes [#38](https://github.com/core-ds/arui-scripts/issues/38)
-   parent 1196ca942e0121c033a7673e30d40bb4ab5f4cb5 ([e1ee221](https://github.com/core-ds/arui-scripts/commit/e1ee221a5b5fbb94ced9c457031bce1db8e00cb8)), closes [#32](https://github.com/core-ds/arui-scripts/issues/32) [#32](https://github.com/core-ds/arui-scripts/issues/32)

### Features

-   update posts dependencies ([7e6f548](https://github.com/core-ds/arui-scripts/commit/7e6f548423cd0b52f498d06003052182a3a00899))
-   **webpack:** update posts dependencies ([5dd570c](https://github.com/core-ds/arui-scripts/commit/5dd570cc360a76fc8c4a8822a46a99698fc2e905))

### BREAKING CHANGES

-   The postcss plugins has been updated.
-   **webpack:** The postcss plugins has been updated.
-   The postcss plugins has been updated.
-   The postcss plugins has been updated.

chore(release): 14.9.0 [skip ci]

-   The postcss plugins has been updated.

Update app.module.css

docs(\*): update README.md

# [14.9.0](https://github.com/core-ds/arui-scripts/compare/v14.8.0...v14.9.0) (2023-06-07)

### Features

-   **webpack:** add svgo-loader ([81917c3](https://github.com/core-ds/arui-scripts/commit/81917c3df63e8bce333ff0a688ba113f01ac6318)), closes [#32](https://github.com/core-ds/arui-scripts/issues/32)

# [14.8.0](https://github.com/core-ds/arui-scripts/compare/v14.7.0...v14.8.0) (2023-05-31)

### Features

-   compress wasm with brotli ([c983c4b](https://github.com/core-ds/arui-scripts/commit/c983c4bfa9fcbb36b3cfc1d2c606fff3180c3126))

# [14.7.0](https://github.com/core-ds/arui-scripts/compare/v14.6.0...v14.7.0) (2023-05-31)

### Features

-   compress wasm with gzip ([92827cc](https://github.com/core-ds/arui-scripts/commit/92827ccdd2f44dc24e65c0188c75f843cb2dbaa6))

# [14.6.0](https://github.com/core-ds/arui-scripts/compare/v14.5.1...v14.6.0) (2023-05-24)

### Features

-   **webpack:** ignore momentjs locales ([c585b07](https://github.com/core-ds/arui-scripts/commit/c585b07b8dc646c8d2b63cd1ec153247fd87dc8f))

## [14.5.1](https://github.com/core-ds/arui-scripts/compare/v14.5.0...v14.5.1) (2023-05-18)

### Bug Fixes

-   **docker:** build with older docker version to work correctly with old clients ([b2d4298](https://github.com/core-ds/arui-scripts/commit/b2d429845b1f39ce8495a932e47405d19e820e1b))
-   **docker:** chagne output format for docker build to support older clients ([0055923](https://github.com/core-ds/arui-scripts/commit/0055923428e6cb84096b99b3240678414f382340))

# [14.5.0](https://github.com/core-ds/arui-scripts/compare/v14.4.1...v14.5.0) (2023-05-16)

### Features

-   add new `start:prod` command ([2944887](https://github.com/core-ds/arui-scripts/commit/2944887758527e65fdd0e11ea5bb7e59afa213c1))

## [14.4.1](https://github.com/core-ds/arui-scripts/compare/v14.4.0...v14.4.1) (2023-05-07)

### Bug Fixes

-   **docker:** allow to build x86 images on arm machines ([a115a71](https://github.com/core-ds/arui-scripts/commit/a115a717ef61e076cca3639485d32f9e71218041))

# [14.4.0](https://github.com/core-ds/arui-scripts/compare/v14.3.0...v14.4.0) (2023-05-06)

### Bug Fixes

-   **docker:** missing step ([922f7ae](https://github.com/core-ds/arui-scripts/commit/922f7aeeb085fc77b9501080b65c3f7bffc66ea0))

### Features

-   **docker:** update to latest nginx, alpine and nging-brotli ([322193f](https://github.com/core-ds/arui-scripts/commit/322193fb66bcba885f12c97e2d250ca7c4550e9d))

# [14.3.0](https://github.com/core-ds/arui-scripts/compare/v14.2.1...v14.3.0) (2023-05-06)

### Features

-   **docker:** build more base images ([d4ce47a](https://github.com/core-ds/arui-scripts/commit/d4ce47a9741e95f91070dc54beecc02b4ffeed61))

## [14.2.1](https://github.com/core-ds/arui-scripts/compare/v14.2.0...v14.2.1) (2023-04-26)

### Bug Fixes

-   **webpack.client.ts:** fix [#17](https://github.com/core-ds/arui-scripts/issues/17) ([9d0735e](https://github.com/core-ds/arui-scripts/commit/9d0735e6dfcd81b2c95248114c81732f37972cab))

# [14.2.0](https://github.com/core-ds/arui-scripts/compare/v14.1.3...v14.2.0) (2023-04-12)

### Bug Fixes

-   **webpack.client.ts:** fix [#13](https://github.com/core-ds/arui-scripts/issues/13) ([8338f19](https://github.com/core-ds/arui-scripts/commit/8338f1926fa152e77771d5847690cf4d0728f475))

### Features

-   **arui-scripts-test/package.json:** add NODE_ENV ([bfa565d](https://github.com/core-ds/arui-scripts/commit/bfa565dae3026a94537098c785cd2e10f795bf35))

## [14.1.3](https://github.com/core-ds/arui-scripts/compare/v14.1.2...v14.1.3) (2023-04-10)

### Bug Fixes

-   **webpack.client.ts:** fix core-ds/arui-scripts[#6](https://github.com/core-ds/arui-scripts/issues/6) ([1863022](https://github.com/core-ds/arui-scripts/commit/186302261938acd6fed56a294685d4388cb26a94))

## [14.1.2](https://github.com/core-ds/arui-scripts/compare/v14.1.1...v14.1.2) (2023-04-03)

### Bug Fixes

-   **webpack-client:** add NODE_ENV variable in dev mode ([a5ae943](https://github.com/core-ds/arui-scripts/commit/a5ae9433c37747ce1fd7dd04d90cc566c6bc6136))

## [14.1.1](https://github.com/core-ds/arui-scripts/compare/v14.1.0...v14.1.1) (2023-04-02)

### Bug Fixes

-   **webpack-server:** use dev plugins only in dev mode ([e04b27d](https://github.com/core-ds/arui-scripts/commit/e04b27d6efb7ba3169f8e010ac1ad75fb7a3c8f3))

# [14.1.0](https://github.com/core-ds/arui-scripts/compare/v14.0.0...v14.1.0) (2023-04-02)

### Features

-   **docker-build, docker-build-compiled:** can override start.sh ([a563cf4](https://github.com/core-ds/arui-scripts/commit/a563cf4682a41fe110a680b7c7e6c22b8396dcf9))

# [14.0.0](https://github.com/core-ds/arui-scripts/compare/v13.5.0...v14.0.0) (2023-03-02)

### Features

-   update jest to 28 ([14d1af7](https://github.com/core-ds/arui-scripts/commit/14d1af7c4502e20adaf200716f6ed941784643ef))
-   update minimal ts version to 4.3 ([ce4910a](https://github.com/core-ds/arui-scripts/commit/ce4910afb2efc0cc351e73a07a286afe58f621fd))

### BREAKING CHANGES

-   minimal supported version of ts it now 4.3
-   now we use jest@28

For complete list of breaking changes see https://jestjs.io/docs/28.x/upgrading-to-jest28

# [13.5.0](https://github.com/core-ds/arui-scripts/compare/v13.4.0...v13.5.0) (2023-03-02)

### Features

-   refactor changelog script ([a4b0f34](https://github.com/core-ds/arui-scripts/commit/a4b0f3444fdc2e2593105488059357eaa717d5db))
-   refactor changelog script ([ae54ce8](https://github.com/core-ds/arui-scripts/commit/ae54ce877dea6ec5b3840e6fa366c7ead15bf1bf))

# 13.5.0-feat-NEWCLICKUI-1746.1 (2023-02-28)

### Features

-   added a new command "changelog" ([95d5a34](https://github.com/core-ds/arui-scripts/commit/95d5a34558322108a7f8afab7608491291f4d4aa))
-   **webpack-server:** add serverExternalsExemptions override ([8cb8479](https://github.com/core-ds/arui-scripts/commit/8cb847914632e806725c84d73678bdc88c17534e))

# [13.4.0](https://github.com/core-ds/arui-scripts/compare/v13.3.1...v13.4.0) (2023-02-06)

### Bug Fixes

-   **dockerfile:** reduce image size ([13fc2f8](https://github.com/core-ds/arui-scripts/commit/13fc2f894569db24d362e3aaf13bc9a15f34378f))

### Features

-   **get-defaults.ts:** run from non root by default ([b9130b7](https://github.com/core-ds/arui-scripts/commit/b9130b7c518ad6023fa0d3f8bf6818af7d7e9081))

## [13.3.1](https://github.com/core-ds/arui-scripts/compare/v13.3.0...v13.3.1) (2022-12-13)

### Bug Fixes

-   **docker-build-compiled:** add yarn2 required files before build ([c252535](https://github.com/core-ds/arui-scripts/commit/c2525358e7573e599bbdb20160453cc077f5a083))
-   **docker-build-compiled:** don't override existing .dockerignore ([b0c20c2](https://github.com/core-ds/arui-scripts/commit/b0c20c25792edbb5b73cd2bb36725b214cb4aadd))

# [13.3.0](https://github.com/core-ds/arui-scripts/compare/v13.2.1...v13.3.0) (2022-12-08)

### Bug Fixes

-   **commands:** use correct naming for docker-build:compiled ([26144f9](https://github.com/core-ds/arui-scripts/commit/26144f9a91b94f5c1063fe6e7cfa9c962fca3dbc))
-   **docker-build-compiled:** don't use local dockerfile ([eca88a0](https://github.com/core-ds/arui-scripts/commit/eca88a0efef79fd68c349e5e71add934b2f162c2))

### Features

-   **docker-build-compiled:** ignore node_modules automatically ([35b4955](https://github.com/core-ds/arui-scripts/commit/35b49550e73472eb6d38af1af832708c7f0bc271))

# 13.3.0-feat-fast-docker-build.3 (2022-12-06)

### Bug Fixes

-   **docker-build-fast:** don't remove build directory ([0909182](https://github.com/core-ds/arui-scripts/commit/09091820f10fffc54702ae6572f6c9a716fe0784))

# 13.3.0-feat-fast-docker-build.2 (2022-12-06)

### Features

-   **docker-fast:** don't build anything inside of container ([8f255bd](https://github.com/core-ds/arui-scripts/commit/8f255bd8fb9818a8498bddee71ef83ce4a7ba11b))

# 13.3.0-feat-fast-docker-build.1 (2022-12-05)

### Features

-   **docker:** add fast docker build command ([82301a8](https://github.com/core-ds/arui-scripts/commit/82301a8d912476fd5516f94083ccd7c5363f4509))

## [13.2.1](https://github.com/core-ds/arui-scripts/compare/v13.2.0...v13.2.1) (2022-12-05)

### Bug Fixes

-   **package:** update tar package ([a9fab3d](https://github.com/core-ds/arui-scripts/commit/a9fab3d6c7e4effe2287d068b9d3ee19a325069e))

# [13.2.0](https://github.com/core-ds/arui-scripts/compare/v13.1.3...v13.2.0) (2022-10-24)

### Bug Fixes

-   **config:** move watch ignore path to config ([e13df6f](https://github.com/core-ds/arui-scripts/commit/e13df6f94d5c95d88dbdd1e1d5707f1c7f9f0525))

# 13.2.0-feat-further-speedup.4 (2022-10-21)

### Bug Fixes

-   **babel:** determine babel-runtime version from app ([c5f0533](https://github.com/core-ds/arui-scripts/commit/c5f0533aafc9f248dcfff20cafc986f0fb54c106))

# 13.2.0-feat-further-speedup.3 (2022-10-21)

### Bug Fixes

-   **babel:** update to latest runtime version ([b698ca4](https://github.com/core-ds/arui-scripts/commit/b698ca416f233ec938c639eac37701cef7b95cd2))
-   **dev-server:** allow unsafe-eval script src when using eval-based source maps ([ef31821](https://github.com/core-ds/arui-scripts/commit/ef31821c1b60da27be2bbe4c6bc9ade0e5910ee9))

# 13.2.0-feat-further-speedup.2 (2022-10-21)

### Bug Fixes

-   update babel runtime ([562d988](https://github.com/core-ds/arui-scripts/commit/562d98824af4b78a2593fe25a51855ecd0db93bc))

# 13.2.0-feat-further-speedup.1 (2022-10-21)

### Bug Fixes

-   **babel:** correctly determine babel-runtime version ([4dea00f](https://github.com/core-ds/arui-scripts/commit/4dea00fe98d4ea8a168542abab37ef1998df4808))
-   **dev:** ignore build dir in watch mode ([185d61d](https://github.com/core-ds/arui-scripts/commit/185d61dc180f723f4750f57acc41edfa547f2492))

### Features

-   **webpack:** change default dev source-map mode ([d184d6e](https://github.com/core-ds/arui-scripts/commit/d184d6e614014e0671d224ccb706322c1d284bee))
-   **webpack:** disable webpack 4 compatibility by default ([9cba80d](https://github.com/core-ds/arui-scripts/commit/9cba80d7c990ad84ec7335f096cc422d558f81be))

# 13.2.0-feat-babel-config-update.2 (2022-09-30)

### Bug Fixes

-   **babel:** add core-js as dependency ([e08d8c8](https://github.com/core-ds/arui-scripts/commit/e08d8c801181a5e4eda0ac73024d4685001e3ab7))

# 13.2.0-feat-babel-config-update.1 (2022-09-29)

### Features

-   update babel config, add partial processing of node_modules ([8e2cd71](https://github.com/core-ds/arui-scripts/commit/8e2cd71fa0dbd299555a5872378cfe1dc6507c81))

## [13.1.3](https://github.com/core-ds/arui-scripts/compare/v13.1.2...v13.1.3) (2022-09-26)

### Bug Fixes

-   changed warnings display ([24c341a](https://github.com/core-ds/arui-scripts/commit/24c341ad79b59edb869dc1063657be1b220ac931))

## [13.1.2](https://github.com/core-ds/arui-scripts/compare/v13.1.1...v13.1.2) (2022-09-21)

### Bug Fixes

-   **bundle-analyze:** support multiple client configs ([8c9bc77](https://github.com/core-ds/arui-scripts/commit/8c9bc771d10c1bf038106f7bb83bd582b45394ac))

## [13.1.1](https://github.com/core-ds/arui-scripts/compare/v13.1.0...v13.1.1) (2022-08-05)

## 13.0.1-feat-speadup.1 (2022-08-03)

### Performance Improvements

-   **webpack-dev:** add caching ([ed76817](https://github.com/core-ds/arui-scripts/commit/ed7681710130e6d0716114b11c5b698a15eb4b45))

# [13.1.0](https://github.com/core-ds/arui-scripts/compare/v13.0.0...v13.1.0) (2022-08-05)

# 13.1.0-feature-yarn2.1 (2022-08-04)

### Features

-   add yarn 2 support ([5d4bb8c](https://github.com/core-ds/arui-scripts/commit/5d4bb8c5e4debb3d0db430c094effbedd9b7bcc3))

# [13.0.0](https://github.com/core-ds/arui-scripts/compare/v12.5.0...v13.0.0) (2022-07-11)

### Bug Fixes

-   **server:** disable minimization of server ([30e211b](https://github.com/core-ds/arui-scripts/commit/30e211ba8ae306164c33a262f48444972383e2f7))

### Features

-   **server:** disable source-map support banner by default ([c486695](https://github.com/core-ds/arui-scripts/commit/c486695d30b4fd7c96c891b1920a67db8c47d854))

### BREAKING CHANGES

-   **server:** source-map-support banner is no longer added by default
    source-map-support significantly slow down code, especially if you use exceptions. In case you still need it you can use `installServerSourceMaps` option

# [12.5.0](https://github.com/core-ds/arui-scripts/compare/v12.4.1...v12.5.0) (2022-06-30)

### Bug Fixes

-   **start.template.ts:** added condition for max_total_memory ([84e1462](https://github.com/core-ds/arui-scripts/commit/84e14623c452b8edde662c54974c1e4f168625e9))

## [12.4.1](https://github.com/core-ds/arui-scripts/compare/v12.4.0...v12.4.1) (2022-06-07)

### Bug Fixes

-   **ts-config:** ignore local tsconfigs for ts-node ([0235ade](https://github.com/core-ds/arui-scripts/commit/0235ade62cbf9d14ac55f7c518ca170fdc7d364e))
-   **ts-configs:** disable processing of js files with ts-node ([edbb9d2](https://github.com/core-ds/arui-scripts/commit/edbb9d2d23ba1c0f7950fedf5fff394b695c6cd5))

# [12.4.0](https://github.com/core-ds/arui-scripts/compare/v12.3.0...v12.4.0) (2022-05-25)

### Features

-   add removeDevDependenciesDuringDockerBuild setting ([51f016f](https://github.com/core-ds/arui-scripts/commit/51f016f3aad3e2e5e489659d0b26e6005cacdafe))

# [12.3.0](https://github.com/core-ds/arui-scripts/compare/v12.2.0...v12.3.0) (2022-04-18)

### Bug Fixes

-   changes after code review ([439fbda](https://github.com/core-ds/arui-scripts/commit/439fbda458fa369f20d41d6e77d8b3b3906af4bf))
-   **package.json:** up peerDependencies ([7ff5c69](https://github.com/core-ds/arui-scripts/commit/7ff5c69ade098078e4f3980ddb2f66c3a79c2a1b))
-   **webpack-dev:** disable default override of NODE_ENV ([49b1464](https://github.com/core-ds/arui-scripts/commit/49b1464d2574514374aec223c5fde3fed025c93a))
-   **webpack:** restore css minimization in dev ([84c404e](https://github.com/core-ds/arui-scripts/commit/84c404e82e8afe9b6ac7c1d9dfbf5cd50d47e9d2))
-   **yarn.lock:** up ([3496603](https://github.com/core-ds/arui-scripts/commit/3496603b59984c90b1cece92c647b926f5743375))

### Features

-   add support for ts override files ([d36b5da](https://github.com/core-ds/arui-scripts/commit/d36b5dac0ac73dc580cc0a22c47438d6136e6b9e))
-   allow using config files instead of package config ([5063d23](https://github.com/core-ds/arui-scripts/commit/5063d23abc1a13b503c73b0906d68aaa57840a74))
-   **alpine-node-nginx:** bump default node version to 14.17.6 ([2a19101](https://github.com/core-ds/arui-scripts/commit/2a19101e9a745050c4b10922b366c149f84aa1c6))
-   **alpine-node-nginx:** switch to docker-node base image ([ffdc236](https://github.com/core-ds/arui-scripts/commit/ffdc2369d4e29d4272427b030e605b39c7541073))
-   **alpine-node-nginx:** update brotli to v1.0.9 ([0c6b0a0](https://github.com/core-ds/arui-scripts/commit/0c6b0a0eadd5a314a7dc2f616dc5a33e5e574a7f))
-   webpack updated to 5 version ([d1b361b](https://github.com/core-ds/arui-scripts/commit/d1b361b2d29c0a4841b04f3bfaf27fed3d6b67d2))
-   **webpack-client:** add stats file generation ([f6301da](https://github.com/core-ds/arui-scripts/commit/f6301da5ebf6f7975a1b810c904cafd9c1d3f8f8))

### BREAKING CHANGES

-   overrides will probably be broken

# 11.8.0-feat-webpack5.7 (2021-10-26)

### Bug Fixes

-   **start/client:** added \n ([8ba993e](https://github.com/core-ds/arui-scripts/commit/8ba993e2523b230fa7c411fa2351884afe189d98))

# 11.8.0-feat-webpack5.6 (2021-10-26)

### Bug Fixes

-   **start/client:** remove \n ([216e619](https://github.com/core-ds/arui-scripts/commit/216e61998d507498a1976c50d1ece2d9f840fbb3))

# 11.8.0-feat-webpack5.5 (2021-10-26)

### Features

-   **commands/start:** added spawn ([289fdd5](https://github.com/core-ds/arui-scripts/commit/289fdd5d804d68ec8bb9d77ef5f384705590bbec))

# 11.8.0-feat-webpack5.4 (2021-10-22)

### Bug Fixes

-   **configs/dev-server:** added liveReload: false ([b8a62c0](https://github.com/core-ds/arui-scripts/commit/b8a62c04cef6178ece302636fcc12cf6c0256c49))

# 11.8.0-feat-webpack5.3 (2021-10-21)

### Bug Fixes

-   **configs/webpack.client.dev:** changed sockIntegration for ReactRefreshWebpackPlugin ([dffc5db](https://github.com/core-ds/arui-scripts/commit/dffc5dbd258e1572f54d82049996673b7d32fb25))

# 11.8.0-feat-webpack5.2 (2021-10-21)

### Bug Fixes

-   **test:** added new line ([117aa8d](https://github.com/core-ds/arui-scripts/commit/117aa8d33e28f08b2e720b258be52efd66020d21))

# 11.8.0-feat-webpack5.1 (2021-10-20)

### Features

-   **react-refresh-webpack-plugin:** use for hot reload ([6c36686](https://github.com/core-ds/arui-scripts/commit/6c36686a00666939d32d0ef8c0be25982fe38953))

# 11.3.0-feat-webpack5.1 (2021-05-28)

### Bug Fixes

-   **build:** in webpack5 maybe undefined message ([d942899](https://github.com/core-ds/arui-scripts/commit/d94289960a761d8543949f3596c6d689fe8a9fc4))
-   **package.json:** add terser-webpack-plugin ([520c3f3](https://github.com/core-ds/arui-scripts/commit/520c3f3637d43a887878472815cb31d7a5df56d9))
-   **webpack.client.dev:** undefined process ([176e180](https://github.com/core-ds/arui-scripts/commit/176e180d1ac26db678c98c250bc5e648d22abb86))
-   **yarn.lock:** retry ([8e91803](https://github.com/core-ds/arui-scripts/commit/8e91803f315996eb6e0b5c534747ce24770aca5c))
-   **yarn.lock:** udpate checksum fsevents ([3a47287](https://github.com/core-ds/arui-scripts/commit/3a4728780f3c872bc4835800662d2f10272e5ae2))
-   **yarn.lock:** update ([50659c6](https://github.com/core-ds/arui-scripts/commit/50659c65ee84997cefa0168ef6912ace826252c6))

### Features

-   **css-minimizer-plugin:** add ([204c743](https://github.com/core-ds/arui-scripts/commit/204c743b6910d8ca75e60d3163f45f98fe615905))
-   **webpack-dev-server:** update ([33fa3fc](https://github.com/core-ds/arui-scripts/commit/33fa3fc881951836ee636b9efb91b2ba465bbce2))

# 10.6.0-feature-webpack-5.5 (2021-03-23)

### Bug Fixes

-   **dev-server:** set endline ([1dc6476](https://github.com/core-ds/arui-scripts/commit/1dc64766ed2b9b63921209e18994b1f980fd444f))

# 10.6.0-feature-webpack-5.4 (2021-03-23)

### Bug Fixes

-   **configs:** node_env ([18eabca](https://github.com/core-ds/arui-scripts/commit/18eabca69563a1038ac62725f4366f0350b09b3a))

# 10.6.0-feature-webpack-5.3 (2021-03-22)

### Features

-   **package.json:** update libs ([e7df2e7](https://github.com/core-ds/arui-scripts/commit/e7df2e77bef2b833e0fc0c6a9eac1edf64f92cdb))

# 10.6.0-feature-webpack-5.2 (2021-02-25)

### Features

-   **webpack-dev-server:** update ([3e1590b](https://github.com/core-ds/arui-scripts/commit/3e1590babea2ad2f4f5a0ecc8370648309daefaf))

# 10.6.0-feature-webpack-5.1 (2021-02-25)

### Features

-   clean code & add pnp-plugin ([899d4b7](https://github.com/core-ds/arui-scripts/commit/899d4b714c06fbbc0faab86579080cfde2e1726c))

# 10.6.0-feat-webpack-5-with-yarn-2.2 (2021-02-24)

### Features

-   **webpack.client.dev:** add webpack-dev-server to entry ([b3a8bf4](https://github.com/core-ds/arui-scripts/commit/b3a8bf48d2d234e369756b2476decf3629bafe2c))
-   **webpack.client.dev:** update plugins ([77c14d8](https://github.com/core-ds/arui-scripts/commit/77c14d8b5a99cf8e8d4d43e2d9d0b8534194d87c))

# 10.5.0-feat-webpack-5-with-yarn-2.4 (2021-02-21)

### Features

-   client webpack plugins ([5f3d5fe](https://github.com/core-ds/arui-scripts/commit/5f3d5fe077f797f7826e233d16c3b368080854f2))

# 10.5.0-feat-webpack-5-with-yarn-2.3 (2021-02-20)

### Features

-   add pnp plugin and remove hmr ([40ec248](https://github.com/core-ds/arui-scripts/commit/40ec248acfdafce63b16093d7af0c1ef63897370))

# 10.5.0-feat-webpack-5-with-yarn-2.2 (2021-02-20)

### Features

-   **yarn:** install packages from sources ([0fe186b](https://github.com/core-ds/arui-scripts/commit/0fe186b31109c9df53b5586c920efab2fefe0d80))

# 10.5.0-feat-webpack-5-with-yarn-2.1 (2021-02-19)

### Bug Fixes

-   **configs:** rename newclick-composite-components in nodeExternals whitelist ([0256e6a](https://github.com/core-ds/arui-scripts/commit/0256e6a6ade69d0456c992b526c492b57ce00d28))
-   **hmr:** use run-script-webpack-plugin ([ef1c3bc](https://github.com/core-ds/arui-scripts/commit/ef1c3bc6f62b260af5582a20a70169355069d3a3))
-   **nginx:** disable server tokens globaly ([c6bd588](https://github.com/core-ds/arui-scripts/commit/c6bd588a4bd373a9f3aba67f0b8b50faf2c77d74))
-   **nginx:** keep nginx special vars in place when using envsubst ([623b84f](https://github.com/core-ds/arui-scripts/commit/623b84f5242b4ab6875ecbb88ef8290f3be5e7b4))
-   **overrides:** remove unnecessary `hasOverrides` check ([c339adf](https://github.com/core-ds/arui-scripts/commit/c339adf33b9b368f99aad8607becb2e2b24ebc3a))
-   **start.sh:** correctly build nginx conf ([6a29d96](https://github.com/core-ds/arui-scripts/commit/6a29d9684f6015e24b50c4a2ab7239950660a5ff))
-   **start.sh:** replace all nginx variables in line ([70a90df](https://github.com/core-ds/arui-scripts/commit/70a90df9ba482417b80f05fd818508acbf014efc))
-   support custom start folder ([7700b8b](https://github.com/core-ds/arui-scripts/commit/7700b8b6eb85e247579be717104ca1320db21e5c))

### Features

-   **css-vars:** remove polyfill, set keepCssVars=false by default ([79b603a](https://github.com/core-ds/arui-scripts/commit/79b603a9590459b260910f03b3d3cc60cad2e46b))
-   **nginx:** add envsubst for nginx config ([0697a6f](https://github.com/core-ds/arui-scripts/commit/0697a6fb8f28c1c85698d257a2ac355bc4f27187))
-   **nginx:** add original host to nginx template ([d831503](https://github.com/core-ds/arui-scripts/commit/d831503e582f969e17c99260669ec145eab79e8d))
-   **overrides:** add nginx, dockerfile and start.sh overrides ([114f11b](https://github.com/core-ds/arui-scripts/commit/114f11b5aa74df2a3f5db1404b4d1f7ae9078faa))
-   **overrides:** pass app configs to override functions ([4b64c29](https://github.com/core-ds/arui-scripts/commit/4b64c2949952f173515adcffac1af7ac01ad856d))
-   update node version to 14.16.1 ([3329e5f](https://github.com/core-ds/arui-scripts/commit/3329e5fa8b693ca71e2dd625d44eab88ca000d90))
-   **webpack:** update ([d3d7a22](https://github.com/core-ds/arui-scripts/commit/d3d7a2274d2d2c8985d3f3548a913f1fc0f84c48))

# 11.2.0-feat-presets.1 (2021-05-05)

### Bug Fixes

-   **css-vars:** add polyfill for ie11 when using css vars ([7a045dc](https://github.com/core-ds/arui-scripts/commit/7a045dcec8f10febaf88ed7293098c71532ecad3))
-   **nodejs:** allow to use more memory on constrained environments ([0111531](https://github.com/core-ds/arui-scripts/commit/011153185fe92b3bda5e3df45111e6f7638acb2a))

### Features

-   **config:** add presets support ([1ecd788](https://github.com/core-ds/arui-scripts/commit/1ecd7880c709a56609291c1fffc2cce7fb5c4b1e)), closes [#173](https://github.com/core-ds/arui-scripts/issues/173)
-   **configs:** update css breakpoints to px ([07b239b](https://github.com/core-ds/arui-scripts/commit/07b239b19fe503c7299774dfbd4587b6f6aa2388))
-   **configs:** update postcss-custom-media plugin, move breakpoints to file ([0dacfd5](https://github.com/core-ds/arui-scripts/commit/0dacfd504c54fb867bb872a47832b231c7fc32ec))
-   **nginx:** hide server version from headers and error pages ([ff2c2f7](https://github.com/core-ds/arui-scripts/commit/ff2c2f70b01e67f675fcaf32a27057593bef72bb))
-   update jest dependencies ([c20a933](https://github.com/core-ds/arui-scripts/commit/c20a9339e82d46e23d1802d9180d42d627fc432d))
-   update node version to 12.20.1 ([07f6bed](https://github.com/core-ds/arui-scripts/commit/07f6bedd2485f84fbc37af33de1d234052c0b838))
-   upgrade minimal nodejs version ([6e9df76](https://github.com/core-ds/arui-scripts/commit/6e9df768505314ccff6451a00cb5d869f05df457))

### BREAKING CHANGES

-   Drop support for node 10. Only nodejs >= 12.0 is now supported

# [10.2.0](https://github.com/core-ds/arui-scripts/compare/v10.1.4...v10.2.0) (2021-01-20)

## [10.1.4](https://github.com/core-ds/arui-scripts/compare/v10.1.3...v10.1.4) (2021-01-15)

### Bug Fixes

-   fix folder error ([eb5faa1](https://github.com/core-ds/arui-scripts/commit/eb5faa1a8221d09b75de477db2c8754ba909d881))

## [10.1.3](https://github.com/core-ds/arui-scripts/compare/v10.1.2...v10.1.3) (2020-12-18)

### Bug Fixes

-   **dev-server:** fix wrong path and url comparison on windows ([d488311](https://github.com/core-ds/arui-scripts/commit/d488311d88343647d19f65daa2364dcb9fb7035c))

## [10.1.2](https://github.com/core-ds/arui-scripts/compare/v10.1.1...v10.1.2) (2020-12-17)

### Bug Fixes

-   **nginx:** always use only ipv4 host ([fe73d1c](https://github.com/core-ds/arui-scripts/commit/fe73d1c41d3f14afdc41c137b760a253eaea2755))

## [10.1.1](https://github.com/core-ds/arui-scripts/compare/v10.1.0...v10.1.1) (2020-11-30)

### Bug Fixes

-   **tsconfig:** formatting fix ([32b2248](https://github.com/core-ds/arui-scripts/commit/32b22485197a90bb004deb7d5dedd14f2b89dc10))
-   **tsconfig:** separate build config from published config ([a55051d](https://github.com/core-ds/arui-scripts/commit/a55051d06f2ee8df86a6c78ebee5d13dba2a713c))

# [10.1.0](https://github.com/core-ds/arui-scripts/compare/v10.0.1...v10.1.0) (2020-11-10)

### Features

-   **webpack-client:** use svg-url-loader for svg ([638d601](https://github.com/core-ds/arui-scripts/commit/638d6015b1c49863468a0599609e3e107d08bc2d))

## [10.0.1](https://github.com/core-ds/arui-scripts/compare/v10.0.0...v10.0.1) (2020-11-09)

### Bug Fixes

-   **alpine-node:** push docker image on commit ([7e8c286](https://github.com/core-ds/arui-scripts/commit/7e8c286a8f038dee5c5f6f020e5f3dc7c9a193d6))
-   **webpack-dev:** add public path, so images loads correctly in dev mode ([e5c8a16](https://github.com/core-ds/arui-scripts/commit/e5c8a1640d674324ef835a68b76b251cd8772575))
-   **webpack-server:** add date-fns to externals, so it won't conflict with arui-feather date-fns ([131e9b2](https://github.com/core-ds/arui-scripts/commit/131e9b2d17804f6af378bb3c8adfbbd36ec4a8ee))

# [10.0.0](https://github.com/core-ds/arui-scripts/compare/v9.7.0...v10.0.0) (2020-10-26)

### Bug Fixes

-   **alpine-node-nginx:** fix gpg errors ([33e6f72](https://github.com/core-ds/arui-scripts/commit/33e6f722b6dee26a0e66dcc979e05729f1927b79))
-   **dependencies:** ts as peer dependency ([438c7e7](https://github.com/core-ds/arui-scripts/commit/438c7e76023ab4e65bc67c0efa95a50da78f8395))
-   **get-entry:** remove console.log ([39d735d](https://github.com/core-ds/arui-scripts/commit/39d735db9b3709248ae3b8c7083541ac0c2187c6))
-   **jest:** correctly resolve path to all file mappers ([fcc34f9](https://github.com/core-ds/arui-scripts/commit/fcc34f99cca471c34b85c2b7dab4d838430770ca))
-   replace remaining require with imports ([094d6c2](https://github.com/core-ds/arui-scripts/commit/094d6c24f80a3d4fb9d6e72629f6505a3b307904))
-   **ts-node:** configure it from single place ([e68eda5](https://github.com/core-ds/arui-scripts/commit/e68eda5058b694497af69978410c29541d541b0b))
-   **webpack-server:** fix node-externals in workspaces ([c283ae0](https://github.com/core-ds/arui-scripts/commit/c283ae0c9dface9e99a501f544a9ffc16ed2c22c))
-   **yarn:** fix ci configs ([b4d1162](https://github.com/core-ds/arui-scripts/commit/b4d1162c92febf6167edcb83c81f6e884f71d092))

### Features

-   **alpine-node-nginx:** add docker build workflow ([2d95808](https://github.com/core-ds/arui-scripts/commit/2d958084feac5ba52b5d269eb90ed946f87eb7ba))
-   **alpine-node-nginx:** read version from version file ([dce6105](https://github.com/core-ds/arui-scripts/commit/dce6105a5a189c009947d4cddc947ce35ed555c6))
-   ts in all webpack configs ([e051e29](https://github.com/core-ds/arui-scripts/commit/e051e293a73c837d8d0cc53f32e262f0883a8d87))
-   yarn 2 support ([73bef4f](https://github.com/core-ds/arui-scripts/commit/73bef4f711c9b3c446665d38994447cdd896577e))

# [9.7.0](https://github.com/core-ds/arui-scripts/compare/v9.6.0...v9.7.0) (2020-10-22)

### Features

-   **webpack:** split dynamic import from node_modules to chunk ([ba6a286](https://github.com/core-ds/arui-scripts/commit/ba6a286f3cd827854e98e047fea979c3fcdf82e7))

# [9.6.0](https://github.com/core-ds/arui-scripts/compare/v9.5.0...v9.6.0) (2020-10-08)

### Features

-   **postcss-config:** add keepCssVars, revert plugin ([2d8a0d6](https://github.com/core-ds/arui-scripts/commit/2d8a0d6bd288e0fe880975155d21145c9eb9b374))

# [9.5.0](https://github.com/core-ds/arui-scripts/compare/v9.4.1...v9.5.0) (2020-09-22)

### Features

-   **webpack:** replace style tags with optimized css bundle in dev ([22681f2](https://github.com/core-ds/arui-scripts/commit/22681f2c3e89de7c2c27d9fca286ecd69aad01cc))

## [9.4.1](https://github.com/core-ds/arui-scripts/compare/v9.4.0...v9.4.1) (2020-09-11)

### Features

-   **postcss-config:** add postcss-color-mod-function ([a619453](https://github.com/core-ds/arui-scripts/commit/a61945301ef4290e2e93d6e47a2be1527b6df5ff))

# [9.4.0](https://github.com/core-ds/arui-scripts/compare/v9.3.2...v9.4.0) (2020-08-19)

### Bug Fixes

-   **check-required-files:** skip empty files from config ([34701c5](https://github.com/core-ds/arui-scripts/commit/34701c5d0387cc586c9d7b1962ba37a619d93996))

### Features

-   **webpack:** add support for multiple entrypoints ([508c5c1](https://github.com/core-ds/arui-scripts/commit/508c5c1349979772dded3f422e4ed7c392692dad))

## [9.3.2](https://github.com/core-ds/arui-scripts/compare/v9.3.1...v9.3.2) (2020-08-18)

### Features

-   **supporting-browsers:** add supporting-browsers to overrides ([2671fd5](https://github.com/core-ds/arui-scripts/commit/2671fd500ff090ef5a75b924b418f2867509c005))

## [9.3.1](https://github.com/core-ds/arui-scripts/compare/v9.3.0...v9.3.1) (2020-07-28)

# [9.3.0](https://github.com/core-ds/arui-scripts/compare/v9.2.0...v9.3.0) (2020-07-03)

### Bug Fixes

-   **assets-size:** use brotli-size as optional dependency ([144980b](https://github.com/core-ds/arui-scripts/commit/144980bb0b1b31508b64622101b8f90a184aa62d))
-   **config:** add theme setting and change to eng ([1befdf6](https://github.com/core-ds/arui-scripts/commit/1befdf652b9340bcdcf8559632b41c954eaf5272))
-   **deps:** update @alfalab/postcss-custom-properties ([24078ba](https://github.com/core-ds/arui-scripts/commit/24078ba2dbd66c583e607fd7fcdaef304b3aab95))
-   **tests:** remove unused flag ([328bab6](https://github.com/core-ds/arui-scripts/commit/328bab63d816bf13bbfb3fe2ca726fb673eef132))
-   **tsconfig:** disable removeComments flag ([30cc24e](https://github.com/core-ds/arui-scripts/commit/30cc24e2a33559875e291574a40b2e1a83e9058b)), closes [#117](https://github.com/core-ds/arui-scripts/issues/117)
-   **webpack-server:** source-map-support is now optional ([7996d82](https://github.com/core-ds/arui-scripts/commit/7996d827359d70e17a711e5ae60a941519b51ed2)), closes [#43](https://github.com/core-ds/arui-scripts/issues/43)

### Features

-   **assets-size:** print brotli size when possible ([d744fa4](https://github.com/core-ds/arui-scripts/commit/d744fa436f193508ad078d3529f7c3a8bdfee65c)), closes [#114](https://github.com/core-ds/arui-scripts/issues/114)
-   **config:** check passed settings ([7653a90](https://github.com/core-ds/arui-scripts/commit/7653a907122a1eba0ee503ff564f77b671b02f97))
-   **webpack:** add bundle-analyze command ([705d87e](https://github.com/core-ds/arui-scripts/commit/705d87e69efca87b4e0f80e8fe1ea80b15344812)), closes [#115](https://github.com/core-ds/arui-scripts/issues/115)

# [9.2.0](https://github.com/core-ds/arui-scripts/compare/v9.1.0...v9.2.0) (2020-06-15)

### Bug Fixes

-   **client:** disable brotli on node < 10 ([fc274f9](https://github.com/core-ds/arui-scripts/commit/fc274f916302aad1b9bd3a6e5eeaa85273bb18c3))

### Features

-   **client:** add brotli support ([062e42c](https://github.com/core-ds/arui-scripts/commit/062e42c973fa284dcb3914f35014d919b69c6412))

# [9.1.0](https://github.com/core-ds/arui-scripts/compare/v9.0.4...v9.1.0) (2020-06-03)

### Bug Fixes

-   **postcss.config.js:** add docs, export theme setting from app-configs ([7a367c4](https://github.com/core-ds/arui-scripts/commit/7a367c4f5076ab14cd3dc409ae27eb49a283112a))
-   **postcss.config.js:** fix and simplify theme setting ([bed0cab](https://github.com/core-ds/arui-scripts/commit/bed0cab30fa266584bd85cb24274fced4729c369))

## [9.0.4](https://github.com/core-ds/arui-scripts/compare/v9.0.3...v9.0.4) (2020-06-02)

### Bug Fixes

-   **tsconfig:** allow import json modules ([45e5c07](https://github.com/core-ds/arui-scripts/commit/45e5c07ed7f8038767b34fb9ef6afe5221c222fd))

### Features

-   **docker-build:** fetch registry from args ([79bac18](https://github.com/core-ds/arui-scripts/commit/79bac18070cf3e754b622163f0daa970b4eddc20))

## [9.0.3](https://github.com/core-ds/arui-scripts/compare/v9.0.2...v9.0.3) (2020-05-25)

## [9.0.2](https://github.com/core-ds/arui-scripts/compare/v9.0.1...v9.0.2) (2020-05-19)

### Features

-   add newclick-composite-components to whitelist ([ff6c1f8](https://github.com/core-ds/arui-scripts/commit/ff6c1f8099b8b7f725d3944d063d5d7a83ba96e0))

## [9.0.1](https://github.com/core-ds/arui-scripts/compare/v9.0.0...v9.0.1) (2020-04-27)

### Bug Fixes

-   **webpack-client:** work with array-style webpack configs correctly ([6f8c912](https://github.com/core-ds/arui-scripts/commit/6f8c912981456d57003f7912dbd34acc0920ab5f))

# [9.0.0](https://github.com/core-ds/arui-scripts/compare/v8.5.1...v9.0.0) (2020-04-20)

### Features

-   **config:** use node 12 as default base image ([cc8ef06](https://github.com/core-ds/arui-scripts/commit/cc8ef06e914abc9ba14599c71ab31e74a7a30ae9))

## [8.5.1](https://github.com/core-ds/arui-scripts/compare/v8.5.0...v8.5.1) (2020-04-16)

### Features

-   css vars theming ([1c8029b](https://github.com/core-ds/arui-scripts/commit/1c8029b76133776cfb2094afa83680ba20671c7b))

# [8.5.0](https://github.com/core-ds/arui-scripts/compare/v8.4.0...v8.5.0) (2020-04-01)

# [8.4.0](https://github.com/core-ds/arui-scripts/compare/v8.3.4...v8.4.0) (2020-03-23)

### Bug Fixes

-   update babel version ([5f7d508](https://github.com/core-ds/arui-scripts/commit/5f7d50877f935ae5d89da2407929f1308854593b))

### Features

-   **conf:** disable allowJs rule ([49cfc56](https://github.com/core-ds/arui-scripts/commit/49cfc56c32b03ccf851d8476311e3cabc9d7d547))

## [8.3.4](https://github.com/core-ds/arui-scripts/compare/v8.3.3...v8.3.4) (2020-03-06)

## [8.3.3](https://github.com/core-ds/arui-scripts/compare/v8.3.2...v8.3.3) (2020-03-06)

### Bug Fixes

-   remove bad tests ([81cb375](https://github.com/core-ds/arui-scripts/commit/81cb375e6fe9acb5e5054c5db6f7f24e03fda8b6))
-   restore utils ([0434106](https://github.com/core-ds/arui-scripts/commit/043410691e3bc76d8ee987ec7e55a624cb46c33e))
-   **tests:** textRegex path ([9ed4589](https://github.com/core-ds/arui-scripts/commit/9ed4589fcea2a39a9ac85932d270115de454b844))

## [8.3.2](https://github.com/core-ds/arui-scripts/compare/v8.3.1...v8.3.2) (2020-03-04)

### Bug Fixes

-   **nginx.conf.template:** updated rule for request's max body size ([5364789](https://github.com/core-ds/arui-scripts/commit/536478978fc3dec3c80bf05a598e1296fa2f806a))

## [8.3.1](https://github.com/core-ds/arui-scripts/compare/v8.3.0...v8.3.1) (2020-03-04)

### Features

-   add .editorconfig ([c0238d4](https://github.com/core-ds/arui-scripts/commit/c0238d4beaeffb61634327efb53a30ab18ba40ef))
-   change some rules in .editorconfig ([cae471b](https://github.com/core-ds/arui-scripts/commit/cae471b79f3f576b9764b936d2841c4681521e29))
-   update @babel/preset-env, remove usless deps ([10b9993](https://github.com/core-ds/arui-scripts/commit/10b9993e53121f4296bc451367564963d28e577b))
-   update yarn.lock ([889fbf0](https://github.com/core-ds/arui-scripts/commit/889fbf04890c250a6c8b50fe1cc7a600bfe27db2))

# [8.3.0](https://github.com/core-ds/arui-scripts/compare/v8.2.6...v8.3.0) (2020-02-11)

## [8.2.6](https://github.com/core-ds/arui-scripts/compare/v8.2.5...v8.2.6) (2020-02-05)

### Bug Fixes

-   hotfix, according latest webpack dev server docs ([268a6fc](https://github.com/core-ds/arui-scripts/commit/268a6fc2bedc45ee7557da78c2bf41feef52cca9))

## [8.2.5](https://github.com/core-ds/arui-scripts/compare/v8.2.4...v8.2.5) (2020-02-05)

## [8.2.4](https://github.com/core-ds/arui-scripts/compare/v8.2.3...v8.2.4) (2020-02-05)

### Features

-   use react dev utils for css modules ([35c4329](https://github.com/core-ds/arui-scripts/commit/35c432915d280cdd2616212b125dafbf04744398))

## [8.2.3](https://github.com/core-ds/arui-scripts/compare/v8.2.2...v8.2.3) (2020-02-02)

### Bug Fixes

-   fix regexp to exclude test files outside of src dir ([8a8729b](https://github.com/core-ds/arui-scripts/commit/8a8729bad9fc9ebf3897e96dc00a95bf3f8b7ee7))

## [8.2.2](https://github.com/core-ds/arui-scripts/compare/v8.2.1...v8.2.2) (2020-01-28)

### Bug Fixes

-   remove invalid option ([1de8fae](https://github.com/core-ds/arui-scripts/commit/1de8faefe66bb219b2537a4b1e15f44106bb784a))
-   up css loader ([32dec5e](https://github.com/core-ds/arui-scripts/commit/32dec5e49f363c34550bb16e9c7e099fb0d3246c))

## [8.2.1](https://github.com/core-ds/arui-scripts/compare/v8.2.0...v8.2.1) (2020-01-17)

### Bug Fixes

-   **jest-config:** fix test files regexp ([d208b34](https://github.com/core-ds/arui-scripts/commit/d208b34a86f54c569548ed9b0172a82eb6726f80))

# [8.2.0](https://github.com/core-ds/arui-scripts/compare/v8.0.0...v8.2.0) (2020-01-16)

### Bug Fixes

-   **config:** change assets RegExp in proxy ([3321833](https://github.com/core-ds/arui-scripts/commit/3321833ad774244d4b759dd91e3b982e2f25de6d))
-   **config:** use publicPath config property for assets path ([61f7a83](https://github.com/core-ds/arui-scripts/commit/61f7a83d0a262582848d0b7075fea92c184c78d5))
-   **dev-server:** make correct method startWith -> startsWith ([cf91a62](https://github.com/core-ds/arui-scripts/commit/cf91a62e3401385bb621646f61ba95c83fe5e6a3))

### Features

-   **babel:** add optional chaining and nullish coalescing support ([8fa3211](https://github.com/core-ds/arui-scripts/commit/8fa32114378cba1243564e7121904f4d55cfb884))
-   **ci:** add yarn cache ([17ff911](https://github.com/core-ds/arui-scripts/commit/17ff911c3fabdec755bfc98575f4bb9c159e0f69))
-   **jest:** dynamic pass paths from tsconfig for aliases ([cfaed8f](https://github.com/core-ds/arui-scripts/commit/cfaed8f28f5aec2fbb8c65af24230a42897c008a))
-   **jest:** make more correct title for some variables ([28766c6](https://github.com/core-ds/arui-scripts/commit/28766c6ff174abaa3e35bb1aaafb7e9004aa1efe))

# [8.0.0](https://github.com/core-ds/arui-scripts/compare/v7.0.0...v8.0.0) (2019-12-24)

### Bug Fixes

-   changed commitlint settings ([50a6a39](https://github.com/core-ds/arui-scripts/commit/50a6a39fa0847da81277c49c1941a5b4eff89321))
-   deleted baseUrl ([95158e3](https://github.com/core-ds/arui-scripts/commit/95158e3f2546ad39bb65f68ce29ec3968a5ebd93))
-   deleted commitlint as dep ([c83af3e](https://github.com/core-ds/arui-scripts/commit/c83af3e96ee4a8fca9ad7284cab7ca04e0635062))
-   reintaling husky ([46f955c](https://github.com/core-ds/arui-scripts/commit/46f955c7609c3e7b85ffdec437d7da5c34fe3429))
-   removed recursive symlink ([f1b6459](https://github.com/core-ds/arui-scripts/commit/f1b645973c2a4e6e134a484dd0b00dad4696e6e9))
-   returned proccess.argv ([9199bb8](https://github.com/core-ds/arui-scripts/commit/9199bb82fdf62e071a773601a221ba7de1e7a57b))
-   trying fix build ([7c2e76b](https://github.com/core-ds/arui-scripts/commit/7c2e76b94a54ceb4470c74ddf13ae5d12c901c73))

### Features

-   add prod tsconfig ([82f91e7](https://github.com/core-ds/arui-scripts/commit/82f91e7d24186d8ec6c104c4bf3257137ff5052d))
-   close [#59](https://github.com/core-ds/arui-scripts/issues/59) ([7f36f8b](https://github.com/core-ds/arui-scripts/commit/7f36f8b3059bca18ff3e0813f5e25a7a2c350dca))

# [7.0.0](https://github.com/core-ds/arui-scripts/compare/v6.0.3...v7.0.0) (2019-12-05)

## [6.0.3](https://github.com/core-ds/arui-scripts/compare/v6.0.2...v6.0.3) (2019-12-04)

## [6.0.2](https://github.com/core-ds/arui-scripts/compare/v6.0.1...v6.0.2) (2019-12-04)

### Features

-   allow override scripts settings by env ([172dc48](https://github.com/core-ds/arui-scripts/commit/172dc481babd40db322c4d49629e468b41592b1e))

## [6.0.1](https://github.com/core-ds/arui-scripts/compare/v6.0.0...v6.0.1) (2019-11-27)

### Bug Fixes

-   fix css modules loader ([77cdcb3](https://github.com/core-ds/arui-scripts/commit/77cdcb33da4f82d8c1cf593546f178c77b6553d3))

# [6.0.0](https://github.com/core-ds/arui-scripts/compare/v5.6.2...v6.0.0) (2019-11-27)

### Features

-   use css modules naming convention ([836670a](https://github.com/core-ds/arui-scripts/commit/836670ac2bc807041619ab74d39b23195e89d532))

## [5.6.2](https://github.com/core-ds/arui-scripts/compare/v5.6.1...v5.6.2) (2019-11-14)

## [5.6.1](https://github.com/core-ds/arui-scripts/compare/v5.6.0...v5.6.1) (2019-10-02)

# [5.6.0](https://github.com/core-ds/arui-scripts/compare/v5.5.0...v5.6.0) (2019-09-13)

### Bug Fixes

-   fix postcss webpack server config ([bbfcd53](https://github.com/core-ds/arui-scripts/commit/bbfcd534185016cfc8d042fcf396293edabcc60e))
-   fixed issue with shadowing path module ([b499974](https://github.com/core-ds/arui-scripts/commit/b499974472673b381b06436be88497d3f79c46ef))

### Features

-   additional build path ([5cc67c9](https://github.com/core-ds/arui-scripts/commit/5cc67c9ddc8246b86903f323249be49eaff89870))

# [5.5.0](https://github.com/core-ds/arui-scripts/compare/v5.4.0...v5.5.0) (2019-08-22)

### Features

-   add css modules support for \*.pcss files ([f927623](https://github.com/core-ds/arui-scripts/commit/f9276236484024d53da1c6e152185c85be044074))

# [5.4.0](https://github.com/core-ds/arui-scripts/compare/v5.3.0...v5.4.0) (2019-06-28)

### Features

-   **client:** remove unused measureFileSizesBeforeBuild call ([de0c68a](https://github.com/core-ds/arui-scripts/commit/de0c68af603b473e145632b7de834cf101d7d310))

# [5.3.0](https://github.com/core-ds/arui-scripts/compare/v5.2.0...v5.3.0) (2019-06-27)

# [5.2.0](https://github.com/core-ds/arui-scripts/compare/v5.1.0...v5.2.0) (2019-06-25)

### Features

-   **webpack.client.prod:** use TerserPlugin for minimization ([425adeb](https://github.com/core-ds/arui-scripts/commit/425adeb47dd6d078f9f590e1276904c10dae8563))

# [5.1.0](https://github.com/core-ds/arui-scripts/compare/v5.0.0...v5.1.0) (2019-05-30)

# [5.0.0](https://github.com/core-ds/arui-scripts/compare/v4.2.6...v5.0.0) (2019-04-25)

### Bug Fixes

-   **postinstall:** more obvious error messages on symlink creation issues ([0e348c1](https://github.com/core-ds/arui-scripts/commit/0e348c121a25e3cdfbd1bc3d4c3ea787c849c6c5))

### Features

-   synchronized contents of archive build with contents of docker build ([97a1fa2](https://github.com/core-ds/arui-scripts/commit/97a1fa24207efc5fc991efd159568acba63e62d0))
-   **webpack:** remove React ProvidePlugin ([01e6b5a](https://github.com/core-ds/arui-scripts/commit/01e6b5a40358562cebe2cac364728599ba7bbdbd))

## [4.2.6](https://github.com/core-ds/arui-scripts/compare/v4.2.5...v4.2.6) (2019-02-28)

## [4.2.5](https://github.com/core-ds/arui-scripts/compare/v4.2.4...v4.2.5) (2019-02-14)

### Bug Fixes

-   remove toLowerCase() call on argValue from docker-build ([6ee433c](https://github.com/core-ds/arui-scripts/commit/6ee433cbc51194a98bb9fd4a7cb0e0febf6a5051))

## [4.2.4](https://github.com/core-ds/arui-scripts/compare/v4.2.3...v4.2.4) (2019-01-23)

### Bug Fixes

-   **test:** Comment about skipped arguments added ([ce555ce](https://github.com/core-ds/arui-scripts/commit/ce555ce67370ab069b4f3d5969142c7953aadbf9))
-   **test:** Fixed argument handling to test provided files only ([8711585](https://github.com/core-ds/arui-scripts/commit/871158582e56ef393bf8a3e0fc8855ed059cff8a))

## [4.2.3](https://github.com/core-ds/arui-scripts/compare/v4.2.2...v4.2.3) (2019-01-17)

### Features

-   **webpack-dev-server:** up version to 3.1.4 ([0be5c9f](https://github.com/core-ds/arui-scripts/commit/0be5c9fc4062f347a3693f1cabd36cadd49c8ed1))

## [4.2.2](https://github.com/core-ds/arui-scripts/compare/v4.2.1...v4.2.2) (2019-01-10)

### Bug Fixes

-   **dependencies:** update webpack-dev-server ([b7727c6](https://github.com/core-ds/arui-scripts/commit/b7727c668abbcca121b8e65449f6fd700bea214e))

## [4.2.1](https://github.com/core-ds/arui-scripts/compare/v4.2.0...v4.2.1) (2018-12-26)

### Bug Fixes

-   **postcss-config:** change extensions for postcss-custom-media plugin ([9e3a560](https://github.com/core-ds/arui-scripts/commit/9e3a5608edc5dab15328cd53f8430f7eab51afca))

# [4.2.0](https://github.com/core-ds/arui-scripts/compare/v4.1.2...v4.2.0) (2018-12-18)

### Features

-   **docker-build:** added ability to override dockerfile ([76a3a3a](https://github.com/core-ds/arui-scripts/commit/76a3a3af0fa721534fbddd60af45c9104a69c230))

## [4.1.2](https://github.com/core-ds/arui-scripts/compare/v4.1.1...v4.1.2) (2018-12-10)

### Bug Fixes

-   **client:** correct base path for css extractor plugin ([1195fa7](https://github.com/core-ds/arui-scripts/commit/1195fa7125bdfb91fca7503a1501947385d59e47))

## [4.1.1](https://github.com/core-ds/arui-scripts/compare/v4.1.0...v4.1.1) (2018-12-06)

### Bug Fixes

-   provided default value for clientPolyfillsEntry when no arui-feather is installed ([623593e](https://github.com/core-ds/arui-scripts/commit/623593e4aea37d026a2dad8b1c73639259677e40))
-   **webpack-minimizer:** update webpack, disable z-index optimize ([f936b1b](https://github.com/core-ds/arui-scripts/commit/f936b1b301eb7dd2215dba175271c6fd5edb0c40))

# [4.1.0](https://github.com/core-ds/arui-scripts/compare/v4.0.3...v4.1.0) (2018-12-04)

### Features

-   **browserlist:** forget dead browsers ([926bc1d](https://github.com/core-ds/arui-scripts/commit/926bc1d6b5448aabcabb15b8a94b743c82c7a1df))

## [4.0.3](https://github.com/core-ds/arui-scripts/compare/v4.0.2...v4.0.3) (2018-12-04)

### Bug Fixes

-   **webpack.client:** remove pathinfo from client prod build ([c2d86a3](https://github.com/core-ds/arui-scripts/commit/c2d86a31aa10ba4649b8691385ccbfae3fd14484))

### Features

-   **ci:** add travis ci ([9c30459](https://github.com/core-ds/arui-scripts/commit/9c30459f065814211f3923f912e1399e1725060e))
-   **scripts:** add install step for test project ([e834431](https://github.com/core-ds/arui-scripts/commit/e8344319c2e926a8229a37fb851ad0b165503fbd))

## [4.0.2](https://github.com/core-ds/arui-scripts/compare/v4.0.1...v4.0.2) (2018-11-23)

### Bug Fixes

-   move test to other directory, fix npmignore ([73f93e4](https://github.com/core-ds/arui-scripts/commit/73f93e4d7956a2379465a97f7c85e7d10544c3e6))

## [4.0.1](https://github.com/core-ds/arui-scripts/compare/v3.0.0...v4.0.1) (2018-11-23)

### Bug Fixes

-   small review fixes ([7888b6b](https://github.com/core-ds/arui-scripts/commit/7888b6b8fc9f4a095edd5cfc9c3e689ee22afaf1))

### Features

-   add `useTscLoader` flag, fix some problems with ts compilation ([568f509](https://github.com/core-ds/arui-scripts/commit/568f5098bfe5956ee6bc5bdaef1edab69b9c582f))
-   migrate to webpack 4 ([acbb30b](https://github.com/core-ds/arui-scripts/commit/acbb30bf07b27f064b6a8c249ed448e4277895f8))

# [3.0.0](https://github.com/core-ds/arui-scripts/compare/v2.2.1...v3.0.0) (2018-11-14)

### Features

-   **webpack:** ignore non-js require in node.js in node_modules ([2de1ea7](https://github.com/core-ds/arui-scripts/commit/2de1ea7d48947636b84aca06c61b7b1b933a3b84))

## [2.2.1](https://github.com/core-ds/arui-scripts/compare/v2.1.1...v2.2.1) (2018-10-22)

### Features

-   **jest-preset:** add testURL ([374d924](https://github.com/core-ds/arui-scripts/commit/374d92436a12cc9df967c0ea701b2f168931f34f))

## [2.1.1](https://github.com/core-ds/arui-scripts/compare/v2.1.0...v2.1.1) (2018-10-02)

### Bug Fixes

-   **app-configs:** typo in serverPort ([72ea7e3](https://github.com/core-ds/arui-scripts/commit/72ea7e31f71d18841e81d74ca23b1fbfbb764f98))

# [2.1.0](https://github.com/core-ds/arui-scripts/compare/v2.0.5...v2.1.0) (2018-09-28)

## [2.0.5](https://github.com/core-ds/arui-scripts/compare/v2.0.4...v2.0.5) (2018-08-23)

### Bug Fixes

-   **webpack-client-prod:** keep keyframes names ([fdd4298](https://github.com/core-ds/arui-scripts/commit/fdd4298d58826910356150b39c65fedfc5d274ee))

## [2.0.4](https://github.com/core-ds/arui-scripts/compare/v2.0.3...v2.0.4) (2018-08-08)

### Bug Fixes

-   **app-configs:** fix baseDockerImage ([0100b06](https://github.com/core-ds/arui-scripts/commit/0100b06c2479a23be8fa3d180e6ae549c4605c2d))

## [2.0.3](https://github.com/core-ds/arui-scripts/compare/v2.0.2...v2.0.3) (2018-08-06)

### Bug Fixes

-   changed octal value ([40a9dfa](https://github.com/core-ds/arui-scripts/commit/40a9dfa7c4a9da244f9e343c9929c48e6faf3dd4))

## [2.0.2](https://github.com/core-ds/arui-scripts/compare/v2.0.1...v2.0.2) (2018-08-06)

### Bug Fixes

-   remove erroneous commit ([cda07da](https://github.com/core-ds/arui-scripts/commit/cda07da38362750a121317660244ee2ae2a892a7))

## [2.0.1](https://github.com/core-ds/arui-scripts/compare/v2.0.0...v2.0.1) (2018-08-06)

### Bug Fixes

-   add file mode while writing the start.sh file ([82747cd](https://github.com/core-ds/arui-scripts/commit/82747cdb927da794bc4e52e2aed71e615a61a669))
-   make start.sh executable ([0998e7b](https://github.com/core-ds/arui-scripts/commit/0998e7b98bf628a35e941695641ab755b979e706))

# [2.0.0](https://github.com/core-ds/arui-scripts/compare/ae5f4adb6fb876e5869150ca1e08dfab96afea93...v2.0.0) (2018-08-02)

### Features

-   allow to pass options with 'arui-scripts' property ([ae5f4ad](https://github.com/core-ds/arui-scripts/commit/ae5f4adb6fb876e5869150ca1e08dfab96afea93))

ARUI-scripts
===

Простой и гибкий инструмент для одновременной сборки клиентской и серверной части react-приложений.

Использование
===

0. Пакет требует использовать следующие версии:

Зависимость | Версия
-- | --
`nodejs` | `14.0.0+`
`react` | `16.13.0+`
`react-dom` | `16.13.0+`

1. Установите `arui-scripts` в свой проект как dev зависимость

```bash
yarn add arui-scripts --dev
```
или
```bash
npm install arui-scripts --save-dev
```

2. Создайте необходимые файлы
- `src/index.{js,jsx,ts,tsx}` - входная точка для клиентского приложения.
- `src/server/index.{js,jsx,tsx}` - входная точка для серверного приложения.
- `node_modules/arui-feather/polyfills` - полифилы для клиентского приложения.

При желании вы можете изменить эти пути с помощью настроек.

3. Используйте команды из `arui-scripts`!

Документация
===
- [Настройки](docs/settings.md)
- [Команды](docs/commands.md)
- [Примеры входных точек](docs/examples.md)
- [Пресеты](docs/presets.md)
- [Тонкая настройка](docs/overrides.md)
- [Настройки сборки артефакта](docs/artifact.md)
- [Настройки компиляторов](docs/compilers.md)
- [Особенности поведения](docs/caveats.md)
- [Использование модулей](docs/modules.md)

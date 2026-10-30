Миграция на arui-scripts 26
===

## Конфигурация сборки артефактов

`dockerRegistry`, `baseDockerImage`, `nginxRootPath`, `nginx`, `runFromNonRootUser`,
`removeDevDependenciesDuringDockerBuild`, `deleteNpm`, `archiveName`, `additionalBuildPath`
и оверрайды `Dockerfile`, `DockerfileCompiled`, `nginx`, `nginxConf`, `start.sh`
остаются поддерживаемой частью arui-scripts. Предупреждения об устаревании удалены.
Если вы не переносили эти настройки, менять ничего не нужно.

Команды `arui-scripts docker-build`, `docker-build:compiled` и `archive-build` больше
не загружают проектный `arui-scripts-artifacts.ts` (и остальные варианты имени этого конфига).
При обновлении выберите один из вариантов:

- Продолжать использовать команды arui-scripts: вернуть настройки сборки в
  `arui-scripts.config.ts`, `package.json#aruiScripts` или presets, а оверрайды —
  в `arui-scripts.overrides.ts`.
- Использовать самостоятельную сборку артефактов: оставить `arui-scripts-artifacts.ts`
  и переключить команды на `arui-scripts-artifacts docker-build`,
  `arui-scripts-artifacts docker-build:compiled`, `arui-scripts-artifacts archive-build`.
  Пакет `@alfalab/arui-scripts-artifacts` нужно установить явно; arui-scripts ему не требуется.

Соответствие полей и оверрайдов приведено в
[таблице миграции](../../arui-scripts-artifacts/docs/migration.md#таблица-соответствия).
Особенно обратите внимание на nginx: `overrides.nginxConf` в artifacts соответствует
`nginx` в arui-scripts, а `overrides.baseNginxConf` — `nginxConf`.

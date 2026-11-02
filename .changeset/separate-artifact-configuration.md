---
'arui-scripts': major
---

**Что изменилось**
Настройки сборки артефактов (`dockerRegistry`, `baseDockerImage` и остальные) и оверрайды
`Dockerfile`, `DockerfileCompiled`, `nginx`, `nginxConf`, `start.sh` больше не помечены
устаревшими. Предупреждения об их использовании удалены.
Команды `docker-build`, `docker-build:compiled` и `archive-build` больше не загружают
проектный `arui-scripts-artifacts.ts` и другие варианты имени этого конфига.

**Что делать потребителю**
Если настройки сборки остались в конфигурации arui-scripts, никаких действий не требуется.
Если вы перенесли их в `arui-scripts-artifacts.ts`, верните настройки в
`arui-scripts.config.ts`, `package.json#aruiScripts` или presets, а оверрайды —
в `arui-scripts.overrides.ts`. Альтернатива: явно установите `@alfalab/arui-scripts-artifacts`
и замените команды `arui-scripts docker-build`, `arui-scripts docker-build:compiled`,
`arui-scripts archive-build` на соответствующие команды `arui-scripts-artifacts`.

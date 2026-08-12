---
"arui-scripts": minor
---

Добавлен автоматический symlink на yarn бинарник в Dockerfile при использовании yarn 2+ с yarnPath в .yarnrc.yml. Это исправляет ошибку `yarn: not found` в Docker-образах (ни полный, ни slim-образ не содержат yarn).

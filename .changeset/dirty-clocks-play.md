---
'arui-scripts': minor
---

Исправлен порядок инструкций в Dockerfile-шаблоне команды `docker-build`: шаг удаления npm
(`deleteNpm: true`) выполнялся после переключения на непривилегированного пользователя
(`runFromNonRootUser: true`) и падал с ошибкой прав доступа. Теперь npm удаляется до инструкции `USER nginx` — так же, как это уже было
сделано в шаблоне для `docker-build-compiled`

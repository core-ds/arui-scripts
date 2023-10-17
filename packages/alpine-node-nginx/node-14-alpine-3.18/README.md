# Базовый образ nodejs@14 на основе alpine 3.18

Часть проектов все еще живет на node@14. alpine@3.16, на котором основан последний официальный базовый образ 14 ноды
содержит пакеты с уязвимостями. Поэтому просто собираем свой образ с 14 нодой на alpine 3.18

Код основан на:
- [Dockerfile node 20](https://github.com/nodejs/docker-node/blob/6c20762ebfb6ab35c874c4fe540a55ab8fd6c49d/20/alpine3.18/Dockerfile)
- [Dockerfile node 14](https://hub.docker.com/layers/library/node/14.21.3-alpine3.17/images/sha256-4e84c956cd276af9ed14a8b2939a734364c2b0042485e90e1b97175e73dfd548?context=explore)

Этот образ должен умереть вместе с удалением nodejs@14.

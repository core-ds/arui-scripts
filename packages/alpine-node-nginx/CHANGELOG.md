# arui-scripts-docker

## 15.2.1

### Patch Changes

-   [#429](https://github.com/core-ds/arui-scripts/pull/429) [`bc0ef71`](https://github.com/core-ds/arui-scripts/commit/bc0ef718c17f474d3c87e39529ec2b6b27a8dc66) Thanks [@ngg-dev](https://github.com/ngg-dev)! - отключено предупреждение из-за GCC 15 после обновления до alpine 3.23

## 15.2.0

### Minor Changes

-   [#394](https://github.com/core-ds/arui-scripts/pull/394) [`8d1b63a`](https://github.com/core-ds/arui-scripts/commit/8d1b63a22561742294389a98b10ce7daa76ec1d9) Thanks [@mrAnomalyy](https://github.com/mrAnomalyy)! - Обновляем зафиксированный uid пользователя nginx при его создании на 100, группа 101 (для дальнейшего использования в кубере, требования ДКБ).

-   [#393](https://github.com/core-ds/arui-scripts/pull/393) [`cb239f4`](https://github.com/core-ds/arui-scripts/commit/cb239f4959cdd37a2a189bcef99c46456ed699a6) Thanks [@mrAnomalyy](https://github.com/mrAnomalyy)! - Фиксируем uid пользователя nginx при его создании (для дальнейшего использования в кубере, требования ДКБ)

## 15.1.0

### Minor Changes

-   [#198](https://github.com/core-ds/arui-scripts/pull/198) [`c2d6b5d`](https://github.com/core-ds/arui-scripts/commit/c2d6b5d6a54363f32b2e4f80863e6bd477c42c80) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Добавлен новый вид базовых образов - slim версии уже существовавших.
    В slim версиях отсутствуют многочисленные модули nginx, которые обычно не нужны в проектах.

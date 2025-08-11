---
'arui-scripts': major
---

1. Удалено подключение полифилов из arui-feather.
2. arui-feather удален из списка `serverExternalsExemptions`.

Если вы по какой-то причине хотите вернуть это поведение:
1. Вы можете использовать настройку `clientPolyfillsEntry`, передав туда путь до файла с полифилами (`./node_modules/arui-feather/polyfills.js`)
2. Вы можете использовать оверрайд для `serverExternalsExemptions` и добавить туда regex для feather: `/^arui-feather/`.

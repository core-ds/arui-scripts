---
'@alfalab/scripts-modules': minor
---

Добавлена точка входа /react с createReactModule и useModuleReady для React 18+.
Хелпер управляет отдельными root, гидрацией, обновлением и очисткой mountable-модулей,
сообщает готовность после commit или по явному условию и передаёт ошибки через
внутренний Error Boundary в lifecycle context хоста.

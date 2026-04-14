---
'arui-scripts': major
---

Добавлена поддержка ts@6. Удалена поддержка ts@4.

В базовом tsconfig.json значение `compilerOptions.moduleResolution` изменено с "node" на "bundler".
Режим bundler включает поддержку современных механизмов резолва пакетов — в первую очередь поля exports в package.json зависимостей.
Это приближает поведение TypeScript к тому, как модули реально резолвятся rspack.

### Что может сломаться

**Импорты по путям, не объявленным в `exports` зависимости**

Это основная причина возможных ошибок. Если у пакета в `package.json` есть поле `exports`, TypeScript теперь использует **только его** для резолва. Прямые импорты внутренностей пакета, не описанные в `exports`, перестанут резолвиться:

```
TS2307: Cannot find module 'some-lib/dist/utils' or its corresponding type declarations.
```

Примеры импортов, которые могут сломаться:

```ts
// Импорт из внутренней директории пакета
import { helper } from 'some-lib/dist/internal/utils'

// Субпутевой импорт, не описанный в exports
import { Component } from '@scope/ui-kit/some-undeclared-path'
```

**Изменение приоритета `typesVersions` vs `exports`**

Если зависимость использует одновременно `typesVersions` и `exports` с условием `types`, то в режиме `bundler` приоритет получает `exports`. В редких случаях это может привести к подхвату других типов.

**Пакеты с неполными `exports` (только `require`)**

Если зависимость в `exports` указала только условие `require` без `import` или `default`, импорт может не зарезолвиться. На практике это редкость.

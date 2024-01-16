---
'arui-scripts': major
---

Обновление списка поддерживаемых браузеров.
Прекращена поддержка IE11.

Это влияет как на собираемый js-код, так и на стили.

При желании вы можете переопределить список поддеживаемых браузеров через оверрайды.

```ts
// arui-scripts.overrides.ts
import { OverrideFile } from 'arui-scripts';
const override: OverrideFile = {
    browsers: () => ['last 2 versions', 'not ie < 11'], // или любой другой ваш список
};

export default override;
```

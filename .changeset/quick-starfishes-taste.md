---
'arui-scripts': minor
---

Добавлен кастомный плагин postcss-global-variables, для оптимизации времени обработки глобальных переменных.
@csstools/postcss-global-data *удален*

Проекты, которые использовали в оверрайдах кастомные настройки для плагина @csstools/postcss-global-data, должны перейти на использование postcss-global-variables следующим образом
```
postcss: (config) => {
  const overrideConfig = config.map((plugin) => {
    if (plugin.name === 'postCssGlobalVariables') {
      return {
        ...plugin,
        options: plugin.options.concat([
          // ваши файлы
        ])
      }
    }
    return plugin;
  });

  return overrideConfig;
}
```
Плагин работает только с глобальными переменными, если вам надо вставить что-то другое, отличное от глобальных переменных, вам нужно будет добавить @csstools/postcss-global-data в свой проект самостоятельно

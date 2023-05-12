import type { ModuleMountFunction, ModuleUnmountFunction } from '@arui-scripts/widgets';
import './styles.css';

const mountModule: ModuleMountFunction = (moduleId, params, targetNode) => {
    console.log('ClientWidgetLegacy: mount', params);

    if (targetNode) {
        targetNode.innerHTML = `
  <div class="module-ClientWidgetLegacy">
    Это модуль ClientWidgetLegacy, который был загружен в режиме legacy.

    Legacy в данном случае не обозначает чего-либо плохого, просто это модуль, который не использует module-federation.
    <div class="content">
      У виджета могут быть свои стили, которые автоматически будут изолированы от других стилей на странице.
      Единственное условие - виджет сам должен добавлять class="module-{ID виджета}" к корневому элементу.
    </div>
  </div>`;
    }
};

const unmountModule: ModuleUnmountFunction = (targetNode) => {
    console.log('ClientWidgetLegacy: cleanup');

    if (targetNode) {
        targetNode.innerHTML = '';
    }
};

// для названия mount и unmount функций придерживаемся такого шаблона:
// `__mount${NameOfAModule}` и `__unmount${NameOfAModule}`
(window as any).__mountClientWidgetLegacy = mountModule;
(window as any).__unmountClientWidgetLegacy = unmountModule;

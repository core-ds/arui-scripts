import type { ModuleMountFunction, ModuleUnmountFunction } from '@arui-scripts/widgets';

const mountModule: ModuleMountFunction = (moduleId, params, targetNode) => {
    console.log('ServerWidgetLegacy: mount', params);

    if (targetNode) {
        targetNode.innerHTML = `
  <div>
    Это модуль ServerWidgetLegacy, который был загружен в режиме legacy.
    Главное его отличие от ClientWidgetLegacy - это то, что при его загрузке на страницу, он сразу же получает данные с сервера.
    <div class="content">
      Например сейча виджет получил данные:
      <pre>
${JSON.stringify(params, null, 4)}
      </pre>
    </div>
  </div>`;
    }
};

const unmountModule: ModuleUnmountFunction = (targetNode) => {
    console.log('ServerWidgetLegacy: cleanup');

    if (targetNode) {
        targetNode.innerHTML = '';
    }
};

// для названия mount и unmount функций придерживаемся такого шаблона:
// `__mount${NameOfAModule}` и `__unmount${NameOfAModule}`
(window as any).__mountServerWidgetLegacy = mountModule;
(window as any).__unmountServerWidgetLegacy = unmountModule;

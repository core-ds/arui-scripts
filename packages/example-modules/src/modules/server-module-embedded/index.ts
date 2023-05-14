import type { ModuleMountFunction, ModuleUnmountFunction, WindowWithMountableModule } from '@arui-scripts/modules';

const mountModule: ModuleMountFunction = (moduleId, params, targetNode) => {
    console.log('ServerModuleEmbedded: mount', params);

    if (targetNode) {
        targetNode.innerHTML = `
  <div>
    Это модуль ServerModuleEmbedded, который был загружен в режиме embedded.
    Главное его отличие от ClientModuleEmbedded - это то, что при его загрузке на страницу, он сразу же получает данные с сервера.
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
    console.log('ServerModuleEmbedded: cleanup');

    if (targetNode) {
        targetNode.innerHTML = '';
    }
};

(window as WindowWithMountableModule).ServerModuleEmbedded = {
    mount: mountModule,
    unmount: unmountModule,
};

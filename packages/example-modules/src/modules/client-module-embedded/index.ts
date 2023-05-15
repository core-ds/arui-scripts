import type { ModuleMountFunction, ModuleUnmountFunction, WindowWithMountableModule } from '@alfalab/scripts-modules';
import './styles.css';

const mountModule: ModuleMountFunction = (moduleId, params, targetNode) => {
    console.log('ClientModuleEmbedded: mount', params);

    if (targetNode) {
        targetNode.innerHTML = `
  <div class="module-ClientModuleEmbedded">
    Это модуль ClientModuleEmbedded, который был загружен в режиме embedded.

    Embedded в данном случае не обозначает чего-либо плохого, просто это модуль, который не использует module-federation.
    <div class="content">
      У виджета могут быть свои стили, которые автоматически будут изолированы от других стилей на странице.
      Единственное условие - виджет сам должен добавлять class="module-{ID виджета}" к корневому элементу.
    </div>
  </div>`;
    }
};

const unmountModule: ModuleUnmountFunction = (targetNode) => {
    console.log('ClientModuleEmbedded: cleanup');

    if (targetNode) {
        targetNode.innerHTML = '';
    }
};

(window as WindowWithMountableModule).ClientModuleEmbedded = {
    mount: mountModule,
    unmount: unmountModule,
};

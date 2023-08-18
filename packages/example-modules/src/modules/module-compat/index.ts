import type { ModuleMountFunction, ModuleUnmountFunction, WindowWithMountableModule } from '@alfalab/scripts-modules';
import './styles.css';

const mountModule: ModuleMountFunction<any, any> = (targetNode, runParams) => {
    console.log('ModuleCompat: mount', { runParams });

    if (targetNode) {
        targetNode.innerHTML = `
  <div class="module-ModuleCompat">
    Это модуль ModuleCompat, который был загружен в режиме compat.

    <div class="primary">
      У виджета могут быть свои стили, которые автоматически будут изолированы от других стилей на странице.
      Единственное условие - виджет сам должен добавлять class="module-{ID виджета}" к корневому элементу.

      <div class="primary__footer">
        Этот текст должен быть синего цвета
      </div>
    </div>
  </div>`;
    }
};

const unmountModule: ModuleUnmountFunction = (targetNode) => {
    console.log('ModuleCompat: cleanup');

    if (targetNode) {
        targetNode.innerHTML = '';
    }
};

(window as WindowWithMountableModule).ModuleCompat = {
    mount: mountModule,
    unmount: unmountModule,
};

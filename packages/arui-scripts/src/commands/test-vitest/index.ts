import { runVitest } from '@alfalab/arui-scripts-vitest/run';

process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

console.warn(
    'Команда `arui-scripts test:vitest` устарела и будет удалена в следующей мажорной версии arui-scripts.',
    'Установите `@alfalab/arui-scripts-vitest` и запускайте `vitest run`, подробнее в README пакета.',
);

const args = process.argv.slice(3);

runVitest({ args })
    .then((code) => {
        process.exit(code);
    })
    .catch((error) => {
        console.error('Error running Vitest:', error);
        process.exit(1);
    });

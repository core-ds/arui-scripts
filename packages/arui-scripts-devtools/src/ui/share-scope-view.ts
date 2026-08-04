import { readShareScopes, type ShareScope } from '../share-scope';

import { createElement } from './dom';
import { EMPTY } from './format';

export type ShareScopeView = {
    element: HTMLElement;
    /** пересобирает снимок из share scope прямо сейчас */
    refresh(): void;
};

function createVersionRow(scope: ShareScope['packages'][number]['versions'][number]) {
    const row = createElement('div', 'row row_share');

    row.appendChild(createElement('span', 'cell cell_mono', scope.version));
    row.appendChild(createElement('span', 'cell cell_mono', scope.from || EMPTY));
    row.appendChild(createElement('span', 'cell', scope.loaded ? 'да' : 'нет'));
    row.appendChild(createElement('span', 'cell', scope.eager ? 'да' : 'нет'));
    row.appendChild(createElement('span', 'cell', scope.singleton ? 'да' : 'нет'));
    row.appendChild(
        createElement(
            'span',
            'cell cell_mono',
            [scope.requiredVersion || EMPTY, scope.strictVersion ? '(strict)' : '']
                .filter(Boolean)
                .join(' '),
        ),
    );

    return row;
}

function createPackageBlock(item: ShareScope['packages'][number]) {
    const block = createElement('div', 'package');
    const title = createElement('div', 'package__title');

    title.appendChild(createElement('span', 'module-id', item.name));

    if (item.problems.length) {
        title.appendChild(createElement('span', 'badge badge_problem', 'проблема'));
    }

    block.appendChild(title);

    item.problems.forEach((problem) => {
        block.appendChild(createElement('div', 'problem', problem.message));
    });

    const header = createElement('div', 'row row_share row_header');

    ['Версия', 'От кого', 'Загружен', 'Eager', 'Singleton', 'requiredVersion'].forEach((column) =>
        header.appendChild(createElement('span', 'cell', column)),
    );

    block.appendChild(header);
    item.versions.forEach((version) => block.appendChild(createVersionRow(version)));

    return block;
}

/**
 * Вкладка share scope: что реально лежит в скоупах на текущий момент.
 *
 * `requiredVersion` здесь - требование того, кто положил запись в скоуп. Требования остальных
 * потребителей в рантайме не хранятся, поэтому «провайдер просил ^17, а хост дал 18» из этой
 * таблицы не видно. Это станет видно после мержа ветки feat/modules-shared-check, которая
 * складывает объявленные требования в стор.
 */
export function createShareScopeView(): ShareScopeView {
    const element = createElement('div', 'share-scope');

    function refresh() {
        element.textContent = '';

        const scopes = readShareScopes();

        if (!scopes.length) {
            element.appendChild(
                createElement(
                    'div',
                    'placeholder',
                    'Share scope пуст: module federation в этом приложении не используется либо ещё не инициализирован.',
                ),
            );

            return;
        }

        scopes.forEach((scope) => {
            element.appendChild(createElement('div', 'scope__title', `Скоуп «${scope.name}»`));

            if (!scope.packages.length) {
                element.appendChild(createElement('div', 'placeholder', 'нет пакетов'));

                return;
            }

            scope.packages.forEach((item) => element.appendChild(createPackageBlock(item)));
        });
    }

    refresh();

    return { element, refresh };
}

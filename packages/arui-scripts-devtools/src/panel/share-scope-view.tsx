import { Fragment } from 'react';

import { EMPTY } from '../constants';
import { type SharedPackage, type SharedVersion, type ShareScopeViewProps } from '../types';

function VersionRow({ version }: { version: SharedVersion }) {
    return (
        <div className='row row_share'>
            <span className='cell cell_mono'>{version.version}</span>
            <span className='cell cell_mono'>{version.from || EMPTY}</span>
            <span className='cell'>{version.loaded ? 'да' : 'нет'}</span>
            <span className='cell'>{version.eager ? 'да' : 'нет'}</span>
            <span className='cell'>{version.singleton ? 'да' : 'нет'}</span>
            <span className='cell cell_mono'>
                {[version.requiredVersion || EMPTY, version.strictVersion ? '(strict)' : '']
                    .filter(Boolean)
                    .join(' ')}
            </span>
        </div>
    );
}

function PackageBlock({ item }: { item: SharedPackage }) {
    return (
        <div className='package'>
            <div className='package__title'>
                <span className='module-id'>{item.name}</span>
                {/* требования приходят из сборки и манифестов провайдеров: в скоупе их нет */}
                {item.requirements
                    .filter((requirement) => requirement.requiredVersion)
                    .map((requirement) => (
                        <span
                            className='badge'
                            key={requirement.from}
                            title={`Объявлено в modules.shared: ${requirement.from}`}
                        >
                            {`${requirement.from} просит ${requirement.requiredVersion}`}
                        </span>
                    ))}
                {item.problems.length > 0 && <span className='badge badge_problem'>проблема</span>}
            </div>
            {item.problems.map((problem) => (
                <div className='problem' key={problem.type}>
                    {problem.message}
                </div>
            ))}
            <div className='row row_share row_header'>
                {['Версия', 'От кого', 'Загружен', 'Eager', 'Singleton', 'requiredVersion'].map(
                    (column) => (
                        <span className='cell' key={column}>
                            {column}
                        </span>
                    ),
                )}
            </div>
            {item.versions.map((version) => (
                <VersionRow version={version} key={version.version} />
            ))}
        </div>
    );
}

/**
 * Вкладка share scope: что реально лежит в скоупах на текущий момент.
 *
 * `requiredVersion` здесь - требование того, кто положил запись в скоуп. Требования остальных
 * потребителей в рантайме не хранятся, поэтому «провайдер просил ^17, а хост дал 18» из этой
 * таблицы не видно.
 */
export function ShareScopeView({ scopes }: ShareScopeViewProps) {
    if (!scopes.length) {
        return (
            <div className='share-scope'>
                <div className='placeholder'>
                    Share scope пуст: module federation в этом приложении не используется либо ещё
                    не инициализирован.
                </div>
            </div>
        );
    }

    return (
        <div className='share-scope'>
            {scopes.map((scope) => (
                <Fragment key={scope.name}>
                    <div className='scope__title'>{`Скоуп «${scope.name}»`}</div>
                    {scope.packages.length ? (
                        scope.packages.map((item) => <PackageBlock item={item} key={item.name} />)
                    ) : (
                        <div className='placeholder'>нет пакетов</div>
                    )}
                </Fragment>
            ))}
        </div>
    );
}

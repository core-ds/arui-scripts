import { PANEL_TABS } from '../constants';
import { type PanelTabsProps } from '../types';

/**
 * Полоска вкладок с метками.
 *
 * Метки разные, потому что говорят о разном: восклицательный знак у share scope - это проблема,
 * с которой надо разбираться, а точка у подмены - включённое состояние, о котором нельзя забыть.
 * Числа в заголовках нет намеренно: полоска вкладок не должна превращаться в бегущую строку,
 * а сколько именно - видно внутри вкладки и в подсказке метки.
 */
export function PanelTabs({
    activeTab,
    onSelect,
    hasShareProblems,
    overridesCount,
}: PanelTabsProps) {
    return (
        <div className='tabs' role='tablist'>
            {PANEL_TABS.map((tab) => (
                <button
                    type='button'
                    role='tab'
                    key={tab.id}
                    className={`tab${tab.id === activeTab ? ' tab_active' : ''}`}
                    aria-selected={tab.id === activeTab}
                    onClick={() => onSelect(tab.id)}
                >
                    {tab.title}
                    {tab.id === 'share-scope' && hasShareProblems && (
                        <span
                            className='tab__alert'
                            title='В share scope есть проблемы'
                            aria-label='есть проблемы'
                        >
                            !
                        </span>
                    )}
                    {tab.id === 'overrides' && overridesCount > 0 && (
                        <span
                            className='tab__mark'
                            title={`Адресов подменяется: ${overridesCount}`}
                            aria-label='подмена включена'
                        />
                    )}
                </button>
            ))}
        </div>
    );
}

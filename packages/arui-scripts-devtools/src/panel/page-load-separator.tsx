import { type PageLoadSeparatorProps } from '../types';
import { getPageLoadTitle } from '../utils/page-loads';

/**
 * Граница между загрузками страницы в списке.
 *
 * Стор переживает перезагрузку через sessionStorage, поэтому в таблице лежат записи сразу
 * нескольких загрузок страницы. Без границы они выглядят одним списком - и «модуль упал,
 * я перезагрузил» читается как «модуль упал дважды».
 */
export function PageLoadSeparator({ group }: PageLoadSeparatorProps) {
    return (
        <div className='row row_separator' role='separator'>
            <span className='page-load'>
                <span className='page-load__icon' aria-hidden='true'>
                    ⟳
                </span>
                {getPageLoadTitle(group)}
            </span>
        </div>
    );
}

import type { AtRule } from 'postcss';

import { getMediaQueryName, } from '../utils';

describe('getMediaQueryName', () => {
  it('Должен возвращать имя медиа-запроса', () => {
    const rule: AtRule = { params: 'screen and (min-width: 768px)' } as AtRule;

    expect(getMediaQueryName(rule)).toBe('screen');
  });

  it('Должен возвращать пустую строку, если params пустой', () => {
    const rule: AtRule = { params: '' } as AtRule;

    expect(getMediaQueryName(rule)).toBe('');
  });
});
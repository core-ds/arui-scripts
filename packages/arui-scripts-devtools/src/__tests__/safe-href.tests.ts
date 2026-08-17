import { toSafeHref } from '../utils/safe-href';

// eslint-disable-next-line no-script-url -- это и есть предмет теста
const SCRIPT_URL = 'javascript:alert(document.cookie)';

describe('toSafeHref', () => {
    it('should keep an http url as is', () => {
        expect(toSafeHref('http://cdn.test/module.js')).toBe('http://cdn.test/module.js');
    });

    it('should keep an https url as is', () => {
        expect(toSafeHref('https://cdn.test/module.js')).toBe('https://cdn.test/module.js');
    });

    it('should resolve a relative url against the page', () => {
        // модуль может лежать на том же origin, и тогда загрузчик кладёт в запись
        // относительный путь - открывать его в новой вкладке ничто не мешает
        expect(toSafeHref('/static/module.js')).toBe('http://localhost/static/module.js');
    });

    it('should refuse a javascript url', () => {
        // url приезжает из манифеста, то есть снаружи: href исполнил бы его по клику
        expect(toSafeHref(SCRIPT_URL)).toBeUndefined();
    });

    it('should refuse a data url', () => {
        expect(toSafeHref('data:text/css,body{}')).toBeUndefined();
    });

    it('should resolve an empty url to the page itself', () => {
        // пустая строка в записи - это уже странность загрузчика, но ссылка на саму
        // страницу безобидна: разрешение идёт по тем же правилам, что и у браузера
        expect(toSafeHref('')).toBe('http://localhost/');
    });

    it('should refuse a url of an unknown scheme', () => {
        expect(toSafeHref('ftp://cdn.test/module.js')).toBeUndefined();
        expect(toSafeHref('file:///etc/passwd')).toBeUndefined();
    });
});

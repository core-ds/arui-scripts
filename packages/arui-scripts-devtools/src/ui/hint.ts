import { createElement } from './dom';

/** отступ от края экрана и от самой иконки, px */
const GAP = 8;

let counter = 0;

/**
 * Подсказка на экране всегда одна.
 *
 * Мышью двух сразу не открыть, но мышь может стоять на одной иконке, пока фокус клавиатурой
 * ушёл на другую, - и тогда на экране висели бы две.
 */
let hideVisible: (() => void) | undefined;

/** координаты подсказки: над иконкой, если сверху есть место, и не выезжая за края экрана */
function getPosition(anchor: DOMRect, own: DOMRect) {
    const above = anchor.top - own.height - GAP;
    const centered = anchor.left + anchor.width / 2 - own.width / 2;
    const maxLeft = document.documentElement.clientWidth - own.width - GAP;

    return {
        top: above >= GAP ? above : anchor.bottom + GAP,
        left: Math.max(GAP, Math.min(centered, maxLeft)),
    };
}

/**
 * Иконка «i» с подсказкой по наведению и по фокусу.
 *
 * Подсказка позиционируется `fixed` и считается по месту иконки: панель - это `overflow: hidden`
 * с прокручиваемым телом внутри, и подсказку в обычном потоке обрезал бы её край. У `fixed`
 * контейнинг-блок - вьюпорт, поэтому чужой `overflow` ей не помеха.
 *
 * @param text что показать
 * @param label чем кнопку назовёт скринридер
 */
export function createHint(text: string, label = 'Что это значит'): HTMLElement {
    const hint = createElement('button', 'hint', 'i');
    const tooltip = createElement('span', 'hint__tooltip', text);

    counter += 1;
    tooltip.id = `arui-devtools-hint-${counter}`;
    tooltip.setAttribute('role', 'tooltip');

    hint.type = 'button';
    hint.setAttribute('aria-label', label);
    hint.setAttribute('aria-describedby', tooltip.id);
    hint.appendChild(tooltip);

    let visible = false;

    function hide() {
        if (!visible) {
            return;
        }

        visible = false;
        tooltip.classList.remove('hint__tooltip_visible');

        // На поведение не влияет - скрытая подсказка и так выходит из hide() сразу. Но водопад
        // пересоздаёт иконки на каждой перерисовке, и без этой строки реестр держал бы ссылку
        // на замыкание уже выброшенной иконки, не давая её собрать
        if (hideVisible === hide) {
            hideVisible = undefined;
        }

        // слушатели живут только пока подсказка видна: иначе каждая строка водопада
        // повесила бы на окно по паре обработчиков и не сняла бы их при перерисовке
        window.removeEventListener('scroll', hide, true);
        window.removeEventListener('resize', hide);
    }

    function show() {
        if (visible) {
            return;
        }

        hideVisible?.();
        hideVisible = hide;
        visible = true;
        tooltip.classList.add('hint__tooltip_visible');

        // размеры подсказки известны только когда она уже показана
        const { top, left } = getPosition(
            hint.getBoundingClientRect(),
            tooltip.getBoundingClientRect(),
        );

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        window.addEventListener('scroll', hide, true);
        window.addEventListener('resize', hide);
    }

    hint.addEventListener('mouseenter', show);
    hint.addEventListener('mouseleave', hide);
    hint.addEventListener('focus', show);
    hint.addEventListener('blur', hide);
    hint.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !visible) {
            return;
        }

        // Esc гасит подсказку, а не панель. Обработчик панели висит на document и пропускает
        // события с defaultPrevented, поэтому здесь достаточно его выставить
        event.preventDefault();
        hide();
    });

    return hint;
}

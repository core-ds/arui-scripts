import {
    type KeyboardEvent as ReactKeyboardEvent,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

/** отступ от края экрана и от самой иконки, px */
const GAP = 8;

/**
 * Подсказка на экране всегда одна.
 *
 * Мышью двух сразу не открыть, но мышь может стоять на одной иконке, пока фокус клавиатурой
 * ушёл на другую, — и тогда на экране висели бы две. Реестр модульный нарочно: подсказки
 * живут в разных поддеревьях (у каждой строки водопада своя), общего предка со стейтом
 * у них нет.
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

export type HintProps = {
    /** что показать */
    text: string;
    /** чем кнопку назовёт скринридер */
    label?: string;
};

/**
 * Иконка «i» с подсказкой по наведению и по фокусу.
 *
 * Подсказка позиционируется `fixed` и считается по месту иконки: панель — это `overflow: hidden`
 * с прокручиваемым телом внутри, и подсказку в обычном потоке обрезал бы её край. У `fixed`
 * контейнинг-блок — вьюпорт, поэтому чужой `overflow` ей не помеха.
 */
export function Hint({ text, label = 'Что это значит' }: HintProps) {
    const tooltipId = useId();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const tooltipRef = useRef<HTMLSpanElement>(null);
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState<{ top: number; left: number }>();

    const hide = () => setVisible(false);

    const show = () => {
        hideVisible?.();
        setVisible(true);
    };

    // размеры подсказки известны только когда она уже показана, поэтому позицию
    // считаем после отрисовки, но до кадра — мигнуть в углу она не успевает
    useLayoutEffect(() => {
        if (!visible || !buttonRef.current || !tooltipRef.current) {
            return;
        }

        setPosition(
            getPosition(
                buttonRef.current.getBoundingClientRect(),
                tooltipRef.current.getBoundingClientRect(),
            ),
        );
    }, [visible]);

    // реестр и слушатели живут только пока подсказка видна: иначе каждая строка водопада
    // повесила бы на окно по паре обработчиков и держала бы ссылку на выброшенную иконку
    useEffect(() => {
        if (!visible) {
            return undefined;
        }

        hideVisible = hide;
        window.addEventListener('scroll', hide, true);
        window.addEventListener('resize', hide);

        return () => {
            if (hideVisible === hide) {
                hideVisible = undefined;
            }

            window.removeEventListener('scroll', hide, true);
            window.removeEventListener('resize', hide);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- hide стабилен по поведению
    }, [visible]);

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
        if (event.key !== 'Escape' || !visible) {
            return;
        }

        // Esc гасит подсказку, а не панель. Обработчик панели висит на document и пропускает
        // события с defaultPrevented, поэтому здесь достаточно его выставить
        event.preventDefault();
        hide();
    };

    return (
        <button
            ref={buttonRef}
            type='button'
            className='hint'
            aria-label={label}
            aria-describedby={tooltipId}
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
            onKeyDown={handleKeyDown}
        >
            i
            <span
                ref={tooltipRef}
                id={tooltipId}
                role='tooltip'
                className={`hint__tooltip${visible ? ' hint__tooltip_visible' : ''}`}
                style={position}
            >
                {text}
            </span>
        </button>
    );
}

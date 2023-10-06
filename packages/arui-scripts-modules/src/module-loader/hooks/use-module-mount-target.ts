import { useCallback, useMemo, useState } from 'react';

let mountId = 0;

type UseModuleMountTargetParams = {
    useShadowDom?: boolean;
    createTargetNode?: () => HTMLElement;
};

const MOUNT_ID_ATTRIBUTE = 'data-module-mount-id';

export function useModuleMountTarget({
    useShadowDom,
    createTargetNode,
}: UseModuleMountTargetParams) {
    const [mountTargetNode, setMountTargetNode] = useState<undefined | HTMLElement>();
    const currentMountId = useMemo(() => {
        mountId += 1;

        return `arui-scripts-module-${mountId}`;
    }, []);
    // Мы не можем использовать useRef тут, useRef не будет тригерить ререндер, так как он не меняет ничего
    // внутри хуков. https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
    const afterTargetMountCallback = useCallback((node: HTMLElement | null) => {
        if (!node) {
            return;
        }

        node.setAttribute(MOUNT_ID_ATTRIBUTE, currentMountId);

        // мы не можем маунтить реакт-приложение в элемент, созданный другим реакт-приложением, поэтому создаем элемент, лежащий
        // прямо внутри того, что пришло через ref
        const realTarget = createTargetNode ? createTargetNode() : document.createElement('div');

        if (useShadowDom && node.attachShadow) {
            const shadowRoot = node.attachShadow({
                mode: 'open',
                delegatesFocus: true,
            });

            const body = document.createElement('body');

            shadowRoot.appendChild(body);
            body.appendChild(realTarget);
            setMountTargetNode(realTarget);
        } else {
            node.appendChild(realTarget);
            setMountTargetNode(realTarget);
        }
    }, [createTargetNode, useShadowDom, currentMountId]);

    return {
        afterTargetMountCallback,
        mountTargetNode,
        cssTargetSelector: useShadowDom ? `[${MOUNT_ID_ATTRIBUTE}="${currentMountId}"]` : 'head',
    };
}

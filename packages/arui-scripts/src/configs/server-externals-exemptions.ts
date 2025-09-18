import { applyOverrides } from './util/apply-overrides';

export const serverExternalsExemptions = applyOverrides('serverExternalsExemptions', [
    /^arui-ft-private/,
    /^arui-private/,
    /^alfaform-core-ui/,
    /^@alfa-bank\/newclick-composite-components/,
    /^@alfa-bank\/app-html/,
    /^#/,
    /^@alfalab\/icons/,
    /^@alfalab\/core-components/,
    /^date-fns/,
    /^@corp-front\//,
    /^corp-sign-ui-react/,
    /^@alfalab\/scripts-/,
]);

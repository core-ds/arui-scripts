import applyOverrides from './util/apply-overrides';

export const serverExternalsExemptions = applyOverrides('serverExternalsExemptions', [
    /^arui-feather/,
    /^arui-ft-private/,
    /^arui-private/,
    /^alfaform-core-ui/,
    /^@alfa-bank\/newclick-composite-components/,
    /^#/,
    /^@alfalab\/icons/,
    /^@alfalab\/core-components/,
    /^date-fns/,
    /^@corp-front\//,
    /^corp-sign-ui-react/,
]);

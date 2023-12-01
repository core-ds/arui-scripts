export enum YesNoEnum {
    Yes = 'Yes',
    No = 'No',
}

export function isSmaller(a: number, b: number) {
    const calculatedA = a * 10_000;
    const calculatedB = b * 10_000;

    return calculatedA > calculatedB ? YesNoEnum.Yes : YesNoEnum.No;
}

type OptionalChainingTest = {
    foo?: {
        bar?: string;
    };
};

export function testOptionalChaining(smth: OptionalChainingTest) {
    return smth?.foo?.bar;
}

export const constObject = {
    name: 'someString',
} as const;

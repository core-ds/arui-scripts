import { validateProjectName } from '../validate-project-name';

describe('validateProjectName', () => {
    it('принимает обычное npm-имя', () => {
        expect(validateProjectName('my-app')).toBe(true);
        expect(validateProjectName('@scope/pkg')).toBe(true);
    });

    it('отклоняет пустое и невалидное имя', () => {
        expect(validateProjectName('')).not.toBe(true);
        expect(validateProjectName('Bad Name')).not.toBe(true);
        expect(validateProjectName('.start-dot')).not.toBe(true);
    });
});

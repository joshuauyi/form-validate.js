import FormValidate from '../form-validate';

// tslint:disable: no-string-literal
let validator: FormValidate;
describe('FormValidate instance check', () => {
  beforeEach(() => {
    validator = new FormValidate(
      {
        username: {
          presence: true,
        },
        password: {
          presence: true,
          length: {
            minimum: 6,
          },
        },
      },
      {},
      { username: 'john', password: 'password' },
    );
  });

  const initFalseValidator = new FormValidate(
    {
      username: {
        presence: true,
      },
      password: {
        presence: true,
        length: {
          minimum: 6,
        },
      },
    },
    {},
    { username: 'john' },
  );

  test('is instance of FormValidate', () => {
    expect(validator).toBeInstanceOf(FormValidate);
  });

  test('validates successfully', async () => {
    await validator.validate({ target: { name: 'username', value: 'Jane' } }, isValid => {
      expect(isValid).toBeTruthy();
    });
  });

  test('added input objects', () => {
    expect(validator.get('username')).toBeDefined();
    expect(validator.get('gender')).toBeNull();
  });

  test('validates immediate validator is instanciated', () => {
    expect(validator.getValid()).toBeTruthy();
    expect(initFalseValidator.getValid()).toBeFalsy();
  });

  test('empty values should be false', async () => {
    await validator.validate({ target: { name: 'username', value: '  ' } }, isValid => {
      expect(isValid).toBeFalsy();
    });
  });

  test('adds attributes with custom rule to customRules array', () => {
    const v2 = new FormValidate({
      name: { presence: true },
      gender: { custom: 'should be selected' },
      age: { custom: '18 and above' },
    });

    expect(v2['customRuleKeys'].length).toBe(2);
  });

  test('adds attributes having only custom validator as a rule to customRules array', () => {
    const v2 = new FormValidate({
      name: { presence: true, custom: 'should be selected' },
      gender: { custom: 'should be selected' },
    });

    expect(v2['customRuleKeys'].length).toBe(1);
  });

  test('can add control', () => {
    validator.addControl('gemn', { presence: true });

    expect(validator.controls.gemn).toBeDefined();
    expect(Object.keys(validator.controls).length).toBe(3);
    expect(Object.keys(validator['rules']).length).toBe(3);
    expect(validator['considered'].length).toBe(3);
  });

  test('can remove control', () => {
    const removedField = 'username';
    validator.removeControl(removedField);

    expect(Object.keys(validator.controls).length).toBe(1);
    expect(validator.controls.username).toBeUndefined();

    expect(Object.keys(validator['rules']).length).toBe(1);
    expect(validator['rules'][removedField]).toBeUndefined();

    expect(Object.keys(validator['values']).length).toBe(1);
    expect(validator['values'][removedField]).toBeUndefined();

    expect(validator['considered'].length).toBe(1);
    expect(validator['considered'].includes(removedField)).toBeFalsy();
  });
});

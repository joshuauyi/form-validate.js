import FormValidate from '../form-validate';

describe('FormValidate instance check', () => {
  const validator = new FormValidate(
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

  test('validates successfully', () => {
    validator.validate({ target: { name: 'username', value: 'Jane' } }, isValid => {
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

  test('empty values should be false', () => {
    validator.validate({ target: { name: 'username', value: '  ' } }, isValid => {
      expect(isValid).toBeFalsy();
    });
  });

  test('adds attributes with custom rule to customRules array', () => {
    const v2 = new FormValidate({ name: { presence: true }, gender: { custom: 'should be selected' }, age: { custom: '18 and above' } });

    // tslint:disable-next-line: no-string-literal
    expect(v2['customRuleKeys'].length).toBe(2);
  });
});

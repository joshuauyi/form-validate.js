import FormValidate from '../form-validate';

// tslint:disable: no-string-literal
const validator: FormValidate = new FormValidate(
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

describe('FormValidate instance check', () => {

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

  test('validates immediate validator is instantiated', () => {
    expect(validator.isValid()).toBeTruthy();
    expect(initFalseValidator.isValid()).toBeFalsy();
  });

  test('empty values should be false', () => {
    validator.validate({ target: { name: 'username', value: '  ' } }, isValid => {
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
    const v3 = new FormValidate({
      name: { presence: true },
    });

    v3.addControl('gemn', { presence: true });

    expect(v3.controls.gemn).toBeDefined();
    expect(Object.keys(v3.controls).length).toBe(2);
    expect(Object.keys(v3['rules']).length).toBe(2);
    expect(v3['considered'].length).toBe(2);
  });

  test('can remove control', () => {
    const v4 = new FormValidate({
      username: { presence: true },
      email: { presence: true },
    });

    const removedField = 'username';
    v4.removeControl(removedField);

    expect(Object.keys(v4.controls).length).toBe(1);
    expect(v4.controls.username).toBeUndefined();

    expect(Object.keys(v4['rules']).length).toBe(1);
    expect(v4['rules'][removedField]).toBeUndefined();

    expect(Object.keys(v4['values']).length).toBe(1);
    expect(v4['values'][removedField]).toBeUndefined();

    expect(v4['considered'].length).toBe(1);
    expect(v4['considered'].indexOf(removedField)).toBeLessThan(0);
  });
});

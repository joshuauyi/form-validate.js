import FormValidate from '../form-validate';
// tslint:disable: no-string-literal

describe('FormValidate Presence Contraint', () => {
  test('converts truthy presence contraint to object', () => {
    const validator = new FormValidate({
      username: {
        presence: true,
      },
      gender: {
        presence: false,
      },
      age: {
        presence: { allowEmpty: true },
      },
      department: {
        presence: { allowEmpty: false },
      },
      occupation: {
        presence: {},
      },
    });

    expect(typeof validator['rules'].username.presence).toBe('object');
    expect(validator['rules'].username.presence.allowEmpty).toBeFalsy();

    expect(typeof validator['rules'].gender.presence).toBe('boolean');
    expect(validator['rules'].gender.presence).toBeFalsy();

    expect(typeof validator['rules'].age.presence).toBe('object');
    expect(validator['rules'].age.presence.allowEmpty).toBeTruthy();

    expect(typeof validator['rules'].department.presence).toBe('object');
    expect(validator['rules'].department.presence.allowEmpty).toBeFalsy();

    expect(typeof validator['rules'].occupation.presence).toBe('object');
    expect(validator['rules'].occupation.presence.allowEmpty).toBeFalsy();
  });
});

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

describe('FormValidate', () => {
  describe('instance', () => {
    it('should be an instance of FormValidate', () => {
      expect(validator).toBeInstanceOf(FormValidate);
    });

    it('should validate successfully', done => {
      validator.render(isValid => {
        expect(isValid).toBeTruthy();
        done();
      });
      validator.validate({ target: { name: 'username', value: 'Jane' } });
    });

    it('should add defined input objects', () => {
      expect(validator.get('username')).toBeDefined();
      expect(validator.get('gender')).toBeNull();
    });

    it('should validate immediate validator is instantiated', () => {
      const vt = new FormValidate(
        { name: { presence: true }, gender: { presence: true } },
        {},
        { name: 'james', gender: 'Male' },
      );
      const vf = new FormValidate({ name: { presence: true }, gender: { presence: true } });
      expect(vt.valid()).toBeTruthy();
      expect(vf.valid()).toBeFalsy();
    });

    it('should be false when empty values are validated', done => {
      validator.render(isValid => {
        expect(isValid).toBeFalsy();
        done();
      });

      validator.validate({ target: { name: 'username', value: '  ' } });
    });
  });

  describe('attribute with custom rule', () => {
    it('should be added to customRules array', () => {
      const v2 = new FormValidate({
        name: { presence: true },
        gender: { custom: 'should be selected' },
        age: { custom: '18 and above' },
      });

      expect(v2['customRuleKeys'].length).toBe(2);
    });

    it('should still be added to customRules array if it is the only rule', () => {
      const v2 = new FormValidate({
        name: { presence: true, custom: 'should be selected' },
        gender: { custom: 'should be selected' },
      });

      expect(v2['customRuleKeys'].length).toBe(1);
    });
  });

  describe('addControl', () => {
    it('should add a control to FormValidate instance', () => {
      const v3 = new FormValidate({
        name: { presence: true },
      });

      v3.addControl('gemn', { presence: true });

      expect(v3.controls.gemn).toBeDefined();
      expect(Object.keys(v3.controls).length).toBe(2);
      expect(Object.keys(v3['rules']).length).toBe(2);
      expect(v3['considered'].length).toBe(2);
    });
  });

  describe('removeControl', () => {
    it('should remove specified control', () => {
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

      expect(Object.keys(v4.values()).length).toBe(1);
      expect(v4.values()[removedField]).toBeUndefined();

      expect(v4['considered'].length).toBe(1);
      expect(v4['considered'].indexOf(removedField)).toBeLessThan(0);
    });
  });

  describe('control with data-validate-control attribute', () => {
    test('should use custom name passed in validate-control attribute as control name', done => {
      const v5 = new FormValidate({
        customControl: { presence: true },
        email: { presence: true },
      });

      v5.render((isValid, controls) => {
        expect(controls.customControl.errors.length).toBe(0);
        done();
      });

      expect(v5.controls.customControl.errors.length).toBeGreaterThan(0);
      v5.validate({ target: { name: 'username', value: 'john', 'data-validate-control': 'customControl' } });
    });
  });

  describe('presence constraint', () => {
    it('should convert truthy presence constraint to object', () => {
      const validator6 = new FormValidate({
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

      expect(typeof validator6['rules'].username.presence).toBe('object');
      expect(validator6['rules'].username.presence.allowEmpty).toBeFalsy();

      expect(typeof validator6['rules'].gender.presence).toBe('boolean');
      expect(validator6['rules'].gender.presence).toBeFalsy();

      expect(typeof validator6['rules'].age.presence).toBe('object');
      expect(validator6['rules'].age.presence.allowEmpty).toBeTruthy();

      expect(typeof validator6['rules'].department.presence).toBe('object');
      expect(validator6['rules'].department.presence.allowEmpty).toBeFalsy();

      expect(typeof validator6['rules'].occupation.presence).toBe('object');
      expect(validator6['rules'].occupation.presence.allowEmpty).toBeFalsy();
    });
  });
});

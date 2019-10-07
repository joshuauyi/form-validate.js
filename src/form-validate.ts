/*!
 * form-validate.js 1.0.0
 *
 * (c) 2019 Joshua Uyi
 */

import validate from 'validate.js';
import ControlError from './control-error';
import { IFormControlsMap, IFormRulesMap, IFormValidateOptions, IFormValuesMap } from './models';

validate.validators.custom = (value: any, options: any, key: any, attributes: any) => {
  if (!options) {
    return null;
  }

  if (typeof options !== 'object') {
    options = { message: options };
  }

  return options.message || null;
};

class FormValidate {
  public controls: IFormControlsMap = {};
  private options: IFormValidateOptions = {};
  private considered: string[] = [];
  private rules: IFormRulesMap = {};
  private customRuleKeys: string[] = [];
  private values: IFormValuesMap = {};
  private valid = false;

  constructor(rules: IFormRulesMap, options: IFormValidateOptions = {}, defaultValues: IFormValuesMap = {}) {
    this.rules = rules;
    this.options = options;
    this.considered = Object.keys(rules);

    this.valid = true;
    for (const key of this.considered) {
      this.controls[key] = new ControlError();
      this.values[key] = defaultValues[key] || null;
      if (this.rules[key].custom) {
        this.customRuleKeys[this.customRuleKeys.length] = key;
      }
    }

    // validate all fields
    const validationErrors = validate(this.values, this.rules, this.options);
    this.valid = !validationErrors;
    if (validationErrors) {
      for (const controlKey of this.considered) {
        this.controls[controlKey].setErrors(validationErrors[controlKey] || []);
      }
    }
  }

  public get(controlName: string) {
    return this.controls[controlName] || null;
  }

  public getControls() {
    return this.controls;
  }

  public getValid() {
    return this.valid;
  }

  public touchAll(callback: (valid: boolean) => void) {
    this._toggleTouchedWithCallback(true, callback);
  }

  public unTouchAll(callback: (valid: boolean) => void) {
    this._toggleTouchedWithCallback(false, callback);
  }

  public validate(
    nativeEvent: { [key: string]: any },
    callback: ((valid: boolean, controls: IFormControlsMap) => void) | null = null,
  ) {
    const { target: control } = nativeEvent;
    const { name, type } = control || {};
    let { value } = control || {};

    if (!this.considered.includes(name)) {
      return;
    }

    if (type === 'checkbox' && control.checked === false) {
      value = null;
    }
    if (('' + value).trim() === '') {
      value = null;
    }
    this.values = { ...this.values, [name]: value };

    validate
      .async(this.values, this.rules, this.options)
      .then(() => {
        this.controls[name].updateValues(true, []);
        this.valid = true;
      })
      .catch(validationErrors => {
        if (validationErrors instanceof Error) {
          throw Error;
        }
        // validate currentlly change field
        this.controls[name].updateValues(true, validationErrors[name] || []);

        // update errors of all
        for (const key of this.customRuleKeys) {
          this.controls[key].updateValues(true, validationErrors[key] || []);
        }

        this.valid = false;
      })
      .finally(() => {
        if (callback) {
          callback(this.valid, this.controls);
        }
      });
  }

  private _toggleTouchedWithCallback(touchedState: boolean, callback: (valid: boolean) => void) {
    for (const controlKey of this.considered) {
      this.controls[controlKey].setTouched(touchedState);
    }
    if (callback) {
      callback(this.valid);
    }
  }
}
export default FormValidate;

/*!
 * form-validate.js
 *
 * (c) 2019 Joshua Uyi
 */

import validate from 'validate.js';
import ControlError from './control-error';
import { IFormControlsMap, IFormRuleItem, IFormRulesMap, IFormValidateOptions, IFormValuesMap } from './models';

validate.validators.custom = (value: string, options: any, key: string, attributes: any) => {
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
    this.options = options;

    this._addMultipleControls(Object.keys(rules), rules, defaultValues);
  }

  public addControl(controlName: string, rule: IFormRuleItem, defaultValue: string = '') {
    this._addMultipleControls([controlName], { [controlName]: rule }, { [controlName]: defaultValue });
  }

  public removeControl(controlName: string) {
    delete this.rules[controlName];
    delete this.controls[controlName];
    delete this.values[controlName];
    this.considered = this.considered.filter(item => item !== controlName);
    this.customRuleKeys = this.customRuleKeys.filter(item => item !== controlName);
  }

  public get(controlName: string) {
    return this.controls[controlName] || null;
  }

  public getControls() {
    return this.controls;
  }

  /**
   * @deprecated
   */
  public getValid() {
    return this.isValid();
  }

  public isValid() {
    return this.valid;
  }

  public touch(controlName: string, callback: (valid: boolean) => void) {
    this.controls[controlName].setTouched(true);
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
    setTimeout(() => {
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

          // update errors of all customRule fields
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
    }, 0);
  }

  private _addMultipleControls(controlNames: string[], rules: IFormRulesMap, defaultValues: IFormValuesMap = {}) {
    this.considered = [...this.considered, ...controlNames];
    this.rules = { ...this.rules, ...rules };
    for (const key of controlNames) {
      this.controls[key] = new ControlError();
      this.values[key] = defaultValues[key] || null;
      if (this.rules[key].custom && Object.keys(this.rules[key]).length === 1) {
        this.customRuleKeys[this.customRuleKeys.length] = key;
      }
    }

    // validate all fields
    const validationErrors = validate(this.values, this.rules, this.options) || {};
    this.valid = Object.keys(validationErrors).length === 0;
    for (const controlKey of controlNames) {
      this.controls[controlKey].setErrors(validationErrors[controlKey] || []);
    }
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

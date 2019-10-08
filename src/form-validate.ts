/*!
 * form-validate.js
 *
 * (c) 2019 Joshua Uyi
 */

import { Promise } from 'es6-promise';
import validateJs from 'validate.js';
import ControlError from './control-error';
import { IFormControlsMap, IFormRuleItem, IFormRulesMap, IFormValidateOptions, IFormValuesMap } from './models';

const validate: any = validateJs;
validate.Promise = Promise;

const customAsyncTasks: any = {};

const ASYNC_RESET_INDICATOR = '___ASYNC_RESET_INDICATOR_STRING_UNIQUE___';

validate.validators.custom = (value: string, options: any, key: string, attributes: any) => {
  if (!options) {
    return null;
  }

  if (typeof options !== 'object') {
    options = { message: options };
  }

  return options.message || null;
};

let synchronousValidation = true;
validate.validators.customAsync = (value: any, options: any, key: string, attributes: any) => {
  if (synchronousValidation) {
    return null;
  }

  if (customAsyncTasks[key]) {
    customAsyncTasks[key]();
    delete customAsyncTasks[key];
  }

  return new validate.Promise((resolve: any, reject: any) => {
    customAsyncTasks[key] = () => {
      reject(ASYNC_RESET_INDICATOR);
    }
    options(resolve, reject);
  });

};

class FormValidate {
  public controls: IFormControlsMap = {};
  private options: IFormValidateOptions = {};
  private considered: string[] = [];
  private rules: IFormRulesMap = {};
  private customRuleKeys: string[] = [];
  private values: IFormValuesMap = {};
  private valid = true;
  // tslint:disable-next-line: variable-name
  private _reactComponent: any = null;

  constructor(rules: IFormRulesMap, options: IFormValidateOptions = {}, defaultValues: IFormValuesMap = {}) {
    this.options = { ...options };
    this._addMultipleControls(Object.keys(rules), { ...rules }, { ...defaultValues });
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

  public setReactComponent(component: any) {
    this._reactComponent = component;
  }

  public validate(
    nativeEvent: { [key: string]: any },
    callback: ((valid: boolean, controls: IFormControlsMap) => void) | null = null,
  ) {
    setTimeout(() => {
      const { target: control } = nativeEvent;
      const { name, type } = control || {};
      let { value } = control || {};

      if (this.considered.indexOf(name) < 0) {
        return;
      }
      let controlIsLoading = false;

      if (type === 'checkbox' && control.checked === false) {
        value = null;
      }
      if (('' + value).trim() === '') {
        value = null;
      }
      this.values = { ...this.values, [name]: value };

      // place control in error mode if it has an async validation
      if (this.rules[name].hasOwnProperty('customAsync')) {
        this.controls[name].updateValues(true, []);
        this.controls[name].loading = true;
        this.valid = false;

        if (this._reactComponent) {
          this._reactComponent.setState({});
        }
      }

      validate
        .async({ [name]: value }, { [name]: this.rules[name] }, this.options)
        .then(() => {
          this.controls[name].updateValues(true, []);
          controlIsLoading = false;
        })
        .catch((err: any) => {
          if (err instanceof Error) {
            throw err;
          }

          controlIsLoading = false;
          if (err === ASYNC_RESET_INDICATOR) {
            controlIsLoading = true;
            this.controls[name].loading = true;

            return;
          }
          const validationErrors = err || {};

          // validate currentlly change field
          const fieldErrors = validationErrors[name] || [];
          this.controls[name].updateValues(true, fieldErrors);

          // update errors of all customRule fields
          for (const key of this.customRuleKeys) {
            this.controls[key].updateValues(true, validationErrors[key] || []);
          }
        })
        .finally(() => {
          this.controls[name].loading = controlIsLoading;

          this.updateValidState();

          if (this._reactComponent) {
            this._reactComponent.setState({});
          }
          if (callback) {
            callback(this.valid, this.controls);
          }
        });
    }, 0);
  }

  private updateValidState() {
    for (const key of Object.keys(this.controls)) {
      if (this.controls[key].hasError() || this.controls[key].loading) {
        this.valid = false;
        return;
      }
    }
    this.valid = true;
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
    synchronousValidation = true;
    const validationErrors = validate(defaultValues, rules, this.options) || {};
    synchronousValidation = false;

    this.valid = this.valid && Object.keys(validationErrors).length === 0;
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

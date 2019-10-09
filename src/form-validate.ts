/*!
 * form-validate.js
 *
 * (c) 2019 Joshua Uyi
 */

import { Promise } from 'es6-promise';
import validateJs from 'validate.js';
import FormControl from './form-control';
import {
  IFormControlsMap,
  IFormRuleItem,
  IFormRulesMap,
  IFormValidateOptions,
  IFormValuesMap,
  IValidateJS,
} from './models';

const validate: IValidateJS = validateJs;
validate.Promise = Promise;

const customAsyncTasks: any = {};
const ASYNC_RESET_INDICATOR = '___ASYNC_RESET_INDICATOR_UNIQUE_STRING___';
let synchronousValidation = true;
let instanceCount = 0;

validate.validators.custom = (value: string, options: any, key: string, attributes: any) => {
  if (!options) {
    return null;
  }

  if (typeof options !== 'object') {
    options = { message: options };
  }

  return options.message || null;
};

validate.validators.customAsync = (
  value: any,
  options: any,
  key: string,
  attributes: any,
  globalOptions: IFormValidateOptions,
) => {
  if (synchronousValidation) {
    return null;
  }

  const asyncFuncKey = key + globalOptions.instanceCount;

  if (customAsyncTasks[asyncFuncKey]) {
    customAsyncTasks[asyncFuncKey]();
    delete customAsyncTasks[asyncFuncKey];
  }

  return new validate.Promise((resolve: any, reject: any) => {
    customAsyncTasks[asyncFuncKey] = () => {
      reject(ASYNC_RESET_INDICATOR);
    };
    if (typeof options === 'function') {
      options(resolve);
    } else {
      resolve(options);
    }
  });
};

class FormValidate {
  public controls: IFormControlsMap = {};
  private options: IFormValidateOptions = {};
  private considered: string[] = [];
  private rules: IFormRulesMap = {};
  private customRuleKeys: string[] = [];
  private customAsyncRuleKeys: string[] = [];
  private values: IFormValuesMap = {};
  private valid = true;
  // tslint:disable-next-line: variable-name
  private _reactComponent: any = null;

  constructor(rules: IFormRulesMap, options: IFormValidateOptions = {}, defaultValues: IFormValuesMap = {}) {
    this.options = { ...options, instanceCount: ++instanceCount };

    this._addMultipleControls(Object.keys(rules), { ...rules }, { ...defaultValues });
  }

  public addControl(controlName: string, rule: IFormRuleItem, defaultValue: string = '') {
    this._addMultipleControls([controlName], { [controlName]: rule }, { [controlName]: defaultValue });
  }

  public removeControl(controlName: string) {
    if (!this.considered.includes(controlName)) {
      return;
    }

    delete this.rules[controlName];
    delete this.controls[controlName];
    delete this.values[controlName];
    this.considered = this.considered.filter(item => item !== controlName);
    this.customRuleKeys = this.customRuleKeys.filter(item => item !== controlName);
    this.customAsyncRuleKeys = this.customAsyncRuleKeys.filter(item => item !== controlName);
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
    if (!component.setState) {
      return;
    }
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

      this.values = { ...this.values, [name]: value };

      // place control in error mode if it has an async validation
      if (this.rules[name].hasOwnProperty('customAsync')) {
        this.controls[name].setLoading(true);
        this.updateValidState();

        if (this._reactComponent) {
          this._reactComponent.setState({});
        }
      }

      const toValidateRules = Object.assign({}, this.rules);

      // only process async validator of field currently edited, mark others as false
      for (const asyncValidatorKey of this.customAsyncRuleKeys) {
        if (asyncValidatorKey !== name) {
          toValidateRules[asyncValidatorKey] = Object.assign({}, toValidateRules[asyncValidatorKey], {
            customAsync: null,
          });
        }
      }

      let foundErrors: any = {};
      validate
        .async(this.values, toValidateRules, this.options)
        .then(() => {
          this.controls[name].setTouched(true).setErrors([]);
        })
        .catch((err: any) => {
          if (err instanceof Error) {
            throw err;
          }
          if (err === ASYNC_RESET_INDICATOR) {
            controlIsLoading = true;
            this.controls[name].setLoading(true);

            return;
          }
          foundErrors = err || {};

          // validate currentlly change field
          this.controls[name].setTouched(true).setErrors(foundErrors[name] || []);
        })
        .finally(() => {
          // update errors of all customRule fields
          for (const key of this.customRuleKeys) {
            this.controls[key].setTouched(true).setErrors(foundErrors[key] || []);
          }

          this.controls[name].setLoading(controlIsLoading);

          this.updateValidState();

          if (this._reactComponent) {
            this._reactComponent.setState({}, () => {
              if (callback) {
                callback(this.valid, this.controls);
              }
            });
          } else {
            if (callback) {
              callback(this.valid, this.controls);
            }
          }
        });
    }, 0);
  }

  private updateValidState() {
    for (const key of this.considered) {
      if (this.controls[key].hasError() || this.controls[key].isLoading()) {
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
      this.values[key] = defaultValues[key] || null;
      this.controls[key] = new FormControl();
      if (this.rules[key].custom && Object.keys(this.rules[key]).length === 1) {
        this.customRuleKeys.push(key);
      }

      if (this.rules[key].presence) {
        if (this.rules[key].presence === true) {
          this.rules[key].presence = { allowEmpty: false };
        } else if (typeof this.rules[key].presence === 'object') {
          this.rules[key].presence = { allowEmpty: false, ...this.rules[key].presence };
        }
      }

      if (this.rules[key].customAsync) {
        this.customAsyncRuleKeys.push(key);
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

  private _toggleTouchedWithCallback(
    touchedState: boolean,
    callback: (valid: boolean, controls: IFormControlsMap) => void,
  ) {
    for (const controlKey of this.considered) {
      this.controls[controlKey].setTouched(touchedState);
    }

    if (this._reactComponent) {
      this._reactComponent.setState({}, () => {
        if (callback) {
          callback(this.valid, this.controls);
        }
      });
    } else {
      if (callback) {
        callback(this.valid, this.controls);
      }
    }
  }
}
export default FormValidate;

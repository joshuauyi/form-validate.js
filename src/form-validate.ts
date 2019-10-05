/*!
 * form-validate.js 1.0.0
 *
 * (c) 2019 Joshua Uyi
 */

import validate, { ValidateOption } from 'validate.js';
import InputError from './input-error';
import { IFormInputsMap, IFormRulesMap, IFormValuesMap } from './models';

validate.validators.custom = (value: any, options: any, key: any, attributes: any) => {
  if (!options) { return null; }

  if (typeof options !== 'object') { options = { message: options }; }

  if (typeof options.message !== 'function' && options.message.indexOf('^') !== 0) { options.message = '^' + options.message; }

  return options.message || null;
}

class FormValidate {
  public inputs: IFormInputsMap = {};
  private options: ValidateOption = {};
  private considered: string[] = [];
  private rules: IFormRulesMap = {};
  private customRuleKeys: string[] = [];
  private values: IFormValuesMap = {};
  private valid = false;

  constructor(rules: IFormRulesMap, options: ValidateOption = {}, defaultValues: IFormValuesMap = {}) {
    this.rules = rules;
    this.options = options;
    this.considered = Object.keys(rules);

    this.valid = true;
    for (const key of this.considered) {
      this.inputs[key] = new InputError();
      this.values[key] = defaultValues[key] || null;
      if (this.rules[key].custom) { this.customRuleKeys[this.customRuleKeys.length] = key; }
    }

    // validate all fields
    const validationErrors = validate(this.values, this.rules, this.options);
    this.valid = !validationErrors;
    if (validationErrors) {
      for (const inputKey of this.considered) {
        this.inputs[inputKey].setErrors(validationErrors[inputKey] || []);
      }
    }
  }

  public get(inputName: string) {
    return this.inputs[inputName] || null;
  }

  public getInputs() {
    return this.inputs;
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

  public validate(nativeEvent: { [key: string]: any }, callback: ((valid: boolean) => void) | null = null) {
    const { target: input } = nativeEvent;
    const { name, type } = input || {};
    let { value } = input || {};

    if (!this.considered.includes(name)) {
      return;
    }

    if (type === 'checkbox' && input.checked === false) {
      value = null;
    }
    if (('' + value).trim() === '') {
      value = null;
    }
    this.values = { ...this.values, [name]: value };

    validate
      .async(this.values, this.rules, this.options)
      .then(() => {
        this.inputs[name].updateValues(true, []);
        this.valid = true;
      })
      .catch(validationErrors => {
        if (validationErrors instanceof Error) {
          throw Error;
        }
        // validate currentlly change field
        this.inputs[name].updateValues(true, validationErrors[name] || []);

        // update errors of all 
        for (const key of this.customRuleKeys){
          this.inputs[key].setErrors(validationErrors[key] || []);
        }

        this.valid = false;
      })
      .finally(() => {
        if (callback) {
          callback(this.valid);
        }
      });
  }

  private _toggleTouchedWithCallback(touchedState: boolean, callback: (valid: boolean) => void) {
    for (const inputKey of this.considered) {
      this.inputs[inputKey].setTouched(touchedState);
    }
    if (callback) {
      callback(this.valid);
    }
  }
}
export default FormValidate;

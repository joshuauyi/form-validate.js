/*!
 * form-validate.js 1.0.0
 *
 * (c) 2019 Joshua Uyi
 */

import validate, { ValidateOption } from 'validate.js';
import InputError from './input-error';
import { IFormInputsMap, IFormRulesMap, IFormValuesMap } from './models';

class FormValidate {

    private options: ValidateOption = {};
    private considered: string[] = [];
    inputs: IFormInputsMap = {};
    private rules: IFormRulesMap = {};
    private values: IFormValuesMap = {};
    private valid = false;
    private firstValidateDone = false;

    constructor(rules: IFormRulesMap, options: ValidateOption = {}, defaultValues: IFormValuesMap = {}) {
        this.rules = rules;
        this.options = options;
        this.considered = Object.keys(rules);

        for (const key of this.considered) {
            this.inputs[key] = new InputError();
            this.values[key] = defaultValues[key] || null;
        }
    }

    get(inputName: string) {
        return this.inputs[inputName];
    }

    getInputs() {
        return this.inputs;
    }

    touchAll() {
        for (const inputKey of Object.keys(this.inputs)) {
            this.inputs[inputKey].setTouched(true);
        }
    }

    validate(nativeEvent: { [key: string]: any }, callback: (valid: boolean) => void, values: IFormValuesMap | null = null) {
        const { target: input } = nativeEvent;
        const { name, type } = input || {};
        let { value } = input || {};

        // use values user specifies, otherwise use values from the form
        if (values) {
            this.values = values;
        } else {
            if (!this.considered.includes(name)) { return; }

            if (type === 'checkbox' && input.checked === false) { value = null; }
            if (('' + value).trim() === '') { value = null; }
            this.values = { ...this.values, [name]: value };
        }

        validate.async(this.values, this.rules, this.options)
            .then(() => {
                this.inputs[name].updateValues(true, []);
                this.valid = true;
            })
            .catch((validationErrors) => {
                if (validationErrors instanceof Error) {
                    throw Error;
                }

                if (this.firstValidateDone) {
                    // validate currentlly change field
                    this.inputs[name].updateValues(true, validationErrors[name] || []);
                } else {
                    // validate all fields
                    for (const inputKey of this.considered) {
                        this.inputs[inputKey].updateValues(inputKey === name, validationErrors[inputKey] || []);
                    }
                    this.firstValidateDone = true;
                }
                this.valid = false;
            })
            .finally(() => {
                if (callback) { callback(this.valid); }
            });
    }

}
export default FormValidate;

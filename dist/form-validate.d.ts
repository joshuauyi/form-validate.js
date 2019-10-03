/*!
 * form-validate.js 1.0.0
 *
 * (c) 2019 Joshua Uyi
 */
import { ValidateOption } from 'validate.js';
import InputError from './input-error';
import { IFormInputsMap, IFormRulesMap, IFormValuesMap } from './models';
declare class FormValidate {
    private options;
    private considered;
    inputs: IFormInputsMap;
    private rules;
    private values;
    private valid;
    private firstValidateDone;
    constructor(rules: IFormRulesMap, options?: ValidateOption, defaultValues?: IFormValuesMap);
    get(inputName: string): InputError;
    getInputs(): IFormInputsMap;
    touchAll(): void;
    validate(nativeEvent: {
        [key: string]: any;
    }, callback: (valid: boolean) => void, values?: IFormValuesMap | null): void;
}
export default FormValidate;

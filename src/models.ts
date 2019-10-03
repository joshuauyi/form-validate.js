import InputError from './input-error';

export interface IFormInputsMap {
    [key: string]: InputError;
}

export interface IFormValuesMap {
    [key: string]: string | null;
}

export interface IFormRulesMap {
    [key: string]: {};
}

import { AsyncValidateOption, ValidateJS, ValidateOption } from 'validate.js';
import FormControl from './form-control';

export interface IFormControlsMap {
  [key: string]: FormControl;
}

export interface IFormValuesMap {
  [key: string]: string | null;
}

export interface IFormRuleItem {
  [key: string]: any;
}

export interface IFormRulesMap {
  [key: string]: IFormRuleItem;
}

interface ICustomValidateOption {
  instanceCount?: number;
  syncValidateOnly?: boolean;
}

export type IFormValidateOptions = ValidateOption & AsyncValidateOption & ICustomValidateOption;

export interface IValidateJS extends ValidateJS {
  Promise?: any;
}

export type IValidationCallback = ((valid: boolean, controls: IFormControlsMap) => void) | null;

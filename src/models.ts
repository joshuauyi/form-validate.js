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

interface IInstanceCountOption {
  instanceCount?: number;
}

export type IFormValidateOptions = ValidateOption & AsyncValidateOption & IInstanceCountOption;

export interface IValidateJS extends ValidateJS {
  Promise?: any;
}

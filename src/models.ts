import { AsyncValidateOption, ValidateOption } from 'validate.js';
import ControlError from './control-error';

export interface IFormControlsMap {
  [key: string]: ControlError;
}

export interface IFormValuesMap {
  [key: string]: string | null;
}

export interface IFormRulesMap {
  [key: string]: { [key: string]: any };
}

export type IFormValidateOptions = ValidateOption & AsyncValidateOption;

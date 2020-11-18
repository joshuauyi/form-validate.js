import FormValidate from './form-validate';

type FVWindow = typeof window & {
  FormValidate: typeof FormValidate;
};

(window as FVWindow).FormValidate = FormValidate;

export default FormValidate;

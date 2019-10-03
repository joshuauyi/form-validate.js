declare class InputError {
    touched: boolean;
    errors: string[];
    constructor(touched?: boolean, errors?: never[]);
    setTouched(touched: boolean): void;
    updateValues(touched: boolean, errors: string[]): void;
    hasError(): boolean;
}
export default InputError;

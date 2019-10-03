class InputError {
    touched = false;
    errors: string[] = [];

    constructor(touched = false, errors = []) {
        this.touched = touched;
        this.errors = errors;
    }

    setTouched(touched: boolean) {
        this.touched = touched;
    }

    updateValues(touched: boolean, errors: string[]) {
        this.touched = touched;
        this.errors = errors;
    }

    hasError() {
        return this.errors.length > 0;
    }

}

export default InputError;

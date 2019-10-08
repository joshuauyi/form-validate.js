class ControlError {
  public touched = false;
  public errors: string[] = [];
  public loading = false;

  constructor(touched = false, errors = []) {
    this.touched = touched;
    this.errors = errors;
  }

  public setTouched(touched: boolean) {
    this.touched = touched;
  }

  public setErrors(errors: string[]) {
    this.errors = errors;
  }

  public updateValues(touched: boolean, errors: string[]) {
    this.touched = touched;
    this.errors = errors;
  }

  public hasError() {
    return this.errors.length > 0;
  }

  public touchedAndHasError() {
    return this.touched && this.hasError();
  }
}

export default ControlError;

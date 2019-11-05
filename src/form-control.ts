class FormControl {
  public touched = false;
  public errors: string[] = [];
  public loading = false;

  constructor(touched = false, errors = []) {
    this.touched = touched;
    this.errors = errors;
  }

  public setTouched(touched: boolean) {
    this.touched = touched;
    return this;
  }

  public setErrors(errors: string[]) {
    this.errors = errors;
    return this;
  }

  public setLoading(loading: boolean) {
    this.loading = loading;
    return this;
  }

  public hasError(): boolean {
    return this.errors.length > 0;
  }

  public isLoading(): boolean {
    return this.loading;
  }

  public touchedAndHasError() {
    return this.touched && this.hasError();
  }

  public untouchedAndHasError() {
    return !this.touched && this.hasError();
  }

  /**
   * @deprecated
   */
  public touchedAndWithoutError() {
    return this.touchedAndNoError();
  }

  public touchedAndNoError() {
    return this.touched && !this.hasError();
  }

  /**
   * @deprecated
   */
  public untouchedAndWithoutError() {
    return this.untouchedAndNoError();
  }

  public untouchedAndNoError() {
    return !this.touched && !this.hasError();
  }
}

export default FormControl;

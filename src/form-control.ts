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

  /**
   * @deprecated
   * 
   * @param touched
   * @param errors 
   */
  public _updateValues(touched: boolean, errors: string[]) {
    this.touched = touched;
    this.errors = errors;
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
}

export default FormControl;
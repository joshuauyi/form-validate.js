class ControlError {
  public name: string;
  public value: any;
  public touched = false;
  public errors: string[] = [];
  public loading = false;

  constructor(name: string, value: any = null, touched = false, errors = []) {
    this.name = name;
    this.value = value;
    this.touched = touched;
    this.errors = errors;
  }

  public setName(name: string) {
    this.name = name;
    return this;
  }

  public setValue(value: string) {
    this.value = value;
    return this;
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

export default ControlError;

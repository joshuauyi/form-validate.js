"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InputError = /** @class */ (function () {
    function InputError(touched, errors) {
        if (touched === void 0) { touched = false; }
        if (errors === void 0) { errors = []; }
        this.touched = false;
        this.errors = [];
        this.touched = touched;
        this.errors = errors;
    }
    InputError.prototype.setTouched = function (touched) {
        this.touched = touched;
    };
    InputError.prototype.updateValues = function (touched, errors) {
        this.touched = touched;
        this.errors = errors;
    };
    InputError.prototype.hasError = function () {
        return this.errors.length > 0;
    };
    return InputError;
}());
exports.default = InputError;

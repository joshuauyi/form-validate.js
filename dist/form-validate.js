"use strict";
/*!
 * form-validate.js 1.0.0
 *
 * (c) 2019 Joshua Uyi
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var validate_js_1 = __importDefault(require("validate.js"));
var input_error_1 = __importDefault(require("./input-error"));
var FormValidate = /** @class */ (function () {
    function FormValidate(rules, options, defaultValues) {
        if (options === void 0) { options = {}; }
        if (defaultValues === void 0) { defaultValues = {}; }
        this.options = {};
        this.considered = [];
        this.inputs = {};
        this.rules = {};
        this.values = {};
        this.valid = false;
        this.firstValidateDone = false;
        this.rules = rules;
        this.options = options;
        this.considered = Object.keys(rules);
        for (var _i = 0, _a = this.considered; _i < _a.length; _i++) {
            var key = _a[_i];
            this.inputs[key] = new input_error_1.default();
            this.values[key] = defaultValues[key] || null;
        }
    }
    FormValidate.prototype.get = function (inputName) {
        return this.inputs[inputName];
    };
    FormValidate.prototype.getInputs = function () {
        return this.inputs;
    };
    FormValidate.prototype.touchAll = function () {
        for (var _i = 0, _a = Object.keys(this.inputs); _i < _a.length; _i++) {
            var inputKey = _a[_i];
            this.inputs[inputKey].setTouched(true);
        }
    };
    FormValidate.prototype.validate = function (nativeEvent, callback, values) {
        var _a;
        var _this = this;
        if (values === void 0) { values = null; }
        var input = nativeEvent.target;
        var _b = input || {}, name = _b.name, type = _b.type;
        var value = (input || {}).value;
        // use values user specifies, otherwise use values from the form
        if (values) {
            this.values = values;
        }
        else {
            if (!this.considered.includes(name)) {
                return;
            }
            if (type === 'checkbox' && input.checked === false) {
                value = null;
            }
            if (('' + value).trim() === '') {
                value = null;
            }
            this.values = __assign(__assign({}, this.values), (_a = {}, _a[name] = value, _a));
        }
        validate_js_1.default.async(this.values, this.rules, this.options)
            .then(function () {
            _this.inputs[name].updateValues(true, []);
            _this.valid = true;
        })
            .catch(function (validationErrors) {
            if (validationErrors instanceof Error) {
                throw Error;
            }
            if (_this.firstValidateDone) {
                // validate currentlly change field
                _this.inputs[name].updateValues(true, validationErrors[name] || []);
            }
            else {
                // validate all fields
                for (var _i = 0, _a = _this.considered; _i < _a.length; _i++) {
                    var inputKey = _a[_i];
                    _this.inputs[inputKey].updateValues(inputKey === name, validationErrors[inputKey] || {});
                }
                _this.firstValidateDone = true;
            }
            _this.valid = false;
        })
            .finally(function () {
            if (callback) {
                callback(_this.valid);
            }
        });
    };
    return FormValidate;
}());
exports.default = FormValidate;

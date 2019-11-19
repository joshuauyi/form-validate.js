# form-validate.js

form-validate.js is a form validation library, for validating web client forms.

## Introduction

form-validate.js was created to give an effective yet convenient way of validating forms (in react components and html). The library is flexible and gives you control of its effects including what errors are shown, it's styling, and flow.
_Scroll to the bottom of this page to see a sample react component with form validation_

## Requirements

- Node and npm
- Transpilation (conventionally with babel). [create-react-app](https://github.com/facebook/create-react-app) has this setup already.

## Installation

    npm install form-validate.js

## Dependency

form-validate.js relies on [validate.js](https://github.com/ansman/validate.js) for its validation rules and is shipped together with the library.

## Usage

_The examples in this doc are targeted for react however, the principles can be applied to forms using other tools including vanilla JS_

#### Validating forms

- **Import form-validate.js to your js code**

```javascript
import FormValidate from 'form-validate.js';
```

- **Create a constant for an instance of FormValidate class**

```javascript
const validator = new FormValidate(<constraints>, <options>, <defaultValues>);
```

> **constraints** is an object holding validation rules.
>
> **Note**: all rules are based on [validate.js](https://github.com/ansman/validate.js) rules, access the docs [here](https://validatejs.org/#validators) to know what rules are usable and how to customize validation error messages. However, there are two rules **custom** and **customAsync** peculiar to form-validate.js

```javascript
const constraint = {
  username: {
    presence: true,
  },
  password: {
    presence: true,
    length: {
      minimum: 8,
    },
  },
};
```

> **options** _(optional)_ is an object which indicates how the validate.js library handles validation errors and messages. Allowed options include **fullMessages**, **prettify** and **format** as seen [here](https://validatejs.org/#validate)

> **defaultValues** _(optional)_ an object which indicates the values to be validated against initially, if not provided, all field values would be treated as null.

```javascript
const defaultValues = {
  username: 'john',
  password: 'password',
};
```

#### custom and customAsync constriants

with the custom rule, you can have validation based on conditions you provide, simply return a string or array of messages of the error if validation fails or null if validation passes

customAsync rule makes you perform validation asynchronously in case you need to call endpoint to validate a field. To do this, return a function in which you resolve a string or array of messages if validation fails or simple call `resolve()` if there are no errors. You can still return plain values, in which case customAsync handles the validation as synchronous
Sample custom and customAsync rules are shown below

```javascript
const constraint = {
  username: {
    customAsync: (value, attributes, attributeName) => {
      if (value && value.trim() === '') return;
      return function(resolve) {
        setTimeout(() => {
          if (['joshua', 'john', 'rita'].includes(value)) {
            resolve('%{value} is taken');
          } else {
            resolve();
          }
        }, 1000);
      };
    },
  },
  unique: {
    custom: (value, attributes, attributeName) => {
      if (attributes.username === attributes.password) {
        return '^the username and password cannot be thesame';
      }
      return null;
    },
  },
};
```

> custom constraint can be used on a control not associated with any input, provided it is the only constrain specified on the control

> customAsync should return a function taking resolve as an argument, resolve should be called to indicate validation is done passing in the validation errors or without any argument if the validation passes.

- **Using the validator**

Ensure the name of the input field corresponds to the object key in the validation constraints otherwise, the validator would not be associated with an input field unless it meets the condition to act as a stand-alone custom validator as stated above

```javascript
<input type="text" name="username" />
```

If for any reason the name given to the input does not match the validation constraint key, use the `validate-control` or `data-validate-control` attribute on the input element to specify the constrian key the input is associated with.

```javascript
<input type="text" name="alt-input-name" validate-control="username" />
```

> the validation instance has a controls property `validator.controls` that holds the control object of each field. The control object has three important fields
>
> - **errors** - an array holding all validation errors of the field
> - **touched** - indicating if the control field has been interacted with
> - **loading** - indicating if an asynchronous validation is processing

getting a reference to a control associated with a field can be done thus

```javascript
const usernameControl = validator.controls.username;
```

OR

```javascript
const usernameControl = validator.get('username');
```

The errors, touched, loading and other properties and methods of the control can be access from the control object directly

```javascript
const usernameErrors = validator.controls.username.errors;

const usernameTouched = validator.controls.username.touched;
```

The errors can be displayed in a react app as follows

```javascript
<div>{usernameTouched && usernameErrors.map((error, i) => <div key={i}>{error}</div>)}</div>
```

> the _touched_ check should be done, otherwise errors would show up without the user interacting with the form.

- **Validating a form**
  To validate input values in a form, add an onChange listener to the form and call the validate method in its callback passing the event and a callback function to be executed once validation is done.
  > **Note:** Other listeners e.g. onBlur can be used to perform validation at the occurence of corresponding events.

```javascript
onChange = event => {
  // Note: in a react app, the event should be the native event which can be gotten with event.nativeEvent
  // callback to be run once validation is done, the valid argument indicates if the form is valid or not, and controls is a collection of all form controls
  validator.validate(event.nativeEvent, (valid, controls) => {
    // perform logic to display errors to the users here.
    // in a react app this can be as easy as forcing the component to rerender.
    // for a regular html form, certain elements can be updated to contain the validation error in controls; controls.get('control).errors;
    this.forceUpdate();
  });
};
```

A check can also be added on submit of the form, in case the user tends to bypass onchange validation. Conventionally, all errors should show up after submitting the form, this can be done by calling the `validator.touchAll(callback)` function in the onsubmit handler which bypassing the touched check

```javascript
onSubmit  = (event) => {
  event.preventDefault();
  if (!validator.valid()) {
      // Thesame callback used in the validate function can be used here
    validator.touchAll((valid, controls) => {
      // a good place to update the validation being displayed.
      this.forceUpdate();
    });
    return;
  }
    ...
}
```

### Custom and Variable controls

You may need to include custom contraints later on in your code, luckily, form-validator.js provides a means of accomplishing this, you can always add controls and contraints using the `validator.addControl` function and remove existing ones with `validator.removeControl` at appropriate places in your code

validator.addControl takes in 3 arguments, **controlName**, **rule** and **defaultValue**
validator.removeControl takes in only the **controlName** as an argument

```javascript
validator.addControl('my-custom-control', {presence: true}, 'default-value');
...
validator.removeControl('existing-control');
```

## Deprecated methods
- `validator.setReactComponent` 
- `validator.getValid`
- `validator.isValid`


#### See an example of full react component with form validation below

```javascript
import React from 'react';
import FormValidate from 'form-validate.js';

const constraint = {
  username: {
    presence: true,
    // async validation
    customAsync: (value, attributes, attributeName) => {
      return resolve => {
        if (value.trim() === "") {
          resolve();
          return;
        }

        setTimeout(() => {
          if (['joshua', 'john', 'rita'].includes(value)) {
            resolve('%{value} is taken');
          } else {
            resolve();
          }
        }, 1000);
      };
    },
  },
  password: {
    presence: true,
    length: {
      minimum: 8,
    },
  },
  unique: {
    // custom validation can work on controls not associate with an input field if it is the only rule specified otherwise, it must be associated with an input field
    custom: (value, attributes, attributeName) => {
      if (attributes.username === attributes.password) {
        return '^the username and password cannot be thesame';
      }
      return null;
    },
  },
};

class Component extends React.Component {
  validator = new FormValidate(constraint);

  render() {
    // destructure out the controls property
    const { controls } = this.validator;

    return (
      <div>
        <form onChange={this.validateForm} onSubmit={this.onSubmit} autoComplete="off">
          <input type="text" name="username" />
          {/* display loader if username control is loading or all username errors if field is touched */}
          {controls.username.loading ? (
            <div>checking...</div>
          ) : (
            <div>
              {controls.username.touched && controls.username.errors.map((error, i) => <div key={i}>{error}</div>)}
            </div>
          )}
          <input type="password" name="password" />
          {/* display first password error at all times if any exists */}
          <div>{controls.password.errors[0]}</div>
          <div>{controls.unique.touched && controls.unique.errors[0]}</div>
          {/* disable submit button based on the form valid state */}
          <button disabled={!this.validator.valid()}>Submit</button>
        </form>
      </div>
    );
  }

  validateForm = event => {
    // get nativeEvent out of the react change event.
    this.validator.validate(event.nativeEvent, (valid, controls) => {
      // rerender validation errors and perform actions after validation
      this.forceUpdate();
    });
  };

  onSubmit = event => {
    event.preventDefault();
    if (!this.validator.valid()) {
      this.validator.touchAll((valid, controls) => {
        // do something after touching all and rerender validation errors
        this.forceUpdate();
      });
      return;
    }
    // ...
  };
}

export default Component;
```

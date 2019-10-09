# form-validate.js

form-validate.js is a form validation library, it was built keeping react in mind, however can be used with all forms.

### Introduction

form-validate.js was create to give an effective yet convenient way of validating forms (primarily in react components). The library is flexible and gives you control of its effects including what errors are shown, its styling, and flow.
_Scroll to the bottom of this page to see a sample react component with form validation_

### Requirements

- Node and npm
- Transpilation (conventionally with babel). [create-react-app](https://github.com/facebook/create-react-app) has this setup already.

## Installation

    npm install form-validate.js

## Dependency

form-validate.js relies on [validate.js](https://github.com/ansman/validate.js) for its validation rules and is shipped together with the libarary.

## Usage

_The examples in this doc are targeted for react, however the principles can be applied to forms using other tools_

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
> **Note**: all rules are based on [validate.js](https://github.com/ansman/validate.js) rules, access the docs [here](https://validatejs.org/#validators) to know what rules are usabled and how to customize validation error messages. However there are two rules **custom** and **customAsync** perculiar to form-validate.js

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

> **defaultValues** _(optioinal)_ an object which indicates the values to be validated against initially, if not provided, all field values would be treated initally as null.

```javascript
const defaultValues = {
  username: 'john',
  password: 'password',
};
```

#### custom and customAsync constriants

with the custom rule, you can have validation based on conditions you provide, simply return a string or array of messages of the error if validation fails or null if validation passes

customAsync rule makes you perform validation asynchronously incase you need to call endpoint to validate a field. To do this, return a function in which you resolve a string or array of messages if validation fails or simple call `resolve()` if there are no errors. You can still return plain values, in which case customAsync handles the validation as syncrounouse
Sample custom and customAsync rules are shown below

```javascript
const constraint = {
  username: {
    customAsync: (value, attributes, attributeName, options, constraints) => {
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
    custom: (value, attributes, attributeName, options, constraints) => {
      if (attributes.username === attributes.password) {
        return '^the username and password cannot be thesame';
      }
      return null;
    },
  },
};
```

> **Note:** custom constraint can be used on a control not associated with any input provided it is the only contriain specified

> **Note:** in customAsync, return a function taking resolve as an argument, resolve should be called to indicate validation is done passing in the validation errors or without any argument if the validation passes.

- **Using the validator**
  Ensure the name of the input field corresponds to the object key in the validation constriants otherwise the validator would not be associated with an input field, unless it meets the condition to act as a stand alone custom validator as stated above

```javascript
<input type="text" name="username" />
```

> the validation instance has a controls property `validator.controls` that holds the control error object of each field. The control error object has three important fields
>
> - **errors** - an array holding all validation errors of the field
> - **touched** - indicating if the control field has been interacted with
> - **loading** - indicating if an asynchronous validation is processing

getting a reference to a control associated with a field can be done thus

```javascript
const usernameErrors = validator.controls.username.errors;
```

same can be done to access the touched property

```javascript
const usernameTouched = validator.controls.username.touched;
```

The errors can be displayed in a react app as follows

```javascript
<div>{usernameTouched && usernameErrors.map((error, i) => <div key={i}>{error}</div>)}</div>
```

> **Note:** the _touched_ check should be done, otherwise errors would show up without the user interacting with the form.

> **Note:** in a react app, ensure to call the `validator.setReactComponent` function to the indicate the component containing the form, this is very important and should be done in the component's contructor

```javascript
constructor(props) {
  super(props);
  validator.setReactComponent(this);
}
```

- **Validating a form**
  To validate input values in a form, add an onChange listener to the form and call the validate method in its callback passing the event and a callback function to be executed once validation is done

```javascript
onChange = event => {
  // Note: in a react app, the event should be the native event which can be gotten with event.nativeEvent
  validator.validate(event.nativeEvent, (valid, controls) => {
    // callback to be run once validation is done, the valid argument indicates if the form is valid or not, and controls is a collection of all form controls
  });
};
```

A check can also be added on submit of the form, incase the user tends to bypase onchange validation. Conventionally, all errors should show up after submitting the form, this can be done by calling the `validator.touchAll(callback)` function in the onsubmit handler which bypassing the touched check

```javascript
onSubmit  = (event) => {
	event.preventDefault();
	if (!validator.valid) {
		validator.touchAll((valid, controls) => {
			// a good place to update the validation being displayed, this is automatically done in a react app, provided the associated component was declared
		});
		return;
	}
	...
}
```

### Custom and Variable controls

You may have a need to include custom contraints later on in your code, luckily, form-validator.js provides a means of accomplishing this, you can always add controls and contraints using the `validator.addControl` function and remoe existing ones with `validator.removeControl` at appropriate places in your code

validator.addControl takes in 3 arguements, **controlName**, **rule** and **defaultValue**
validator.removeControl takes in only the **controlName** as an argument

```javascript
validator.addControl('my-custom-control', {presence: true}, 'default-value');
...
validator.removeControl('existing-control');
```

**See example of full react component with form validation below**

```javascript
import React from 'react';
import FormValidate from 'form-validate.js';

const constraint = {
  username: {
    presence: true,
    // async validation
    customAsync: (value, attributes, attributeName, options, constraints) => {
      // it is possible for value to be null or undefined
      value = value || '';
      if (value.trim() === '') return;

      return resolve => {
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
    // custom validation can work on controls not associate with an input field if it is the only rule specified, otherwise it must be associated with an input field
    custom: (value, attributes, attributeName, options, constraints) => {
      if (attributes.username === attributes.password) {
        return '^the username and password cannot be thesame';
      }
      return null;
    },
  },
};

const validator = new FormValidate(constraint);

class Component extends React.Component {
  constructor(props) {
    super(props);
    // associate validator with the react component containing the form
    // this is important if form-validator.js is being used with react
    validator.setReactComponent(this);
  }

  render() {
    // destructure out the controls property
    const { controls } = validator;

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
          <button disabled={!validator.valid}>Submit</button>
        </form>
      </div>
    );
  }

  validateForm = event => {
    // get nativeEvent out of the react change event.
    validator.validate(event.nativeEvent, (valid, controls) => {
      // perform actions after validation
    });
  };

  onSubmit = event => {
    event.preventDefault();
    if (!validator.valid) {
      validator.touchAll((valid, controls) => {
        // do something after touching all
      });
      return;
    }
    // ...
  };
}

export default Component;
```

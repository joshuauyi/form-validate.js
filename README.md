# form-validate.js
form-validate.js is a form validation library, it was built keeping react in mind, however can be used with all forms.

### Introduction
form-validate.js was create to give an effective yet convenient way of validating forms (primarily in react components). The library is flexible and gives you control of its effects including what errors are shown, its styling, and flow.
*Scroll to the bottom of this page to see a sample react component with form validation*

### Requirements

 - Node and npm
 - Transpilation (conventionally with babel). [create-react-app](https://github.com/facebook/create-react-app) has this setup already.

## Installation

    npm install form-validate.js

## Dependency
form-validate.js relies on [validate.js](https://github.com/ansman/validate.js) for its validation rules and is shipped together with the libarary.

## Usage
*The examples in this doc are targeted for react, however the principles can be applied to forms using other tools*

#### Validating forms in a react component

- **Import form-validate.js to your js code**
 ```javascript
import FormValidate from 'form-validate.js'
```    
-  **Create a constant for an instance of FormValidate class**
 
```javascript
const validator = new FormValidate(<constraints>, <options>, <defaultValues>);
```
> **constraints** is an object holding validation rules.
> 
> **Note**: all rules are based on [validate.js](https://github.com/ansman/validate.js) rules, access the docs [here](https://validatejs.org/#validators) to know what rules are usabled and how to customize validation error messages.

```javascript
const constraint = {
	username: {
		presence: true
	},
	password: {
		presence: true,
		length: {
			minimum: 8
		}
	}
}
```
> **options** *(optional)* is an object which indicates how the validate.js library handles validation errors and messages. Allowed options include **fullMessages**,  **prettify** and **format** as seen [here](https://validatejs.org/#validate)

> **defaultValues** *(optioinal)* an object which indicates the values to be validated against initially, if not provided, all field values would be treated initally as null.

```javascript
const defaultValues = {
	username: 'john',
	password: 'password'
}
```
- **Using the validator in the react component**
Ensure the name of the input field corresponds to the object key in the validation constriants.
```javascript
<input type="text" name="username" />
```
> the validation instance has a controls property  `validator.controls` that holds the control error object of each field. The control error object has two important fields
> - **errors** - an array holding all validation errors of the field
> - **touched** - indicating if the control field has been interacted with

 getting a reference to the username and password field can be done thus
```javascript
const usernameErrors = validator.controls.username.errors
```
 same can be done to access the touched property
```javascript
const usernameTouched = validator.controls.username.touched
```
The errors can be displayed in a react app as follows
```javascript
<div>{usernameTouched && usernameErrors.map((error, i) => (
	<div  key={i}>{error}</div>
))}</div>
```
> **Note:** the *touched* check should be done, otherwise errors would show up without the user interacting with the form.

- **Validating a form**
To validate input values in a form, add an onChange listener to the form and call the validate method in its callback passing the event and a callback function to be executed once validation is done
```javascript
onChange = (event) => {
	// Note: a react app, the event should be the native event which can be gotten with event.nativeEvent
	validator.validate(event.nativeEvent, (valid) => {
		// callback to be run once validation is done, the valid argument indicates if the form is valid or not
		// carry out some action to indicate the validation state, for a react app, this can be simply done by updating the state
		this.setState({valid});
	});
}
```
A check can also be added on submit of the form, incase the user tends to bypase onchange validation. Conventionally, all errors should show up after submitting the form, this can be done by calling the `validator.touchAll(callback)` function in the onsubmit handler which bypassing the touched check 
```javascript
onSubmit  = (event) => {
	event.preventDefault();
	if (!this.state.valid) {
		validator.touchAll((valid) => {
			// call set state to trigger a rerender
			this.setState({ valid });
		});
		return;
	}
	...
}
```

**See example of full react component with form validation below**

```javascript
import React from 'react'
import FormValidate from 'form-validate.js';

const constraint = {
	username: {
		presence: true
	},
	password: {
		presence: true,
		length: {
			minimum: 8
		}
	}
};

const validator = new FormValidate(constraint);

class MyComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			valid: false
		}
	}

	render() {
		// destructure out the controls property
		const { controls } = validator;
		return (
			<div>
				<form onChange={this.validateForm} onSubmit={this.onSubmit}>
					<input type="text" name="username" />
					{/* display all username errors if field touched */}
					<div>{controls.username.touched && controls.username.errors.map((error, i) => (
						<div  key={i}>{error}</div>
					))}</div>
					<input type="password" name="password" />
					{/* display first password error at all times if any exists */}
					<div>{controls.password.errors[0]}</div>
					{/* disable submit button based on the form valid state */}
					<button disabled={!this.state.valid}>Submit</button>
				</form>
			</div>
		);
	}

	validateForm = (event) => {
		// get nativeEvent out of the react change event.
		validator.validate(event.nativeEvent, (valid) =>  {
			this.setState({ valid })
		});
	}
	
	onSubmit = (event) => {
		event.preventDefault();
		if (!this.state.valid) {
			validator.touchAll((valid) => {
				// call set state to trigger a rerender
				this.setState({ valid });
			});
			return;
		}
	}
}  

export default MyComponent;
```